import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import { upload, uploadedFileUrl } from '../../middleware/upload.js'
import { logAction } from '../../lib/audit.js'
import { HttpError } from '../../utils/HttpError.js'

export const adminUploadsRouter = Router()
adminUploadsRouter.use(requireAdmin, requirePermission('manageContent'))

// One image per request (hero slide, service thumbnail, update logo). The
// admin form uploads as soon as a file is picked and stores the returned
// path in the record — the content routes themselves stay plain JSON.
adminUploadsRouter.post(
  '/image',
  upload.single('homepageImage'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Choose an image to upload.')
    const url = uploadedFileUrl(req.file)
    logAction(req, 'upload', 'HomepageImage', undefined, url)
    res.status(201).json({ url })
  }),
)

// A candidate's profile photo picked in Admin → Candidates. Same rules as a
// candidate's own photo upload (JPG/JPEG/PNG/WEBP, MAX_UPLOAD_MB), stored in
// the public uploads/photos folder; the form saves the returned path.
adminUploadsRouter.post(
  '/candidate-photo',
  upload.single('profilePhoto'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'Choose an image to upload.')
    const url = uploadedFileUrl(req.file)
    logAction(req, 'upload', 'CandidatePhoto', undefined, url)
    res.status(201).json({ url })
  }),
)
