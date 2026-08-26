import { Router } from 'express'
import { Service } from '../models/Service.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

export const servicesRouter = Router()

servicesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const services = await Service.find({ status: 'Published' }).sort({ order: 1, createdAt: 1 })
    res.json(services)
  }),
)
