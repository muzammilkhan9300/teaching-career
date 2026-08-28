import crypto from 'node:crypto'
import { Router } from 'express'
import { User, hashPassword } from '../models/User.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireUser } from '../middleware/requireUser.js'
import { userAuthLimiter } from '../middleware/rateLimiter.js'
import { env } from '../config/env.js'
import { USER_COOKIE_NAME, userCookieOptions, signUserToken } from '../lib/jwt.js'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from '../validation/userAuth.js'
import { HttpError } from '../utils/HttpError.js'

export const userAuthRouter = Router()

const RESET_TOKEN_BYTES = 32
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

userAuthRouter.post(
  '/register',
  userAuthLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body)

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) throw new HttpError(409, 'An account with this email already exists.')

    const passwordHash = await hashPassword(password)
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, authProvider: 'local' })

    const token = signUserToken({ sub: user.id, email: user.email })
    res.cookie(USER_COOKIE_NAME, token, userCookieOptions)
    res.status(201).json(user)
  }),
)

userAuthRouter.post(
  '/login',
  userAuthLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body)

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) throw new HttpError(401, 'Invalid email or password.')
    if (user.authProvider === 'google' && !user.passwordHash) {
      throw new HttpError(401, 'This account uses Google Sign-In. Please continue with Google.')
    }

    const valid = await user.comparePassword(password)
    if (!valid) throw new HttpError(401, 'Invalid email or password.')
    if (!user.active) throw new HttpError(401, 'This account has been suspended.')

    const token = signUserToken({ sub: user.id, email: user.email })
    res.cookie(USER_COOKIE_NAME, token, userCookieOptions)
    res.json(user)
  }),
)

userAuthRouter.post('/logout', (_req, res) => {
  res.clearCookie(USER_COOKIE_NAME, { ...userCookieOptions, maxAge: undefined })
  res.status(204).end()
})

userAuthRouter.get('/me', requireUser, (req, res) => {
  res.json(req.user)
})

userAuthRouter.put(
  '/me',
  requireUser,
  asyncHandler(async (req, res) => {
    const data = updateProfileSchema.parse(req.body)
    if (data.name !== undefined) req.user!.name = data.name
    if (data.avatarUrl !== undefined) req.user!.avatarUrl = data.avatarUrl
    await req.user!.save()
    res.json(req.user)
  }),
)

userAuthRouter.post(
  '/forgot-password',
  userAuthLimiter,
  asyncHandler(async (req, res) => {
    const { email } = forgotPasswordSchema.parse(req.body)
    const user = await User.findOne({ email: email.toLowerCase() })

    // Always respond the same way whether or not the account exists, so this
    // endpoint can't be used to enumerate registered emails.
    const genericResponse = { message: 'If an account with that email exists, a password reset link has been generated.' }

    if (!user) {
      res.json(genericResponse)
      return
    }

    const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex')
    user.passwordResetTokenHash = hashResetToken(rawToken)
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS)
    await user.save()

    const resetUrl = `${env.clientOrigin}/reset-password?token=${rawToken}`

    // No email provider is configured yet — surface the link instead of
    // silently pretending an email went out. Wire a real provider (SMTP /
    // SendGrid / Resend) here and remove `devResetUrl` once one exists.
    if (!env.isProduction) {
      console.log(`[password-reset] ${user.email} -> ${resetUrl}`)
      res.json({ ...genericResponse, devResetUrl: resetUrl })
      return
    }

    res.json(genericResponse)
  }),
)

userAuthRouter.post(
  '/reset-password',
  userAuthLimiter,
  asyncHandler(async (req, res) => {
    const { token, password } = resetPasswordSchema.parse(req.body)
    const tokenHash = hashResetToken(token)

    const user = await User.findOne({ passwordResetTokenHash: tokenHash, passwordResetExpires: { $gt: new Date() } })
    if (!user) throw new HttpError(400, 'This reset link is invalid or has expired.')

    user.passwordHash = await hashPassword(password)
    user.passwordResetTokenHash = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.json({ message: 'Your password has been reset. You can now log in.' })
  }),
)

// ---- Google Sign-In — disabled (503) until GOOGLE_CLIENT_ID/SECRET are set.
// Never fakes a login; the button is hidden client-side until this reports
// configured: true.

function googleConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret)
}

function googleRedirectUri() {
  return env.googleRedirectUri || `${env.clientOrigin}/api/auth/google/callback`
}

userAuthRouter.get('/google/status', (_req, res) => {
  res.json({ configured: googleConfigured() })
})

userAuthRouter.get('/google', (_req, res) => {
  if (!googleConfigured()) throw new HttpError(503, 'Google Sign-In is not configured.')

  const params = new URLSearchParams({
    client_id: env.googleClientId!,
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})

userAuthRouter.get(
  '/google/callback',
  asyncHandler(async (req, res) => {
    if (!googleConfigured()) throw new HttpError(503, 'Google Sign-In is not configured.')

    const code = typeof req.query.code === 'string' ? req.query.code : undefined
    if (!code) {
      res.redirect(`${env.clientOrigin}/login?error=google`)
      return
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.googleClientId!,
        client_secret: env.googleClientSecret!,
        redirect_uri: googleRedirectUri(),
        grant_type: 'authorization_code',
      }),
    })
    if (!tokenRes.ok) {
      res.redirect(`${env.clientOrigin}/login?error=google`)
      return
    }
    const tokenBody = (await tokenRes.json()) as { access_token?: string }
    if (!tokenBody.access_token) {
      res.redirect(`${env.clientOrigin}/login?error=google`)
      return
    }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    })
    if (!profileRes.ok) {
      res.redirect(`${env.clientOrigin}/login?error=google`)
      return
    }
    const profile = (await profileRes.json()) as { sub: string; email?: string; name?: string; picture?: string }

    if (!profile.email) {
      res.redirect(`${env.clientOrigin}/login?error=google`)
      return
    }

    let user = await User.findOne({ googleId: profile.sub })
    if (!user) {
      // Link to an existing local account with the same email, if any.
      user = await User.findOne({ email: profile.email.toLowerCase() })
      if (user) {
        user.googleId = profile.sub
        if (!user.avatarUrl && profile.picture) user.avatarUrl = profile.picture
        await user.save()
      } else {
        user = await User.create({
          name: profile.name || profile.email.split('@')[0],
          email: profile.email.toLowerCase(),
          authProvider: 'google',
          googleId: profile.sub,
          avatarUrl: profile.picture || '',
        })
      }
    }

    if (!user.active) {
      res.redirect(`${env.clientOrigin}/login?error=suspended`)
      return
    }

    const token = signUserToken({ sub: user.id, email: user.email })
    res.cookie(USER_COOKIE_NAME, token, userCookieOptions)
    res.redirect(env.clientOrigin)
  }),
)
