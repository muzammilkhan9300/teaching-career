import { z } from 'zod'
import { ADMIN_ROLES } from '../models/Admin.js'

export const createStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(ADMIN_ROLES),
})

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(ADMIN_ROLES).optional(),
  active: z.coerce.boolean().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters.').optional(),
})
