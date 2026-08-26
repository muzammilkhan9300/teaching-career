import { CandidateApplication } from '../../models/CandidateApplication.js'
import { SchoolRegistration } from '../../models/SchoolRegistration.js'
import { HomeTutorRequest } from '../../models/HomeTutorRequest.js'
import { ContactMessage } from '../../models/ContactMessage.js'
import { VacancyApplication } from '../../models/VacancyApplication.js'
import { createAdminSubmissionRouter } from './createAdminSubmissionRouter.js'

export const adminCandidateApplicationsRouter = createAdminSubmissionRouter(CandidateApplication, 'applicationStatus')
export const adminSchoolRegistrationsRouter = createAdminSubmissionRouter(SchoolRegistration, 'registrationStatus')
export const adminHomeTutorRequestsRouter = createAdminSubmissionRouter(HomeTutorRequest, 'requestStatus')
export const adminContactMessagesRouter = createAdminSubmissionRouter(ContactMessage, 'status')
export const adminVacancyApplicationsRouter = createAdminSubmissionRouter(VacancyApplication, 'applicationStatus')
