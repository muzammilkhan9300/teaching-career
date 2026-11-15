import { Router, type Request } from 'express'
import { CandidateApplication } from '../models/CandidateApplication.js'
import { Candidate } from '../models/Candidate.js'
import { SchoolRegistration } from '../models/SchoolRegistration.js'
import { School } from '../models/School.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireUser } from '../middleware/requireUser.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { upload, uploadedFileUrl } from '../middleware/upload.js'
import { candidateProfileEditSchema, schoolProfileEditSchema } from '../validation/profileEdit.js'
import { candidateFieldsFrom, schoolFieldsFrom } from '../lib/publishing.js'
import { deleteUploadedFile } from '../lib/files.js'
import { notify } from '../lib/notify.js'
import { HttpError, NotFoundError } from '../utils/HttpError.js'

// Self-service Edit Profile for an already-published candidate or school.
//
// Security model:
// - No :id in any route. The record is always resolved from the session
//   (`ownerId: req.user.id`), so an account can only ever edit its own
//   profile; a candidate account has no school registration to resolve (and
//   vice versa), so it simply gets 403 from the other route.
// - Body schemas are strict allow-lists (validation/profileEdit.ts):
//   document paths, statuses, verified/registered flags and ownerId can't be
//   submitted at all.
// - The only file fields accepted are the public images below; any other
//   file field (degreeDocument, experienceDocument, policeVerification, …) is
//   rejected by multer with 400 before anything is written.
// - Verification/approval status is never touched: edits go live directly,
//   and admins get a notification to review them.
// Changes that need fresh documents (fresher -> experienced, home tuition)
// still go through the existing resubmission flow on the registration pages.

export const profileEditRouter = Router()

const candidateFiles = upload.fields([{ name: 'profilePhoto', maxCount: 1 }])
const schoolFiles = upload.fields([
  { name: 'schoolLogo', maxCount: 1 },
  { name: 'schoolCover', maxCount: 1 },
])

function uploadedFiles(req: Request) {
  return (req.files ?? {}) as Record<string, Express.Multer.File[] | undefined>
}

/** Deletes this request's freshly uploaded files — used when the request fails after multer saved them. */
function discardUploads(req: Request) {
  for (const list of Object.values(uploadedFiles(req))) for (const file of list ?? []) deleteUploadedFile(uploadedFileUrl(file))
}

/**
 * Queues the old image for deletion when it's being replaced or removed — only
 * files we stored in `subdir` (never bundled /assets images). The queue is
 * flushed after the save succeeds, so a failed save never loses the current image.
 */
function queueOldImage(queue: string[], oldPath: string | undefined | null, newPath: string | undefined, subdir: string) {
  if (oldPath && oldPath !== newPath && oldPath.startsWith(`/uploads/${subdir}/`)) queue.push(oldPath)
}

