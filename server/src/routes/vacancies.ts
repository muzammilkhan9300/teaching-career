import { Router } from 'express'
import type { Request } from 'express'
import { Vacancy } from '../models/Vacancy.js'
import { VacancyApplication } from '../models/VacancyApplication.js'
import { SchoolRegistration } from '../models/SchoolRegistration.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { writeLimiter } from '../middleware/rateLimiter.js'
import { requireUser } from '../middleware/requireUser.js'
import { vacancyApplicationBodySchema } from '../validation/vacancyApplication.js'
import { selfServiceVacancySchema } from '../validation/vacancySelfService.js'
import { HttpError, NotFoundError } from '../utils/HttpError.js'
import { notify } from '../lib/notify.js'

export const vacanciesRouter = Router()

// A school owner may only post/edit/delete vacancies for the one school
// their account owns (SchoolRegistration.ownerId -> publishedSchoolId) —
// never an arbitrary schoolId supplied by the client.
async function requireOwnedSchool(req: Request) {
  const registration = await SchoolRegistration.findOne({ ownerId: req.user!.id })
  if (!registration || !registration.publishedSchoolId) {
    throw new HttpError(403, 'You need an approved school registration before you can manage vacancies.')
  }
  return registration
}

// ---- Self-service: the logged-in school owner's own vacancies ----
// Mounted ahead of "/:id" so "/mine" is never swallowed by that route.

vacanciesRouter.get(
  '/mine',
  requireUser,
  asyncHandler(async (req, res) => {
    const registration = await requireOwnedSchool(req)
    const vacancies = await Vacancy.find({ schoolId: registration.publishedSchoolId, archived: false }).sort({ createdAt: -1 })
    res.json(vacancies)
  }),
)

vacanciesRouter.post(
  '/mine',
  requireUser,
  writeLimiter,
  asyncHandler(async (req, res) => {
    const registration = await requireOwnedSchool(req)
    const body = selfServiceVacancySchema.parse(req.body)

    const vacancy = await Vacancy.create({
      ...body,
      school: registration.schoolName,
      schoolId: registration.publishedSchoolId,
    })

    notify('vacancy', `${registration.schoolName} posted a new vacancy: ${vacancy.title}`, '/admin/vacancies')
    res.status(201).json(vacancy)
  }),
)

vacanciesRouter.put(
  '/mine/:id',
  requireUser,
  writeLimiter,
  asyncHandler(async (req, res) => {
    const registration = await requireOwnedSchool(req)
    const vacancy = await Vacancy.findOne({ _id: req.params.id, schoolId: registration.publishedSchoolId, archived: false })
    if (!vacancy) throw new NotFoundError('Vacancy not found')

    const body = selfServiceVacancySchema.parse(req.body)
    Object.assign(vacancy, body)
    await vacancy.save()
    res.json(vacancy)
  }),
)

vacanciesRouter.delete(
  '/mine/:id',
  requireUser,
  asyncHandler(async (req, res) => {
    const registration = await requireOwnedSchool(req)
    const vacancy = await Vacancy.findOneAndDelete({ _id: req.params.id, schoolId: registration.publishedSchoolId, archived: false })
    if (!vacancy) throw new NotFoundError('Vacancy not found')
    res.status(204).end()
  }),
)

vacanciesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = { archived: false }
    if (req.query.schoolId) filter.schoolId = req.query.schoolId
    if (req.query.active !== undefined) filter.active = req.query.active === 'true'

    const vacancies = await Vacancy.find(filter).sort({ createdAt: -1 })
    res.json(vacancies)
  }),
)

vacanciesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const vacancy = await Vacancy.findOne({ _id: req.params.id, archived: false })
    if (!vacancy) throw new NotFoundError('Vacancy not found')
    res.json(vacancy)
  }),
)

vacanciesRouter.post(
  '/:id/apply',
  requireUser,
  writeLimiter,
  asyncHandler(async (req, res) => {
    const vacancy = await Vacancy.findOne({ _id: req.params.id, archived: false, active: true })
    if (!vacancy) throw new NotFoundError('This vacancy is no longer accepting applications.')

    const body = vacancyApplicationBodySchema.parse(req.body)

    const existing = await VacancyApplication.findOne({ vacancyId: vacancy.id, applicantEmail: body.applicantEmail })
    if (existing) throw new HttpError(409, "You've already applied to this vacancy.")

    const application = await VacancyApplication.create({
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.title,
      schoolId: vacancy.schoolId,
      ...body,
      applicationStatus: 'Applied',
    })
    notify('vacancy-application', `New application for "${vacancy.title}" from ${body.applicantName}`, '/admin/vacancy-applications')
    res.status(201).json(application)
  }),
)
