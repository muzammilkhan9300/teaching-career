import { Router } from 'express'
import { CandidateApplication } from '../../models/CandidateApplication.js'
import { Candidate } from '../../models/Candidate.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import { logAction } from '../../lib/audit.js'
import { deleteUploadedFile } from '../../lib/files.js'
import { HttpError, NotFoundError } from '../../utils/HttpError.js'

export const adminCandidateVerificationRouter = Router()
adminCandidateVerificationRouter.use(requireAdmin, requirePermission('reviewSubmissions'))

function humanize(slug: string) {
  return slug
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

function purgeApplicationDocuments(application: InstanceType<typeof CandidateApplication>) {
  deleteUploadedFile(application.degreeDocumentPath)
  deleteUploadedFile(application.experienceDocumentPath)
  deleteUploadedFile(application.policeVerificationPath)
  application.degreeDocumentPath = undefined
  application.experienceDocumentPath = undefined
  application.policeVerificationPath = undefined
}

async function loadPendingApplication(id: string) {
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
    const application = await loadPendingApplication(req.params.id)

    const tags: string[] = []
    tags.push(application.teachWhere.includes('home_tuition') ? 'Home Tuition' : 'School Teaching')
    if (application.classes.length > 0) tags.push(application.classes.map(humanize).join(', '))

    const primarySubject = application.subjects.find((s) => s !== 'other') ?? application.subjects[0]

    const candidate = await Candidate.create({
      name: application.fullName,
      role: primarySubject ? `${humanize(primarySubject)} Teacher` : `${application.major} Teacher`,
      city: application.city,
      area: application.area,
      qualification: application.degreeName || application.qualification,
      experience: application.isFresher === 'no' && application.experienceYears ? application.experienceYears : 'Fresher',
      tags,
      verified: true,
      photo: application.profilePhotoPath ?? '',
      status: 'Active',
    })

    purgeApplicationDocuments(application)
    application.applicationStatus = 'Verified'
    await application.save()

    logAction(req, 'verify', 'CandidateApplication', application.id, `Verified and promoted to Candidate ${candidate.id}`)
    res.json({ application, candidate })
  }),
)

adminCandidateVerificationRouter.post(
  '/:id/reject',
  asyncHandler(async (req, res) => {
    const application = await loadPendingApplication(req.params.id)

    purgeApplicationDocuments(application)
    application.applicationStatus = 'Rejected'
    await application.save()

    logAction(req, 'reject', 'CandidateApplication', application.id)
    res.json(application)
  }),
)
