import { Router } from 'express'
import { vacanciesRouter } from './vacancies.js'
import { schoolsRouter } from './schools.js'
import { candidatesRouter } from './candidates.js'
import { blogPostsRouter } from './blogPosts.js'
import { candidateRegistrationsRouter } from './candidateRegistrations.js'
import { schoolRegistrationsRouter } from './schoolRegistrations.js'
import { homeTutorRequestsRouter } from './homeTutorRequests.js'
import { contactMessagesRouter } from './contactMessages.js'

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
