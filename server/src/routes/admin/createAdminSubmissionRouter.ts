import { Router } from 'express'
import type { Model } from 'mongoose'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import { logAction } from '../../lib/audit.js'
import { NotFoundError } from '../../utils/HttpError.js'
import { statusUpdateSchema } from '../../validation/adminResources.js'

/**
 * Read + status-update + delete for the public-form submission collections
 * (candidate applications, school registrations, home-tutor requests,
 * contact messages, vacancy applications). Each model tracks its status in
 * a differently-named field (`applicationStatus`, `registrationStatus`, ...)
 * — `statusField` maps the generic {status} request body onto it.
 */
export function createAdminSubmissionRouter(model: Model<any>, statusField: string, resourceName: string) {
  const router = Router()
  router.use(requireAdmin)

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const items = await model.find().sort({ createdAt: -1 })
      res.json(items)
    }),
  )

  router.patch(
    '/:id/status',
    requirePermission('reviewSubmissions'),
    asyncHandler(async (req, res) => {
      const { status } = statusUpdateSchema.parse(req.body)
      const doc = await model.findByIdAndUpdate(req.params.id, { [statusField]: status }, { new: true })
      if (!doc) throw new NotFoundError()
      logAction(req, 'status-change', resourceName, doc.id, status)
      res.json(doc)
    }),
  )

  router.delete(
    '/:id',
    requirePermission('hardDelete'),
    asyncHandler(async (req, res) => {
      const doc = await model.findByIdAndDelete(req.params.id)
      if (!doc) throw new NotFoundError()
      logAction(req, 'delete', resourceName, req.params.id)
      res.status(204).end()
    }),
  )

  return router
}
