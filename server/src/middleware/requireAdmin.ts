import type { NextFunction, Request, Response } from 'express'
import { Admin, type AdminDoc } from '../models/Admin.js'
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '../lib/jwt.js'
import { HttpError } from '../utils/HttpError.js'
import { asyncHandler } from './asyncHandler.js'

declare global {
  namespace Express {
    interface Request {
      admin?: AdminDoc
    }
  }
}

export const requireAdmin = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME]
  if (!token) throw new HttpError(401, 'Not authenticated')

  let payload
  try {
    payload = verifyAdminToken(token)
  } catch {
    throw new HttpError(401, 'Session expired, please log in again')
  }

  const admin = await Admin.findById(payload.sub)
  if (!admin) throw new HttpError(401, 'Not authenticated')
  if (!admin.active) throw new HttpError(401, 'This account has been suspended.')

  req.admin = admin
  next()
})
