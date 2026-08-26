import { Router } from 'express'
import { AuditLog } from '../../models/AuditLog.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'

export const adminAuditLogsRouter = Router()
adminAuditLogsRouter.use(requireAdmin, requirePermission('viewAuditLogs'))

const PAGE_SIZE = 50

adminAuditLogsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const filter: Record<string, unknown> = {}
    if (typeof req.query.resource === 'string' && req.query.resource) filter.resource = req.query.resource
    if (typeof req.query.adminEmail === 'string' && req.query.adminEmail) filter.adminEmail = req.query.adminEmail

    const [items, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE),
      AuditLog.countDocuments(filter),
    ])

    res.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) })
  }),
)
