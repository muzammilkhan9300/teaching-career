import { Router } from 'express'
import { ContactMessage } from '../models/ContactMessage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { contactMessageBodySchema } from '../validation/contactMessage.js'

export const contactMessagesRouter = Router()

contactMessagesRouter.post(
  '/',
  writeLimiter,
  asyncHandler(async (req, res) => {
    const body = contactMessageBodySchema.parse(req.body)
    const message = await ContactMessage.create(body)
    res.status(201).json(message)
  }),
)
