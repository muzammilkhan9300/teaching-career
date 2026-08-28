import { Router } from 'express'
import { vacanciesRouter } from './vacancies.js'
import { schoolsRouter } from './schools.js'
import { candidatesRouter } from './candidates.js'
import { blogPostsRouter } from './blogPosts.js'
import { servicesRouter } from './services.js'
import { settingsRouter, adminSettingsRouter } from './settings.js'
import { candidateRegistrationsRouter } from './candidateRegistrations.js'
import { schoolRegistrationsRouter } from './schoolRegistrations.js'
import { homeTutorRequestsRouter } from './homeTutorRequests.js'
import { contactMessagesRouter } from './contactMessages.js'
import { userAuthRouter } from './userAuth.js'
import {
  adminVacanciesRouter,
  adminSchoolsRouter,
  adminCandidatesRouter,
  adminBlogPostsRouter,
  adminServicesRouter,
} from './admin/adminResources.js'
import {
  adminCandidateApplicationsRouter,
  adminSchoolRegistrationsRouter,
  adminHomeTutorRequestsRouter,
  adminContactMessagesRouter,
  adminVacancyApplicationsRouter,
} from './admin/adminSubmissions.js'
import { adminStatsRouter } from './admin/adminStats.js'
import { adminStaffRouter } from './admin/adminStaff.js'
import { adminAuditLogsRouter } from './admin/adminAuditLogs.js'
import { adminDocumentsRouter } from './admin/adminDocuments.js'
import { adminCandidateVerificationRouter } from './admin/adminCandidateVerification.js'
import { adminSchoolApprovalRouter } from './admin/adminSchoolApproval.js'
import { adminHomeTutorAssignmentRouter } from './admin/adminHomeTutorAssignment.js'
import { adminNotificationsRouter } from './admin/adminNotifications.js'
import { adminReportsRouter } from './admin/adminReports.js'

export const apiRouter = Router()

apiRouter.get('/health', (_req, res) => res.json({ ok: true }))

apiRouter.use('/vacancies', vacanciesRouter)
apiRouter.use('/schools', schoolsRouter)
apiRouter.use('/candidates', candidatesRouter)
apiRouter.use('/blog-posts', blogPostsRouter)
apiRouter.use('/services', servicesRouter)
apiRouter.use('/settings', settingsRouter)
apiRouter.use('/candidate-registrations', candidateRegistrationsRouter)
apiRouter.use('/school-registrations', schoolRegistrationsRouter)
apiRouter.use('/home-tutor-requests', homeTutorRequestsRouter)
apiRouter.use('/contact-messages', contactMessagesRouter)

apiRouter.use('/auth', userAuthRouter)

apiRouter.use('/admin/stats', adminStatsRouter)
apiRouter.use('/admin/reports', adminReportsRouter)
apiRouter.use('/admin/settings', adminSettingsRouter)
apiRouter.use('/admin/staff', adminStaffRouter)
apiRouter.use('/admin/audit-logs', adminAuditLogsRouter)
apiRouter.use('/admin/notifications', adminNotificationsRouter)
apiRouter.use('/admin/documents', adminDocumentsRouter)

apiRouter.use('/admin/vacancies', adminVacanciesRouter)
apiRouter.use('/admin/schools', adminSchoolsRouter)
apiRouter.use('/admin/candidates', adminCandidatesRouter)
apiRouter.use('/admin/blog-posts', adminBlogPostsRouter)
apiRouter.use('/admin/services', adminServicesRouter)

apiRouter.use('/admin/candidate-applications', adminCandidateVerificationRouter)
apiRouter.use('/admin/candidate-applications', adminCandidateApplicationsRouter)
apiRouter.use('/admin/school-registrations', adminSchoolApprovalRouter)
apiRouter.use('/admin/school-registrations', adminSchoolRegistrationsRouter)
apiRouter.use('/admin/home-tutor-requests', adminHomeTutorAssignmentRouter)
apiRouter.use('/admin/home-tutor-requests', adminHomeTutorRequestsRouter)
apiRouter.use('/admin/contact-messages', adminContactMessagesRouter)
apiRouter.use('/admin/vacancy-applications', adminVacancyApplicationsRouter)
