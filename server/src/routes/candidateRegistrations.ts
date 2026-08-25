import { Router } from 'express'
import { CandidateApplication } from '../models/CandidateApplication.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { upload, uploadedFileUrl } from '../middleware/upload.js'
import { candidateRegistrationBodySchema } from '../validation/candidateRegistration.js'
import { HttpError } from '../utils/HttpError.js'

export const candidateRegistrationsRouter = Router()

const uploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'degreeDocument', maxCount: 1 },
  { name: 'experienceDocument', maxCount: 1 },
  { name: 'policeVerification', maxCount: 1 },
])

candidateRegistrationsRouter.post(
  '/',
  writeLimiter,
  uploadFields,
  asyncHandler(async (req, res) => {
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
      profilePhotoPath: files.profilePhoto?.[0] ? uploadedFileUrl(files.profilePhoto[0]) : undefined,
      degreeDocumentPath: uploadedFileUrl(degreeDocument),
      experienceDocumentPath: files.experienceDocument?.[0] ? uploadedFileUrl(files.experienceDocument[0]) : undefined,
      policeVerificationPath: files.policeVerification?.[0] ? uploadedFileUrl(files.policeVerification[0]) : undefined,
      homeTuitionEligibility: homeTuitionSelected ? 'Pending' : 'Not Requested',
      policeVerificationStatus: homeTuitionSelected ? 'Pending' : 'Not Required',
      applicationStatus: 'New',
    })

    res.status(201).json(application)
  }),
)
