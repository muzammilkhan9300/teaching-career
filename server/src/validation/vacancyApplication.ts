import { z } from 'zod'

export const vacancyApplicationBodySchema = z.object({
  applicantName: z.string().min(2),
  applicantEmail: z.string().email(),
  applicantPhone: z.string().min(7),
  coverNote: z.string().optional(),
})

export type VacancyApplicationBody = z.infer<typeof vacancyApplicationBodySchema>
