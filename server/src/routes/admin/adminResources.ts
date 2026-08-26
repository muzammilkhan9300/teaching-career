import { Vacancy } from '../../models/Vacancy.js'
import { School } from '../../models/School.js'
import { Candidate } from '../../models/Candidate.js'
import { vacancyInputSchema, schoolInputSchema, candidateInputSchema } from '../../validation/adminResources.js'
import { createAdminCrudRouter } from './createAdminCrudRouter.js'

export const adminVacanciesRouter = createAdminCrudRouter(Vacancy, vacancyInputSchema)
export const adminSchoolsRouter = createAdminCrudRouter(School, schoolInputSchema)
export const adminCandidatesRouter = createAdminCrudRouter(Candidate, candidateInputSchema)
