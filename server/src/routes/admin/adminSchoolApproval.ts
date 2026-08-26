import { Router } from 'express'
import { SchoolRegistration } from '../../models/SchoolRegistration.js'
import { School } from '../../models/School.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import { logAction } from '../../lib/audit.js'
import { HttpError, NotFoundError } from '../../utils/HttpError.js'

export const adminSchoolApprovalRouter = Router()
adminSchoolApprovalRouter.use(requireAdmin, requirePermission('reviewSubmissions'))

const DEFAULT_SCHOOL_PHOTO = '/assets/images/school-placeholder-1.jpg'

async function loadPendingRegistration(id: string) {
  const registration = await SchoolRegistration.findById(id)
  if (!registration) throw new NotFoundError('Registration not found')
  if (registration.registrationStatus === 'Approved' || registration.registrationStatus === 'Rejected') {
    throw new HttpError(400, `This registration was already ${registration.registrationStatus.toLowerCase()}.`)
  }
  return registration
}

adminSchoolApprovalRouter.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const registration = await loadPendingRegistration(req.params.id)

    const school = await School.create({
      name: registration.schoolName,
      city: registration.schoolCity,
      area: registration.schoolArea,
      curriculum: registration.schoolBoard || 'Not specified',
      tag: registration.schoolType || registration.schoolBoard || 'Registered',
      registered: true,
      photo: registration.schoolLogoPath || DEFAULT_SCHOOL_PHOTO,
      subjects: registration.schoolGrades || 'Not specified',
      about: registration.schoolDesc || `${registration.schoolName} is a registered institution based in ${registration.schoolCity}.`,
      status: 'Active',
    })

    registration.registrationStatus = 'Approved'
    await registration.save()

    logAction(req, 'approve', 'SchoolRegistration', registration.id, `Approved and promoted to School ${school.id}`)
    res.json({ registration, school })
  }),
)

adminSchoolApprovalRouter.post(
  '/:id/reject',
  asyncHandler(async (req, res) => {
    const registration = await loadPendingRegistration(req.params.id)
    registration.registrationStatus = 'Rejected'
    await registration.save()

    logAction(req, 'reject', 'SchoolRegistration', registration.id)
    res.json(registration)
  }),
)
