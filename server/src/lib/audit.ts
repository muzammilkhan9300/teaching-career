import type { Request } from 'express'
import { AuditLog } from '../models/AuditLog.js'

/**
 * Fire-and-forget audit trail entry. Never throws into the request path —
 * a logging failure should not block the admin action it's recording.
 */
export function logAction(
  req: Request,
  action: string,
  resource: string,
  resourceId?: string,
  details?: string,
) {
  const adminId = req.admin?.id
  const adminEmail = req.admin?.email ?? 'unknown'
  AuditLog.create({ adminId, adminEmail, action, resource, resourceId, details }).catch((err) => {
    console.error('[audit] failed to record action', err)
  })
}
