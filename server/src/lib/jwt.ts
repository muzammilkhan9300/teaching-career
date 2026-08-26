import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface AdminTokenPayload {
  sub: string
  email: string
}

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] })
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AdminTokenPayload
}

export const ADMIN_COOKIE_NAME = 'tc_admin_token'

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.nodeEnv === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}
