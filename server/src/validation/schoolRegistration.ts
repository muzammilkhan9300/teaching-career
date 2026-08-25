import { z } from 'zod'

export const schoolRegistrationBodySchema = z.object({
  schoolName: z.string().min(2),
  schoolCity: z.string().min(1),
  schoolArea: z.string().min(1),
  schoolYear: z.string().min(1),
  schoolBranches: z.string().optional(),
  schoolWebsite: z.string().optional(),
  schoolWhatsapp: z.string().min(7),
  schoolPhone: z.string().min(7),
  schoolType: z.string().optional(),
  schoolBoard: z.string().optional(),
  schoolGrades: z.string().optional(),
  schoolDesc: z.string().optional(),
})

export type SchoolRegistrationBody = z.infer<typeof schoolRegistrationBodySchema>
