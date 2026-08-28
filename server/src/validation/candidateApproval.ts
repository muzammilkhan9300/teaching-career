import { z } from 'zod'

export const rejectCandidateApplicationSchema = z.object({
  reason: z.string().min(3, 'Please explain why this application is being rejected.'),
})
