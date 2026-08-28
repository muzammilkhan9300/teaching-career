import type { NextFunction, Request, Response } from 'express'
import { User, type UserDoc } from '../models/User.js'
import { USER_COOKIE_NAME, verifyUserToken } from '../lib/jwt.js'
import { HttpError } from '../utils/HttpError.js'
import { asyncHandler } from './asyncHandler.js'

declare global {
  namespace Express {
    interface Request {
      /** The signed-in staff member for this request (role !== 'user'). */
      admin?: UserDoc
    }
  }
}

/**
 * Gate for every /api/admin/* route. Same session/cookie as the public site
 * (there is only one account system) — this only additionally requires the
 * signed-in account's role to be staff-level. A plain 'user' account gets a
 * 403, same as a logged-out visitor gets a 401.
 */
export const requireAdmin = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[USER_COOKIE_NAME]
  if (!token) throw new HttpError(401, 'Not authenticated')

  let payload
  try {
    payload = verifyUserToken(token)
  } catch {
    throw new HttpError(401, 'Session expired, please log in again')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw new HttpError(401, 'Not authenticated')
  if (!user.active) throw new HttpError(401, 'This account has been suspended.')
  if (user.role === 'user') throw new HttpError(403, "You don't have permission to access the admin dashboard.")

  req.admin = user
  next()
})