profileEditRouter.put(
  '/candidate',
  requireUser,
  writeLimiter,
  candidateFiles,
  asyncHandler(async (req, res) => {
    try {
      const application = await CandidateApplication.findOne({ ownerId: req.user!.id })
      if (!application || !application.publishedCandidateId) {
        throw new HttpError(403, 'You can edit your profile once your candidate registration has been verified.')
      }
      if (application.applicationStatus !== 'Verified') {
        throw new HttpError(409, 'Your registration has changes awaiting a decision. You can edit your profile again once it is verified.')
      }
      const candidate = await Candidate.findById(application.publishedCandidateId)
      if (!candidate) throw new NotFoundError('Your public candidate profile could not be found.')

      const body = candidateProfileEditSchema.parse(req.body)
      const previousName = application.fullName
      const oldImages: string[] = []

      application.fullName = body.fullName
      application.city = body.city
      application.area = body.area
      application.about = body.about
      application.skills = body.skills
      application.qualification = body.qualification
      application.degreeName = body.degreeName
      application.major = body.major
      application.institute = body.institute
      application.completionYear = body.completionYear
      application.subjects = body.subjects
      application.subjectOther = body.subjectOther
      application.classes = body.classes
      application.classOther = body.classOther
      application.whatsapp = body.whatsapp
      application.email = body.email
      if (application.isFresher === 'no') {
        application.experienceYears = body.experienceYears
        application.experienceOrg = body.experienceOrg
        application.experienceDetails = body.experienceDetails
      }

      const newPhoto = uploadedFiles(req).profilePhoto?.[0]
      if (newPhoto) {
        const url = uploadedFileUrl(newPhoto)
        queueOldImage(oldImages, application.profilePhotoPath, url, 'photos')
        application.profilePhotoPath = url
      } else if (body.removeProfilePhoto === 'true') {
        queueOldImage(oldImages, application.profilePhotoPath, undefined, 'photos')
        application.profilePhotoPath = undefined
      }

      await application.save()
      oldImages.forEach((p) => deleteUploadedFile(p))
      // Only the mapped public fields — `verified` and `status` are left exactly as they were.
      const updated = await Candidate.findByIdAndUpdate(candidate._id, candidateFieldsFrom(application), { new: true, runValidators: true })

      notify(
        'profile-update',
        previousName !== application.fullName
          ? `Candidate "${previousName}" changed their name to "${application.fullName}" and updated their profile`
          : `${application.fullName} updated their candidate profile`,
        '/admin/candidates',
      )
      res.json({ application, candidate: updated })
    } catch (err) {
      discardUploads(req)
      throw err
    }
  }),
)

profileEditRouter.put(
  '/school',
  requireUser,
  writeLimiter,
  schoolFiles,
  asyncHandler(async (req, res) => {
    try {
      const registration = await SchoolRegistration.findOne({ ownerId: req.user!.id })
      if (!registration || !registration.publishedSchoolId) {
        throw new HttpError(403, 'You can edit your school profile once your school registration has been approved.')
      }
      if (registration.registrationStatus !== 'Approved') {
        throw new HttpError(409, 'Your registration has changes awaiting a decision. You can edit your profile again once it is approved.')
      }
      const school = await School.findById(registration.publishedSchoolId)
      if (!school) throw new NotFoundError('Your public school profile could not be found.')

      const body = schoolProfileEditSchema.parse(req.body)
      const previousName = registration.schoolName
      const oldImages: string[] = []

      registration.schoolName = body.schoolName
      registration.schoolCity = body.schoolCity
      registration.schoolArea = body.schoolArea
      registration.schoolAddress = body.schoolAddress
      registration.schoolWebsite = body.schoolWebsite
      registration.schoolDesc = body.schoolDesc
      registration.schoolFacilities = body.schoolFacilities
      registration.schoolPhone = body.schoolPhone
      registration.schoolWhatsapp = body.schoolWhatsapp
      registration.schoolEmail = body.schoolEmail

      const files = uploadedFiles(req)
      const newLogo = files.schoolLogo?.[0]
      if (newLogo) {
        const url = uploadedFileUrl(newLogo)
        queueOldImage(oldImages, registration.schoolLogoPath, url, 'logos')
        registration.schoolLogoPath = url
      }
      const newCover = files.schoolCover?.[0]
      if (newCover) {
        const url = uploadedFileUrl(newCover)
        queueOldImage(oldImages, registration.schoolCoverPath, url, 'covers')
        registration.schoolCoverPath = url
      } else if (body.removeCoverImage === 'true') {
        queueOldImage(oldImages, registration.schoolCoverPath, undefined, 'covers')
        registration.schoolCoverPath = undefined
      }

      await registration.save()
      oldImages.forEach((p) => deleteUploadedFile(p))
      // Only the mapped public fields — `status` (Active/Suspended) is left as it was.
      const updated = await School.findByIdAndUpdate(school._id, schoolFieldsFrom(registration), { new: true, runValidators: true })

      notify(
        'profile-update',
        previousName !== registration.schoolName
          ? `School "${previousName}" was renamed to "${registration.schoolName}" — please review`
          : `${registration.schoolName} updated its school profile`,
        '/admin/schools',
      )
      res.json({ registration, school: updated })
    } catch (err) {
      discardUploads(req)
      throw err
    }
  }),
)
