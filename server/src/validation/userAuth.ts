import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  email: z.string().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().optional(),
})
