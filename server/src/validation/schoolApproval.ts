import { z } from 'zod'

export const rejectSchoolSchema = z.object({
  reason: z.string().min(3, 'Please explain why this registration is being rejected.'),
})
