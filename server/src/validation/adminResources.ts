import { z } from 'zod'
import { SERVICE_ICON_KEYS } from '../models/Service.js'

export const vacancyInputSchema = z.object({
  title: z.string().min(2),
  school: z.string().min(1),
  schoolId: z.string().min(1),
  subject: z.string().min(1),
  qualification: z.string().min(1),
  experience: z.string().min(1),
  curriculum: z.string().min(1),
  employmentType: z.enum(['Full Time', 'Part Time']),
  salaryRange: z.string().min(1),
  city: z.string().min(1),
  area: z.string().min(1),
  joiningDate: z.string().min(1),
  teachersNeeded: z.coerce.number().int().min(1),
  description: z.string().min(1),
  active: z.coerce.boolean().default(true),
})

export const schoolInputSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(1),
  area: z.string().min(1),
  curriculum: z.string().min(1),
  tag: z.string().min(1),
  registered: z.coerce.boolean().default(true),
  photo: z.string().min(1),
  subjects: z.string().min(1),
  about: z.string().min(1),
})

export const candidateInputSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(1),
  city: z.string().min(1),
  area: z.string().min(1),
  qualification: z.string().min(1),
  experience: z.string().min(1),
  tags: z.array(z.string()).default([]),
  verified: z.coerce.boolean().default(true),
  photo: z.string().default(''),
})

export const blogPostInputSchema = z.object({
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only.'),
  title: z.string().min(2),
  excerpt: z.string().min(1),
  category: z.string().min(1),
  date: z.string().min(1),
  body: z.array(z.string().min(1)).min(1, 'Add at least one paragraph.'),
})

export const serviceInputSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(1),
  icon: z.enum(SERVICE_ICON_KEYS),
  order: z.coerce.number().int().default(0),
})

export const settingsInputSchema = z.object({
  phone: z.string().min(3),
  phoneSecondary: z.string().optional(),
  whatsapp: z.string().min(3),
  email: z.string().email(),
  address: z.string().min(1),
  social: z.object({
    instagram: z.string().optional().default(''),
    facebook: z.string().optional().default(''),
    linkedin: z.string().optional().default(''),
    youtube: z.string().optional().default(''),
  }),
})

export const statusUpdateSchema = z.object({
  status: z.string().min(1),
})
