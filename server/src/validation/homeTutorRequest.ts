import { z } from 'zod'

export const homeTutorRequestBodySchema = z.object({
  parentName: z.string().min(2),
  parentEmail: z.string().email(),
  parentWhatsapp: z.string().min(7),
  parentCity: z.string().min(1),
  parentArea: z.string().min(1),
  contactTime: z.string().optional(),
  studentName: z.string().min(2),
  studentClass: z.string().min(1),
  studentGender: z.string().optional(),
  subjectsNeeded: z.string().min(1),
  syllabus: z.string().optional(),
  purpose: z.string().optional(),
  daysPerWeek: z.string().optional(),
  preferredTime: z.string().optional(),
  tuitionLocation: z.string().optional(),
  urgency: z.string().optional(),
  additionalReq: z.string().optional(),
  parentMessage: z.string().optional(),
  agreeTerms: z.literal(true),
})

export type HomeTutorRequestBody = z.infer<typeof homeTutorRequestBodySchema>
