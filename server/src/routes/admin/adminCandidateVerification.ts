import { Router } from 'express'
import { CandidateApplication } from '../../models/CandidateApplication.js'
import { Candidate } from '../../models/Candidate.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import { logAction } from '../../lib/audit.js'
import { deleteUploadedFile } from '../../lib/files.js'
import { HttpError, NotFoundError } from '../../utils/HttpError.js'
import { rejectCandidateApplicationSchema } from '../../validation/candidateApproval.js'
import { candidateFieldsFrom } from '../../lib/publishing.js'

export const adminCandidateVerificationRouter = Router()
adminCandidateVerificationRouter.use(requireAdmin, requirePermission('reviewSubmissions'))

function purgeApplicationDocuments(application: InstanceType<typeof CandidateApplication>) {
  deleteUploadedFile(application.degreeDocumentPath)
  deleteUploadedFile(application.experienceDocumentPath)
  deleteUploadedFile(application.policeVerificationPath)
  application.degreeDocumentPath = undefined
  application.experienceDocumentPath = undefined
  application.policeVerificationPath = undefined
}

// Reviewable states are 'New'/'Reviewed' (first submission) and 'Resubmitted'
// (an edit after a prior Verified/Rejected decision) — 'Verified'/'Rejected'
// are terminal until the candidate acts again, so re-verifying/re-rejecting
// those directly is blocked here.
async function loadReviewableApplication(id: string) {
  const application = await CandidateApplication.findById(id)
  if (!application) throw new NotFoundError('Application not found')
  if (application.applicationStatus === 'Verified' || application.applicationStatus === 'Rejected') {
    throw new HttpError(400, `This application was already ${application.applicationStatus.toLowerCase()}.`)
  }
  return application
}

adminCandidateVerificationRouter.post(
  '/:id/verify',
  asyncHandler(async (req, res) => {
    const application = await loadReviewableApplication(req.params.id)
    const isResubmission = application.applicationStatus === 'Resubmitted' && application.publishedCandidateId

    const candidate = isResubmission
      ? await Candidate.findByIdAndUpdate(application.publishedCandidateId, candidateFieldsFrom(application), { new: true })
      : await Candidate.create({ ...candidateFieldsFrom(application), verified: true, status: 'Active' })

    if (!candidate) throw new NotFoundError('The published candidate listing this application was linked to no longer exists.')

    purgeApplicationDocuments(application)
    application.applicationStatus = 'Verified'
    application.approvedAt = new Date()
    application.rejectedAt = undefined
    application.rejectionReason = undefined
    application.publishedCandidateId = candidate._id
    await application.save()

    logAction(
      req,
      'verify',
      'CandidateApplication',
      application.id,
      isResubmission ? `Verified resubmission, updated Candidate ${candidate.id}` : `Verified and promoted to Candidate ${candidate.id}`,
    )
    res.json({ application, candidate })
  }),
)

adminCandidateVerificationRouter.post(
  '/:id/reject',
  asyncHandler(async (req, res) => {
    const { reason } = rejectCandidateApplicationSchema.parse(req.body)
    const application = await loadReviewableApplication(req.params.id)

    purgeApplicationDocuments(application)
    application.applicationStatus = 'Rejected'
    application.rejectedAt = new Date()
    application.rejectionReason = reason
    await application.save()

    logAction(req, 'reject', 'CandidateApplication', application.id, reason)
    res.json(application)
  }),
)
