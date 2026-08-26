import { Router } from 'express'
import type { Model } from 'mongoose'
import type { ZodType } from 'zod'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import { logAction } from '../../lib/audit.js'
import { HttpError, NotFoundError } from '../../utils/HttpError.js'

interface CrudRouterOptions {
  /** Human/audit-log name for this resource, e.g. "Vacancy". */
  resourceName: string
  /**
   * Named status transitions (Close/Publish/Archive/Restore/Suspend/...),
   * keyed by the action name the client sends as `{ action: "..." }` to
   * `PATCH /:id/status`. Each mutator sets whatever field(s) that action
   * means for this model — kept resource-specific since Vacancy uses two
   * booleans (active/archived) while School/Candidate/BlogPost/Service use
   * a status enum.
   */
  statusActions?: Record<string, (doc: any) => void>
}

/**
 * A small, reused CRUD router factory for the admin-managed public listings
 * (Vacancy/School/Candidate/BlogPost/Service). Public GET reads live on the
 * existing public routers — this only adds the authenticated write side.
 */
export function createAdminCrudRouter(model: Model<any>, schema: ZodType<any>, options: CrudRouterOptions) {
  const router = Router()
  router.use(requireAdmin)

  // Unlike the public GET for this resource (which filters out
  // archived/suspended/draft records), the admin list shows everything so
  // archived/suspended items can actually be found and restored.
  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const docs = await model.find().sort({ createdAt: -1 })
      res.json(docs)
    }),
  )

  router.post(
    '/',
    requirePermission('manageContent'),
    asyncHandler(async (req, res) => {
      const data = schema.parse(req.body)
      const doc = await model.create(data)
      logAction(req, 'create', options.resourceName, doc.id)
      res.status(201).json(doc)
    }),
  )

  router.put(
    '/:id',
    requirePermission('manageContent'),
    asyncHandler(async (req, res) => {
      const data = schema.parse(req.body)
      const doc = await model.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      if (!doc) throw new NotFoundError()
      logAction(req, 'update', options.resourceName, doc.id)
      res.json(doc)
    }),
  )

  if (options.statusActions) {
    router.patch(
      '/:id/status',
      requirePermission('manageContent'),
      asyncHandler(async (req, res) => {
        const action = typeof req.body?.action === 'string' ? req.body.action : undefined
        const mutate = action ? options.statusActions?.[action] : undefined
        if (!mutate) {
          throw new HttpError(400, `Unknown status action. Expected one of: ${Object.keys(options.statusActions ?? {}).join(', ')}`)
        }
        const doc = await model.findById(req.params.id)
        if (!doc) throw new NotFoundError()
        mutate(doc)
        await doc.save()
        logAction(req, action!, options.resourceName, doc.id)
        res.json(doc)
      }),
    )
  }

  router.delete(
    '/:id',
    requirePermission('hardDelete'),
    asyncHandler(async (req, res) => {
      const doc = await model.findByIdAndDelete(req.params.id)
      if (!doc) throw new NotFoundError()
      logAction(req, 'delete', options.resourceName, req.params.id)
      res.status(204).end()
    }),
  )

  return router
}
