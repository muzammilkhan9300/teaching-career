import { z } from 'zod'

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

export const statusUpdateSchema = z.object({
  status: z.string().min(1),
})
