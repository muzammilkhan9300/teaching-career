import { Router } from 'express'
import { School } from '../models/School.js'
import { Vacancy } from '../models/Vacancy.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { NotFoundError } from '../utils/HttpError.js'

export const schoolsRouter = Router()

schoolsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const schools = await School.find().sort({ createdAt: -1 })
    res.json(schools)
  }),
)

schoolsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const school = await School.findById(req.params.id)
    if (!school) throw new NotFoundError('School not found')

    const activeVacancies = await Vacancy.find({ schoolId: school.id, active: true })
    res.json({ ...school.toJSON(), activeVacancies })
  }),
)
