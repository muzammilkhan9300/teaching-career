import { Router } from 'express'
import { HomeTutorRequest } from '../models/HomeTutorRequest.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { homeTutorRequestBodySchema } from '../validation/homeTutorRequest.js'
import { notify } from '../lib/notify.js'

export const homeTutorRequestsRouter = Router()

homeTutorRequestsRouter.post(
  '/',
  writeLimiter,
  asyncHandler(async (req, res) => {
    const body = homeTutorRequestBodySchema.parse(req.body)
    const request = await HomeTutorRequest.create({ ...body, requestStatus: 'New' })
    notify('home-tutor-request', `New home tutor request from ${request.parentName}`, '/admin/home-tutor-requests')
    res.status(201).json(request)
  }),
)
