import { Router } from 'express'
import { CandidateApplication } from '../../models/CandidateApplication.js'
import { SchoolRegistration } from '../../models/SchoolRegistration.js'
import { HomeTutorRequest } from '../../models/HomeTutorRequest.js'
import { ContactMessage } from '../../models/ContactMessage.js'
import { VacancyApplication } from '../../models/VacancyApplication.js'
import { Vacancy } from '../../models/Vacancy.js'
import { School } from '../../models/School.js'
import { Candidate } from '../../models/Candidate.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { requirePermission } from '../../lib/permissions.js'
import type { Model } from 'mongoose'

export const adminReportsRouter = Router()
adminReportsRouter.use(requireAdmin, requirePermission('viewReports'))

const DAYS = 30

async function countsByDay(model: Model<any>) {
  const since = new Date()
  since.setDate(since.getDate() - (DAYS - 1))
  since.setHours(0, 0, 0, 0)

  const rows = await model.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
  ])
  const map = new Map<string, number>(rows.map((r: { _id: string; count: number }) => [r._id, r.count]))

  const days: { date: string; count: number }[] = []
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, count: map.get(key) ?? 0 })
  }
  return days
}

async function countBy(model: Model<any>, field: string) {
  const rows = await model.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $sort: { count: -1 } }])
  return rows.map((r: { _id: string | null; count: number }) => ({ label: r._id ?? 'Unspecified', count: r.count }))
}

adminReportsRouter.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    const [
      candidateApplicationsByDay,
      schoolRegistrationsByDay,
      homeTutorRequestsByDay,
      contactMessagesByDay,
      vacancyApplicationsByDay,
      applicationsByStatus,
      vacanciesByCity,
      vacanciesByEmploymentType,
      schoolsByCurriculum,
      candidatesByCity,
    ] = await Promise.all([
      countsByDay(CandidateApplication),
      countsByDay(SchoolRegistration),
      countsByDay(HomeTutorRequest),
      countsByDay(ContactMessage),
      countsByDay(VacancyApplication),
      countBy(CandidateApplication, 'applicationStatus'),
      countBy(Vacancy, 'city'),
      countBy(Vacancy, 'employmentType'),
      countBy(School, 'curriculum'),
      countBy(Candidate, 'city'),
    ])

    const submissionsByDay = candidateApplicationsByDay.map((row, i) => ({
      date: row.date,
      candidateApplications: row.count,
      schoolRegistrations: schoolRegistrationsByDay[i].count,
      homeTutorRequests: homeTutorRequestsByDay[i].count,
      contactMessages: contactMessagesByDay[i].count,
      vacancyApplications: vacancyApplicationsByDay[i].count,
    }))

    res.json({
      submissionsByDay,
      applicationsByStatus,
      vacanciesByCity,
      vacanciesByEmploymentType,
      schoolsByCurriculum,
      candidatesByCity,
    })
  }),
)
