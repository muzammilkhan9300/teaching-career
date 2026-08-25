import { Router } from 'express'
import { Candidate } from '../models/Candidate.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { NotFoundError } from '../utils/HttpError.js'

export const candidatesRouter = Router()

const DEFAULT_PAGE_SIZE = 4

candidatesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {}

    const city = typeof req.query.city === 'string' ? req.query.city : undefined
    if (city && city !== 'All Cities') filter.city = city

    const teachingType = typeof req.query.teachingType === 'string' ? req.query.teachingType : undefined
    if (teachingType && teachingType !== 'All Teaching Types') filter['tags.0'] = teachingType

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
    if (search) {
      const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [{ name: pattern }, { role: pattern }, { qualification: pattern }]
    }

    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.max(1, Number(req.query.limit) || DEFAULT_PAGE_SIZE)

    const [items, total] = await Promise.all([
      Candidate.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Candidate.countDocuments(filter),
    ])

    res.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) })
  }),
)

candidatesRouter.get(
  '/filters',
  asyncHandler(async (_req, res) => {
    const [cities, teachingTypes] = await Promise.all([
      Candidate.distinct('city'),
      Candidate.distinct('tags.0'),
    ])
    res.json({
      cities: ['All Cities', ...cities.sort()],
      teachingTypes: ['All Teaching Types', ...teachingTypes.sort()],
    })
  }),
)

candidatesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const candidate = await Candidate.findById(req.params.id)
    if (!candidate) throw new NotFoundError('Candidate not found')
    res.json(candidate)
  }),
)
