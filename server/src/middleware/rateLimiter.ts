import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

// Outside production (local dev, automated testing) these budgets are far
// too tight for realistic iteration — every dev/tester shares one IP
// (localhost), so a normal afternoon of manual + automated testing
// exhausts a 10-per-15-min budget in minutes and then locks out real
// interactive use until the server restarts. Keep production's limits
// tight for actual abuse resistance; widen them elsewhere.
const isProd = env.nodeEnv === 'production'

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 30 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many submissions from this device. Please try again later.' },
})

// Tighter limit on admin login attempts to slow down credential guessing.
// A separate instance from userAuthLimiter below — sharing one limiter
// across unrelated endpoints would let a burst on one (e.g. public sign-ups
// from an office IP) lock out the other (admin login from that same IP).
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
})

// Public site register/login/forgot-password/reset-password — own budget,
// isolated from admin login's.
export const userAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
})
