import { Router } from 'express'
import { Admin } from '../models/Admin.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { loginLimiter } from '../middleware/rateLimiter.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { ADMIN_COOKIE_NAME, adminCookieOptions, signAdminToken } from '../lib/jwt.js'
import { adminLoginSchema } from '../validation/adminAuth.js'
import { HttpError } from '../utils/HttpError.js'

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

    const token = signAdminToken({ sub: admin.id, email: admin.email })
    res.cookie(ADMIN_COOKIE_NAME, token, adminCookieOptions)
    res.json(admin)
  }),
)

adminAuthRouter.post('/logout', (_req, res) => {
  res.clearCookie(ADMIN_COOKIE_NAME, { ...adminCookieOptions, maxAge: undefined })
  res.status(204).end()
})

adminAuthRouter.get('/me', requireAdmin, (req, res) => {
  res.json(req.admin)
})
