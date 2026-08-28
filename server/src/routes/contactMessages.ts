import { Router } from 'express'
import { ContactMessage } from '../models/ContactMessage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { requireUser } from '../middleware/requireUser.js'
import { contactMessageBodySchema } from '../validation/contactMessage.js'
import { notify } from '../lib/notify.js'
import { sendContactEmail } from '../lib/mailer.js'

export const contactMessagesRouter = Router()

contactMessagesRouter.post(
  '/',
  requireUser,
  writeLimiter,
  asyncHandler(async (req, res) => {
    const body = contactMessageBodySchema.parse(req.body)
    const message = await ContactMessage.create(body)
    notify('contact-message', `New contact message from ${message.name}`, '/admin/contact-messages')
    sendContactEmail(body)
    res.status(201).json(message)
  }),
)
