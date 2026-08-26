import { Router } from 'express'
import { Vacancy } from '../../models/Vacancy.js'
import { School } from '../../models/School.js'
import { Candidate } from '../../models/Candidate.js'
import { CandidateApplication } from '../../models/CandidateApplication.js'
import { SchoolRegistration } from '../../models/SchoolRegistration.js'
import { HomeTutorRequest } from '../../models/HomeTutorRequest.js'
import { ContactMessage } from '../../models/ContactMessage.js'
import { VacancyApplication } from '../../models/VacancyApplication.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'

export const adminStatsRouter = Router()
adminStatsRouter.use(requireAdmin)

adminStatsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [
      vacancies,
      activeVacancies,
      schools,
      candidates,
      candidateApplications,
      schoolRegistrations,
      homeTutorRequests,
      contactMessages,
      vacancyApplications,
    ] = await Promise.all([
      Vacancy.countDocuments(),
      Vacancy.countDocuments({ active: true }),
      School.countDocuments(),
      Candidate.countDocuments(),
      CandidateApplication.countDocuments(),
      SchoolRegistration.countDocuments(),
      HomeTutorRequest.countDocuments(),
      ContactMessage.countDocuments(),
      VacancyApplication.countDocuments(),
    ])

    res.json({
      vacancies,
      activeVacancies,
      schools,
      candidates,
      candidateApplications,
      schoolRegistrations,
      homeTutorRequests,
      contactMessages,
      vacancyApplications,
    })
  }),
)
