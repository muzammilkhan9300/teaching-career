import { z } from 'zod'

const jsonArray = z.preprocess((val) => {
  if (typeof val !== 'string') return val
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : val
  } catch {
    return val
  }
}, z.array(z.string()).default([]))

const boolString = z.preprocess((val) => val === 'true' || val === true, z.boolean())

export const candidateRegistrationBodySchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().min(7),
  city: z.string().min(1),
  area: z.string().min(1),
  gender: z.string().optional(),
  qualification: z.string().min(1),
  degreeName: z.string().min(1),
  major: z.string().min(1),
  institute: z.string().min(1),
  completionYear: z.string().optional(),
  isFresher: z.enum(['yes', 'no']),
  experienceYears: z.string().optional(),
  experienceOrg: z.string().optional(),
  experienceDetails: z.string().optional(),
  teachWhere: jsonArray.refine((arr) => arr.length > 0, 'Select at least one teaching preference.'),
  subjects: jsonArray.refine((arr) => arr.length > 0, 'Select at least one subject.'),
  subjectOther: z.string().optional(),
  classes: jsonArray,
  classOther: z.string().optional(),
  availability: z.string().optional(),
  preferredTime: z.string().optional(),
  declaration: boolString.refine((v) => v === true, 'Declaration must be confirmed.'),
})

export type CandidateRegistrationBody = z.infer<typeof candidateRegistrationBodySchema>
