import { Router, type Request, type Response } from 'express'
import { CandidateApplication } from '../models/CandidateApplication.js'
import { Candidate } from '../models/Candidate.js'
import { SchoolRegistration } from '../models/SchoolRegistration.js'
import { School } from '../models/School.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireUser } from '../middleware/requireUser.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { requirePermission } from '../lib/permissions.js'
import { logAction } from '../lib/audit.js'
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
//
// Admin editing (adminProfileEditRouter, mounted at /api/admin/profile-edit):
// staff with the manageContent capability (admin, super_admin) can edit ANY
// published profile by its public id, through exactly the same allow-listed
// fields and file rules as the owner — verification documents stay protected
// for admins here too. Every admin edit is written to the audit log.

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

type Actor = 'owner' | 'admin'
type CandidateApplicationDoc = InstanceType<typeof CandidateApplication>
type SchoolRegistrationDoc = InstanceType<typeof SchoolRegistration>

/** Shared by the owner and admin routes: same allow-listed fields, same file rules. */
async function applyCandidateEdit(req: Request, res: Response, application: CandidateApplicationDoc, actor: Actor) {
  {
    try {
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

      if (actor === 'admin') {
        logAction(req, 'update', 'CandidateProfile', String(candidate._id), `Edited profile of ${application.fullName}`)
      } else {
        notify(
          'profile-update',
          previousName !== application.fullName
            ? `Candidate "${previousName}" changed their name to "${application.fullName}" and updated their profile`
            : `${application.fullName} updated their candidate profile`,
          '/admin/candidates',
        )
      }
      res.json({ application, candidate: updated })
    } catch (err) {
      discardUploads(req)
      throw err
    }
  }
}

profileEditRouter.put(
  '/candidate',
  requireUser,
  writeLimiter,
  candidateFiles,
  asyncHandler(async (req, res) => {
    const application = await CandidateApplication.findOne({ ownerId: req.user!.id })
    if (!application || !application.publishedCandidateId) {
      discardUploads(req)
      throw new HttpError(403, 'You can edit your profile once your candidate registration has been verified.')
    }
    if (application.applicationStatus !== 'Verified') {
      discardUploads(req)
      throw new HttpError(409, 'Your registration has changes awaiting a decision. You can edit your profile again once it is verified.')
    }
    await applyCandidateEdit(req, res, application, 'owner')
  }),
)

async function applySchoolEdit(req: Request, res: Response, registration: SchoolRegistrationDoc, actor: Actor) {
  {
    try {
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

      if (actor === 'admin') {
        logAction(req, 'update', 'SchoolProfile', String(school._id), `Edited profile of ${registration.schoolName}`)
      } else {
        notify(
          'profile-update',
          previousName !== registration.schoolName
            ? `School "${previousName}" was renamed to "${registration.schoolName}" — please review`
            : `${registration.schoolName} updated its school profile`,
          '/admin/schools',
        )
      }
      res.json({ registration, school: updated })
    } catch (err) {
      discardUploads(req)
      throw err
    }
  }
}

profileEditRouter.put(
  '/school',
  requireUser,
  writeLimiter,
  schoolFiles,
  asyncHandler(async (req, res) => {
    const registration = await SchoolRegistration.findOne({ ownerId: req.user!.id })
    if (!registration || !registration.publishedSchoolId) {
      discardUploads(req)
      throw new HttpError(403, 'You can edit your school profile once your school registration has been approved.')
    }
    if (registration.registrationStatus !== 'Approved') {
      discardUploads(req)
      throw new HttpError(409, 'Your registration has changes awaiting a decision. You can edit your profile again once it is approved.')
    }
    await applySchoolEdit(req, res, registration, 'owner')
  }),
)

// ---- Admin: edit any published profile by its public id ----

export const adminProfileEditRouter = Router()
adminProfileEditRouter.use(requireAdmin, requirePermission('manageContent'))

const NOT_LINKED =
  'This profile was not created from a registration, so there is no full profile to edit. Edit its listing under Admin → Candidates or Admin → Schools instead.'

const isObjectId = (id: string) => /^[a-f0-9]{24}$/i.test(id)

async function candidateApplicationFor(candidateId: string) {
  if (!isObjectId(candidateId)) throw new NotFoundError('Candidate profile not found.')
  const application = await CandidateApplication.findOne({ publishedCandidateId: candidateId })
  if (!application) throw new NotFoundError(NOT_LINKED)
  return application
}

async function schoolRegistrationFor(schoolId: string) {
  if (!isObjectId(schoolId)) throw new NotFoundError('School profile not found.')
  const registration = await SchoolRegistration.findOne({ publishedSchoolId: schoolId })
  if (!registration) throw new NotFoundError(NOT_LINKED)
  return registration
}

adminProfileEditRouter.get(
  '/candidate/:candidateId',
  asyncHandler(async (req, res) => {
    res.json(await candidateApplicationFor(String(req.params.candidateId)))
  }),
)

adminProfileEditRouter.put(
  '/candidate/:candidateId',
  writeLimiter,
  candidateFiles,
  asyncHandler(async (req, res) => {
    let application: CandidateApplicationDoc
    try {
      application = await candidateApplicationFor(String(req.params.candidateId))
      if (application.applicationStatus !== 'Verified') {
        throw new HttpError(409, 'This candidate has resubmitted changes awaiting review. Verify or reject them under Candidate Applications first.')
      }
    } catch (err) {
      discardUploads(req)
      throw err
    }
    await applyCandidateEdit(req, res, application, 'admin')
  }),
)

adminProfileEditRouter.get(
  '/school/:schoolId',
  asyncHandler(async (req, res) => {
    res.json(await schoolRegistrationFor(String(req.params.schoolId)))
  }),
)

adminProfileEditRouter.put(
  '/school/:schoolId',
  writeLimiter,
  schoolFiles,
  asyncHandler(async (req, res) => {
    let registration: SchoolRegistrationDoc
    try {
      registration = await schoolRegistrationFor(String(req.params.schoolId))
      if (registration.registrationStatus !== 'Approved') {
        throw new HttpError(409, 'This school has resubmitted changes awaiting review. Approve or reject them under School Registrations first.')
      }
    } catch (err) {
      discardUploads(req)
      throw err
    }
    await applySchoolEdit(req, res, registration, 'admin')
  }),
)
