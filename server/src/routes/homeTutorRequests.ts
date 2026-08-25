import { Router } from 'express'
import { HomeTutorRequest } from '../models/HomeTutorRequest.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { homeTutorRequestBodySchema } from '../validation/homeTutorRequest.js'

export const homeTutorRequestsRouter = Router()

homeTutorRequestsRouter.post(
  '/',
  writeLimiter,
  asyncHandler(async (req, res) => {
    const body = homeTutorRequestBodySchema.parse(req.body)
    const request = await HomeTutorRequest.create({ ...body, requestStatus: 'New' })
    res.status(201).json(request)
  }),
)
