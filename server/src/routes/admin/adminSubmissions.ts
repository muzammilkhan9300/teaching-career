import { CandidateApplication } from '../../models/CandidateApplication.js'
import { SchoolRegistration } from '../../models/SchoolRegistration.js'
import { HomeTutorRequest } from '../../models/HomeTutorRequest.js'
import { ContactMessage } from '../../models/ContactMessage.js'
import { VacancyApplication } from '../../models/VacancyApplication.js'
import { createAdminSubmissionRouter } from './createAdminSubmissionRouter.js'

export const adminCandidateApplicationsRouter = createAdminSubmissionRouter(CandidateApplication, 'applicationStatus', 'CandidateApplication')
export const adminSchoolRegistrationsRouter = createAdminSubmissionRouter(SchoolRegistration, 'registrationStatus', 'SchoolRegistration')
export const adminHomeTutorRequestsRouter = createAdminSubmissionRouter(HomeTutorRequest, 'requestStatus', 'HomeTutorRequest')
export const adminContactMessagesRouter = createAdminSubmissionRouter(ContactMessage, 'status', 'ContactMessage')
export const adminVacancyApplicationsRouter = createAdminSubmissionRouter(VacancyApplication, 'applicationStatus', 'VacancyApplication')
