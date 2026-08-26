import { Router } from 'express'
import { Admin } from '../models/Admin.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { loginLimiter } from '../middleware/rateLimiter.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { ADMIN_COOKIE_NAME, adminCookieOptions, signAdminToken, verifyAdminToken } from '../lib/jwt.js'
import { adminLoginSchema } from '../validation/adminAuth.js'
import { HttpError } from '../utils/HttpError.js'
import { logAction } from '../lib/audit.js'

export const adminAuthRouter = Router()

adminAuthRouter.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = adminLoginSchema.parse(req.body)

    const admin = await Admin.findOne({ email: email.toLowerCase() })
    const valid = admin ? await admin.comparePassword(password) : false
    if (!admin || !valid) {
      throw new HttpError(401, 'Invalid email or password.')
    }
    if (!admin.active) {
      throw new HttpError(401, 'This account has been suspended. Contact a super admin.')
    }

    const token = signAdminToken({ sub: admin.id, email: admin.email })
    res.cookie(ADMIN_COOKIE_NAME, token, adminCookieOptions)
    req.admin = admin
    logAction(req, 'login', 'Admin', admin.id)
    res.json(admin)
  }),
)

adminAuthRouter.post('/logout', (req, res) => {
  // Best-effort audit entry — logout must succeed even with an expired/missing
  // token, so this never gates the response the way requireAdmin would.
  const token = req.cookies?.[ADMIN_COOKIE_NAME]
  if (token) {
    try {
      const payload = verifyAdminToken(token)
      logAction(req, 'logout', 'Admin', payload.sub, payload.email)
    } catch {
      // expired/invalid token — nothing to log, still clear the cookie below
    }
  }
  res.clearCookie(ADMIN_COOKIE_NAME, { ...adminCookieOptions, maxAge: undefined })
  res.status(204).end()
})

adminAuthRouter.get('/me', requireAdmin, (req, res) => {
  res.json(req.admin)
})
