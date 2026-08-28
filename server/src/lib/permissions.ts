import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '../models/User.js'
import { HttpError } from '../utils/HttpError.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

export type Capability =
  | 'manageStaff'
  | 'manageSettings'
  | 'viewAuditLogs'
  | 'viewReports'
  | 'manageContent'
  | 'reviewSubmissions'
  | 'hardDelete'

const ROLE_CAPABILITIES: Record<UserRole, Capability[]> = {
  user: [],
  super_admin: ['manageStaff', 'manageSettings', 'viewAuditLogs', 'viewReports', 'manageContent', 'reviewSubmissions', 'hardDelete'],
  admin: ['viewReports', 'manageContent', 'reviewSubmissions', 'hardDelete'],
  moderator: ['reviewSubmissions'],
}

export function roleHasCapability(role: UserRole, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role]?.includes(capability) ?? false
}

/** Must run after `requireAdmin` — reads `req.admin` it attaches. */
export function requirePermission(capability: Capability) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const role = req.admin?.role as UserRole | undefined
    if (!role || !roleHasCapability(role, capability)) {
      throw new HttpError(403, "You don't have permission to perform this action.")
    }
    next()
  })
}
