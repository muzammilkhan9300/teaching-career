import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import { CandidateApplication } from '../../models/CandidateApplication.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import { NotFoundError } from '../../utils/HttpError.js'

export const adminDocumentsRouter = Router()
adminDocumentsRouter.use(requireAdmin, requirePermission('reviewSubmissions'))

const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads')

const DOCUMENT_FIELDS: Record<string, string> = {
  degreeDocument: 'degreeDocumentPath',
  experienceDocument: 'experienceDocumentPath',
  policeVerification: 'policeVerificationPath',
}

// Applications still awaiting a verify/reject decision — the "temporary
// document management" queue: every file behind these records is deleted
// the moment a decision is made (see adminCandidateVerification.ts).
adminDocumentsRouter.get(
  '/pending',
  asyncHandler(async (_req, res) => {
    const items = await CandidateApplication.find({ applicationStatus: { $in: ['New', 'Reviewed'] } }).sort({
      createdAt: -1,
    })
    res.json(items)
  }),
)

adminDocumentsRouter.get(
  '/:applicationId/:field',
  asyncHandler(async (req, res) => {
    const dbField = DOCUMENT_FIELDS[req.params.field]
    if (!dbField) throw new NotFoundError('Unknown document field')

    const application = await CandidateApplication.findById(req.params.applicationId)
    if (!application) throw new NotFoundError('Application not found')

    const storedPath = (application as unknown as Record<string, string | undefined>)[dbField]
    if (!storedPath) throw new NotFoundError('Document not found')

    // storedPath looks like "/uploads/documents/<filename>" — only the
    // filename is trusted; it's resolved against the fixed documents dir so
    // no path segment from the DB value can escape it.
    const filename = path.basename(storedPath)
    const absolutePath = path.join(UPLOADS_ROOT, 'documents', filename)

    if (!fs.existsSync(absolutePath)) throw new NotFoundError('Document file is no longer available')

    res.sendFile(absolutePath)
  }),
)
