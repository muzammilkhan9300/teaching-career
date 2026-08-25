import { z } from 'zod'

export const contactMessageBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(5),
})

export type ContactMessageBody = z.infer<typeof contactMessageBodySchema>
