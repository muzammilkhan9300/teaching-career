import { Router } from 'express'
import { Vacancy } from '../models/Vacancy.js'
import { VacancyApplication } from '../models/VacancyApplication.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { NotFoundError } from '../utils/HttpError.js'

export const vacanciesRouter = Router()

vacanciesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {}
    if (req.query.schoolId) filter.schoolId = req.query.schoolId
    if (req.query.active !== undefined) filter.active = req.query.active === 'true'

    const vacancies = await Vacancy.find(filter).sort({ createdAt: -1 })
    res.json(vacancies)
  }),
)

vacanciesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const vacancy = await Vacancy.findById(req.params.id)
    if (!vacancy) throw new NotFoundError('Vacancy not found')
    res.json(vacancy)
  }),
)

vacanciesRouter.post(
  '/:id/apply',
  writeLimiter,
  asyncHandler(async (req, res) => {
    const vacancy = await Vacancy.findById(req.params.id)
    if (!vacancy) throw new NotFoundError('Vacancy not found')

    const application = await VacancyApplication.create({
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.title,
      schoolId: vacancy.schoolId,
      applicationStatus: 'Applied',
    })
    res.status(201).json(application)
  }),
)
