import { Router } from 'express'
import { ContactMessage } from '../models/ContactMessage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { contactMessageBodySchema } from '../validation/contactMessage.js'
import { notify } from '../lib/notify.js'

export const contactMessagesRouter = Router()

contactMessagesRouter.post(
  '/',
  writeLimiter,
  asyncHandler(async (req, res) => {
    const body = contactMessageBodySchema.parse(req.body)
    const message = await ContactMessage.create(body)
    notify('contact-message', `New contact message from ${message.name}`, '/admin/contact-messages')
    res.status(201).json(message)
  }),
)
