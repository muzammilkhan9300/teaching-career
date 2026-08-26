import { Router } from 'express'
import { vacanciesRouter } from './vacancies.js'
import { schoolsRouter } from './schools.js'
import { candidatesRouter } from './candidates.js'
import { blogPostsRouter } from './blogPosts.js'
import { candidateRegistrationsRouter } from './candidateRegistrations.js'
import { schoolRegistrationsRouter } from './schoolRegistrations.js'
import { homeTutorRequestsRouter } from './homeTutorRequests.js'
import { contactMessagesRouter } from './contactMessages.js'
import { adminAuthRouter } from './adminAuth.js'
import { adminVacanciesRouter, adminSchoolsRouter, adminCandidatesRouter } from './admin/adminResources.js'
import {
  adminCandidateApplicationsRouter,
  adminSchoolRegistrationsRouter,
  adminHomeTutorRequestsRouter,
  adminContactMessagesRouter,
  adminVacancyApplicationsRouter,
} from './admin/adminSubmissions.js'
import { adminStatsRouter } from './admin/adminStats.js'

export const apiRouter = Router()

apiRouter.get('/health', (_req, res) => res.json({ ok: true }))

apiRouter.use('/vacancies', vacanciesRouter)
apiRouter.use('/schools', schoolsRouter)
apiRouter.use('/candidates', candidatesRouter)
apiRouter.use('/blog-posts', blogPostsRouter)
apiRouter.use('/candidate-registrations', candidateRegistrationsRouter)
apiRouter.use('/school-registrations', schoolRegistrationsRouter)
apiRouter.use('/home-tutor-requests', homeTutorRequestsRouter)
apiRouter.use('/contact-messages', contactMessagesRouter)

apiRouter.use('/admin/auth', adminAuthRouter)
apiRouter.use('/admin/stats', adminStatsRouter)
apiRouter.use('/admin/vacancies', adminVacanciesRouter)
apiRouter.use('/admin/schools', adminSchoolsRouter)
apiRouter.use('/admin/candidates', adminCandidatesRouter)
apiRouter.use('/admin/candidate-applications', adminCandidateApplicationsRouter)
apiRouter.use('/admin/school-registrations', adminSchoolRegistrationsRouter)
apiRouter.use('/admin/home-tutor-requests', adminHomeTutorRequestsRouter)
apiRouter.use('/admin/contact-messages', adminContactMessagesRouter)
apiRouter.use('/admin/vacancy-applications', adminVacancyApplicationsRouter)
