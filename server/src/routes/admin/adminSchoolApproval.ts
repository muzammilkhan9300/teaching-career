import { Router } from 'express'
import { SchoolRegistration } from '../../models/SchoolRegistration.js'
import { School } from '../../models/School.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import { logAction } from '../../lib/audit.js'
import { HttpError, NotFoundError } from '../../utils/HttpError.js'
import { rejectSchoolSchema } from '../../validation/schoolApproval.js'

export const adminSchoolApprovalRouter = Router()
adminSchoolApprovalRouter.use(requireAdmin, requirePermission('reviewSubmissions'))

const DEFAULT_SCHOOL_PHOTO = '/assets/images/school-placeholder-1.jpg'

// Reviewable states are 'Pending' (first submission) and 'Resubmitted' (an
// edit after a prior Approved/Rejected decision) — 'Approved'/'Rejected'
// are terminal until the owner acts again, so re-approving/re-rejecting
// those directly is blocked here.
async function loadReviewableRegistration(id: string) {
  const registration = await SchoolRegistration.findById(id)
  if (!registration) throw new NotFoundError('Registration not found')
  if (registration.registrationStatus === 'Approved' || registration.registrationStatus === 'Rejected') {
    throw new HttpError(400, `This registration was already ${registration.registrationStatus.toLowerCase()}.`)
  }
  return registration
}

function schoolFieldsFrom(registration: InstanceType<typeof SchoolRegistration>) {
  return {
    name: registration.schoolName,
    city: registration.schoolCity,
    area: registration.schoolArea,
    curriculum: registration.schoolBoard || 'Not specified',
    tag: registration.schoolType || registration.schoolBoard || 'Registered',
    registered: true,
    photo: registration.schoolLogoPath || DEFAULT_SCHOOL_PHOTO,
    subjects: registration.schoolGrades || 'Not specified',
    about: registration.schoolDesc || `${registration.schoolName} is a registered institution based in ${registration.schoolCity}.`,
  }
}

adminSchoolApprovalRouter.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const registration = await loadReviewableRegistration(req.params.id)
    const isResubmission = registration.registrationStatus === 'Resubmitted' && registration.publishedSchoolId

    const school = isResubmission
      ? await School.findByIdAndUpdate(registration.publishedSchoolId, schoolFieldsFrom(registration), { new: true })
      : await School.create({ ...schoolFieldsFrom(registration), status: 'Active' })

    if (!school) throw new NotFoundError('The published school listing this registration was linked to no longer exists.')

    registration.registrationStatus = 'Approved'
    registration.approvedAt = new Date()
    registration.rejectedAt = undefined
    registration.rejectionReason = undefined
    registration.publishedSchoolId = school._id
    await registration.save()

    logAction(
      req,
      'approve',
      'SchoolRegistration',
      registration.id,
      isResubmission ? `Approved resubmission, updated School ${school.id}` : `Approved and promoted to School ${school.id}`,
    )
    res.json({ registration, school })
  }),
)

adminSchoolApprovalRouter.post(
  '/:id/reject',
  asyncHandler(async (req, res) => {
    const { reason } = rejectSchoolSchema.parse(req.body)
    const registration = await loadReviewableRegistration(req.params.id)

    registration.registrationStatus = 'Rejected'
    registration.rejectedAt = new Date()
    registration.rejectionReason = reason
    await registration.save()

    logAction(req, 'reject', 'SchoolRegistration', registration.id, reason)
    res.json(registration)
  }),
)
