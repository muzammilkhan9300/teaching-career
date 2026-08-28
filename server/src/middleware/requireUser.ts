import type { NextFunction, Request, Response } from 'express'
import { User, type UserDoc } from '../models/User.js'
import { USER_COOKIE_NAME, verifyUserToken } from '../lib/jwt.js'
import { HttpError } from '../utils/HttpError.js'
import { asyncHandler } from './asyncHandler.js'

declare global {
  namespace Express {
    interface Request {
      user?: UserDoc
    }
  }
}

export const requireUser = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
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

  req.user = user
  next()
})
