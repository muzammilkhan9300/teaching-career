import { Router } from 'express'
import type { Model } from 'mongoose'
import type { ZodType } from 'zod'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { NotFoundError } from '../../utils/HttpError.js'

/**
 * A small, reused CRUD router factory for the admin-managed public listings
 * (Vacancy/School/Candidate). Public GET reads live on the existing public
 * routers — this only adds the authenticated write side.
 */
export function createAdminCrudRouter(model: Model<any>, schema: ZodType<any>) {
  const router = Router()
  router.use(requireAdmin)

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const data = schema.parse(req.body)
      const doc = await model.create(data)
      res.status(201).json(doc)
    }),
  )

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const data = schema.parse(req.body)
      const doc = await model.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      if (!doc) throw new NotFoundError()
      res.json(doc)
    }),
  )

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const doc = await model.findByIdAndDelete(req.params.id)
      if (!doc) throw new NotFoundError()
      res.status(204).end()
    }),
  )

  return router
}
