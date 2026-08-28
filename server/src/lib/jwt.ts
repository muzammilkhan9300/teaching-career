import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

// One session type for every account — public visitor or staff. What a
// session can do is decided by the User's `role`, checked in
// middleware/requireAdmin.ts and lib/permissions.ts, never by which cookie
// exists.

export interface UserTokenPayload {
  sub: string
  email: string
  type: 'user'
}

export function signUserToken(payload: Omit<UserTokenPayload, 'type'>) {
  return jwt.sign({ ...payload, type: 'user' }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] })
}

export function verifyUserToken(token: string): UserTokenPayload {
  const payload = jwt.verify(token, env.jwtSecret) as UserTokenPayload
  if (payload.type !== 'user') throw new Error('Not a user token')
  return payload
}

export const USER_COOKIE_NAME = 'tc_user_token'

export const userCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.nodeEnv === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}
