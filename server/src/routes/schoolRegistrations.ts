import { Router } from 'express'
import { SchoolRegistration } from '../models/SchoolRegistration.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { upload, uploadedFileUrl } from '../middleware/upload.js'
import { schoolRegistrationBodySchema } from '../validation/schoolRegistration.js'

export const schoolRegistrationsRouter = Router()

const uploadFields = upload.fields([{ name: 'schoolLogo', maxCount: 1 }])

schoolRegistrationsRouter.post(
  '/',
  writeLimiter,
  uploadFields,
  asyncHandler(async (req, res) => {
    const body = schoolRegistrationBodySchema.parse(req.body)
    const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>

    const registration = await SchoolRegistration.create({
      ...body,
      schoolLogoPath: files.schoolLogo?.[0] ? uploadedFileUrl(files.schoolLogo[0]) : undefined,
      registrationStatus: 'New',
    })

    res.status(201).json(registration)
  }),
)
