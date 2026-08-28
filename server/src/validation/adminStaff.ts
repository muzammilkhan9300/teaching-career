import { z } from 'zod'
import { USER_ROLES } from '../models/User.js'

// Staff accounts are always created/edited with a staff-level role — 'user'
// is the public default and isn't a meaningful choice on this form.
const STAFF_ROLES = USER_ROLES.filter((r) => r !== 'user') as Exclude<(typeof USER_ROLES)[number], 'user'>[]

export const createStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(STAFF_ROLES as [string, ...string[]]),
})

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(STAFF_ROLES as [string, ...string[]]).optional(),
  active: z.coerce.boolean().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters.').optional(),
})
