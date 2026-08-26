import { Router } from 'express'
import { Admin, hashPassword } from '../../models/Admin.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import { logAction } from '../../lib/audit.js'
import { HttpError, NotFoundError } from '../../utils/HttpError.js'
import { createStaffSchema, updateStaffSchema } from '../../validation/adminStaff.js'

export const adminStaffRouter = Router()
adminStaffRouter.use(requireAdmin, requirePermission('manageStaff'))

async function assertNotLastSuperAdmin(excludeId: string) {
  const remaining = await Admin.countDocuments({ role: 'super_admin', active: true, _id: { $ne: excludeId } })
  if (remaining === 0) {
    throw new HttpError(400, 'At least one active super admin must remain.')
  }
}

adminStaffRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const staff = await Admin.find().sort({ createdAt: -1 })
    res.json(staff)
  }),
)

adminStaffRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createStaffSchema.parse(req.body)
    const existing = await Admin.findOne({ email: data.email.toLowerCase() })
    if (existing) throw new HttpError(409, 'An account with this email already exists.')

    const passwordHash = await hashPassword(data.password)
    const staff = await Admin.create({ name: data.name, email: data.email.toLowerCase(), passwordHash, role: data.role })
    logAction(req, 'create', 'Admin', staff.id, `Created staff account ${staff.email} (${staff.role})`)
    res.status(201).json(staff)
  }),
)

adminStaffRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = updateStaffSchema.parse(req.body)
    const staff = await Admin.findById(req.params.id)
    if (!staff) throw new NotFoundError('Staff account not found')

    const demotingOrDeactivatingSuperAdmin =
      staff.role === 'super_admin' && ((data.role && data.role !== 'super_admin') || data.active === false)
    if (demotingOrDeactivatingSuperAdmin) {
      await assertNotLastSuperAdmin(staff.id)
    }

    if (data.name !== undefined) staff.name = data.name
    if (data.role !== undefined) staff.role = data.role
    if (data.active !== undefined) staff.active = data.active
    if (data.password) staff.passwordHash = await hashPassword(data.password)

    await staff.save()
    logAction(req, 'update', 'Admin', staff.id, `Updated staff account ${staff.email}`)
    res.json(staff)
  }),
)
