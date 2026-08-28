import { Router } from 'express'
import { School } from '../models/School.js'
import { Vacancy } from '../models/Vacancy.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { NotFoundError } from '../utils/HttpError.js'

export const schoolsRouter = Router()

schoolsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const schools = await School.find({ status: 'Active' }).sort({ createdAt: -1 })

    const counts = await Vacancy.aggregate([
      { $match: { active: true, archived: false, schoolId: { $in: schools.map((s) => s._id) } } },
      { $group: { _id: '$schoolId', count: { $sum: 1 } } },
    ])
    const countBySchoolId = new Map(counts.map((c) => [String(c._id), c.count as number]))

    res.json(schools.map((s) => ({ ...s.toJSON(), activeVacancyCount: countBySchoolId.get(String(s._id)) ?? 0 })))
  }),
)

schoolsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const school = await School.findOne({ _id: req.params.id, status: 'Active' })
    if (!school) throw new NotFoundError('School not found')

    const activeVacancies = await Vacancy.find({ schoolId: school.id, active: true, archived: false })
    res.json({ ...school.toJSON(), activeVacancies, activeVacancyCount: activeVacancies.length })
  }),
)
