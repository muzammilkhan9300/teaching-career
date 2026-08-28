import { Router } from 'express'
import { CandidateApplication } from '../models/CandidateApplication.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { requireUser } from '../middleware/requireUser.js'
import { upload, uploadedFileUrl } from '../middleware/upload.js'
import { candidateRegistrationBodySchema } from '../validation/candidateRegistration.js'
import { HttpError, NotFoundError } from '../utils/HttpError.js'
import { notify } from '../lib/notify.js'

export const candidateRegistrationsRouter = Router()

const uploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'degreeDocument', maxCount: 1 },
  { name: 'experienceDocument', maxCount: 1 },
  { name: 'policeVerification', maxCount: 1 },
])

// ---- Self-service: the logged-in candidate's own application ----
// Mounted ahead of "/" so "/mine" is never swallowed by a future :id route.

candidateRegistrationsRouter.get(
  '/mine',
  requireUser,
  asyncHandler(async (req, res) => {
    const application = await CandidateApplication.findOne({ ownerId: req.user!.id })
    if (!application) throw new NotFoundError("You haven't submitted a candidate application yet.")
    res.json(application)
  }),
)

candidateRegistrationsRouter.put(
  '/mine',
  requireUser,
  writeLimiter,
  uploadFields,
  asyncHandler(async (req, res) => {
    const application = await CandidateApplication.findOne({ ownerId: req.user!.id })
    if (!application) throw new NotFoundError("You haven't submitted a candidate application yet.")
    if (application.applicationStatus !== 'Verified' && application.applicationStatus !== 'Rejected') {
      throw new HttpError(400, 'Your application is already under review. Please wait for a decision before editing again.')
    }

    const body = candidateRegistrationBodySchema.parse(req.body)
    const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>

    // A verify or reject decision permanently deletes the uploaded documents
    // (see routes/admin/adminCandidateVerification.ts), so a resubmission
    // must always provide fresh copies — the previous stored path is gone.
    const degreeDocument = files.degreeDocument?.[0]
    if (!degreeDocument && !application.degreeDocumentPath) {
      throw new HttpError(400, 'Degree / qualification document is required.')
    }
    if (body.isFresher === 'no' && !files.experienceDocument?.[0] && !application.experienceDocumentPath) {
      throw new HttpError(400, 'Experience letter / proof of experience is required since you selected "No" for Fresher.')
    }

    const homeTuitionSelected = body.teachWhere.includes('home_tuition')

    Object.assign(application, body)
    if (files.profilePhoto?.[0]) application.profilePhotoPath = uploadedFileUrl(files.profilePhoto[0])
    if (degreeDocument) application.degreeDocumentPath = uploadedFileUrl(degreeDocument)
    if (files.experienceDocument?.[0]) application.experienceDocumentPath = uploadedFileUrl(files.experienceDocument[0])
    if (files.policeVerification?.[0]) application.policeVerificationPath = uploadedFileUrl(files.policeVerification[0])
    application.homeTuitionEligibility = homeTuitionSelected ? 'Pending' : 'Not Requested'
    application.policeVerificationStatus = homeTuitionSelected ? 'Pending' : 'Not Required'
    application.applicationStatus = 'Resubmitted'
    application.rejectionReason = undefined
    application.submittedAt = new Date()
    await application.save()

    notify('candidate-application', `${application.fullName} resubmitted their candidate application for review`, '/admin/candidate-applications')
    res.json(application)
  }),
)

candidateRegistrationsRouter.post(
  '/',
  requireUser,
  writeLimiter,
  uploadFields,
  asyncHandler(async (req, res) => {
    const existing = await CandidateApplication.findOne({ ownerId: req.user!.id })
    if (existing) {
      throw new HttpError(409, 'You have already submitted a candidate application. Edit your existing application instead of submitting a new one.')
    }

    const body = candidateRegistrationBodySchema.parse(req.body)
    const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>

    const degreeDocument = files.degreeDocument?.[0]
    if (!degreeDocument) {
      throw new HttpError(400, 'Degree / qualification document is required.')
    }
    if (body.isFresher === 'no' && !files.experienceDocument?.[0]) {
      throw new HttpError(400, 'Experience letter / proof of experience is required since you selected "No" for Fresher.')
    }

    const homeTuitionSelected = body.teachWhere.includes('home_tuition')

    const application = await CandidateApplication.create({
      ...body,
      ownerId: req.user!.id,
      profilePhotoPath: files.profilePhoto?.[0] ? uploadedFileUrl(files.profilePhoto[0]) : undefined,
      degreeDocumentPath: uploadedFileUrl(degreeDocument),
      experienceDocumentPath: files.experienceDocument?.[0] ? uploadedFileUrl(files.experienceDocument[0]) : undefined,
      policeVerificationPath: files.policeVerification?.[0] ? uploadedFileUrl(files.policeVerification[0]) : undefined,
      homeTuitionEligibility: homeTuitionSelected ? 'Pending' : 'Not Requested',
      policeVerificationStatus: homeTuitionSelected ? 'Pending' : 'Not Required',
      applicationStatus: 'New',
      submittedAt: new Date(),
    })

    notify('candidate-application', `New candidate application from ${application.fullName}`, '/admin/candidate-applications')
    res.status(201).json(application)
  }),
)
