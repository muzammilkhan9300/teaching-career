import { Router } from 'express'
import { SchoolRegistration } from '../models/SchoolRegistration.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { requireUser } from '../middleware/requireUser.js'
import { upload, uploadedFileUrl } from '../middleware/upload.js'
import { schoolRegistrationBodySchema } from '../validation/schoolRegistration.js'
import { HttpError, NotFoundError } from '../utils/HttpError.js'
import { notify } from '../lib/notify.js'

export const schoolRegistrationsRouter = Router()

const uploadFields = upload.fields([{ name: 'schoolLogo', maxCount: 1 }])

// ---- Self-service: the logged-in owner's own registration ----
// Mounted ahead of "/" so "/mine" is never swallowed by a future :id route.

schoolRegistrationsRouter.get(
  '/mine',
  requireUser,
  asyncHandler(async (req, res) => {
    const registration = await SchoolRegistration.findOne({ ownerId: req.user!.id })
    if (!registration) throw new NotFoundError("You haven't registered a school yet.")
    res.json(registration)
  }),
)

schoolRegistrationsRouter.put(
  '/mine',
  requireUser,
  writeLimiter,
  uploadFields,
  asyncHandler(async (req, res) => {
    const registration = await SchoolRegistration.findOne({ ownerId: req.user!.id })
    if (!registration) throw new NotFoundError("You haven't registered a school yet.")
    if (registration.registrationStatus === 'Pending' || registration.registrationStatus === 'Resubmitted') {
      throw new HttpError(400, 'Your registration is already under review. Please wait for a decision before editing again.')
    }

    const body = schoolRegistrationBodySchema.parse(req.body)
    const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>

    Object.assign(registration, body)
    if (files.schoolLogo?.[0]) registration.schoolLogoPath = uploadedFileUrl(files.schoolLogo[0])
    registration.registrationStatus = 'Resubmitted'
    registration.rejectionReason = undefined
    registration.submittedAt = new Date()
    await registration.save()

    notify('school-registration', `${registration.schoolName} resubmitted their registration for review`, '/admin/school-registrations')
    res.json(registration)
  }),
)

schoolRegistrationsRouter.post(
  '/',
  requireUser,
  writeLimiter,
  uploadFields,
  asyncHandler(async (req, res) => {
    const existing = await SchoolRegistration.findOne({ ownerId: req.user!.id })
    if (existing) {
      throw new HttpError(409, 'You have already registered a school. Edit your existing registration instead of submitting a new one.')
    }

    const body = schoolRegistrationBodySchema.parse(req.body)
    const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>

    const registration = await SchoolRegistration.create({
      ...body,
      ownerId: req.user!.id,
      schoolLogoPath: files.schoolLogo?.[0] ? uploadedFileUrl(files.schoolLogo[0]) : undefined,
      registrationStatus: 'Pending',
      submittedAt: new Date(),
    })

    notify('school-registration', `New school registration from ${registration.schoolName}`, '/admin/school-registrations')
    res.status(201).json(registration)
  }),
)
