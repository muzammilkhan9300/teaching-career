import { Vacancy } from '../../models/Vacancy.js'
import { School } from '../../models/School.js'
import { Candidate } from '../../models/Candidate.js'
import { BlogPost } from '../../models/BlogPost.js'
import { Service } from '../../models/Service.js'
import {
  vacancyInputSchema,
  schoolInputSchema,
  candidateInputSchema,
  blogPostInputSchema,
  serviceInputSchema,
} from '../../validation/adminResources.js'
import { createAdminCrudRouter } from './createAdminCrudRouter.js'

export const adminVacanciesRouter = createAdminCrudRouter(Vacancy, vacancyInputSchema, {
  resourceName: 'Vacancy',
  statusActions: {
    close: (doc) => (doc.active = false),
    publish: (doc) => (doc.active = true),
    archive: (doc) => (doc.archived = true),
    restore: (doc) => (doc.archived = false),
  },
})

export const adminSchoolsRouter = createAdminCrudRouter(School, schoolInputSchema, {
  resourceName: 'School',
  statusActions: {
    suspend: (doc) => (doc.status = 'Suspended'),
    restore: (doc) => (doc.status = 'Active'),
  },
})

export const adminCandidatesRouter = createAdminCrudRouter(Candidate, candidateInputSchema, {
  resourceName: 'Candidate',
  statusActions: {
    suspend: (doc) => (doc.status = 'Suspended'),
    restore: (doc) => (doc.status = 'Active'),
  },
})

export const adminBlogPostsRouter = createAdminCrudRouter(BlogPost, blogPostInputSchema, {
  resourceName: 'BlogPost',
  statusActions: {
    publish: (doc) => (doc.status = 'Published'),
    unpublish: (doc) => (doc.status = 'Draft'),
    archive: (doc) => (doc.status = 'Archived'),
  },
})

export const adminServicesRouter = createAdminCrudRouter(Service, serviceInputSchema, {
  resourceName: 'Service',
  statusActions: {
    publish: (doc) => (doc.status = 'Published'),
    unpublish: (doc) => (doc.status = 'Draft'),
    archive: (doc) => (doc.status = 'Archived'),
  },
})
