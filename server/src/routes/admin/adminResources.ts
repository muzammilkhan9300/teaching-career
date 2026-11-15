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
import { SchoolRequirement } from '../../models/SchoolRequirement.js'
import { HomepageUpdate } from '../../models/HomepageUpdate.js'
import { HomepageVideo } from '../../models/HomepageVideo.js'
import { HeroSlide } from '../../models/HeroSlide.js'
import {
  schoolRequirementInputSchema,
  homepageUpdateInputSchema,
  homepageVideoInputSchema,
  heroSlideInputSchema,
} from '../../validation/homepage.js'
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
  imageFields: ['image'],
})

// ---- Homepage hero content (Homepage Management in the admin panel) ----

const publishActions = {
  publish: (doc: { status: string }) => (doc.status = 'Published'),
  unpublish: (doc: { status: string }) => (doc.status = 'Draft'),
}

export const adminSchoolRequirementsRouter = createAdminCrudRouter(SchoolRequirement, schoolRequirementInputSchema, {
  resourceName: 'SchoolRequirement',
  statusActions: publishActions,
})

export const adminHomepageUpdatesRouter = createAdminCrudRouter(HomepageUpdate, homepageUpdateInputSchema, {
  resourceName: 'HomepageUpdate',
  statusActions: publishActions,
  imageFields: ['image'],
})

export const adminHomepageVideosRouter = createAdminCrudRouter(HomepageVideo, homepageVideoInputSchema, {
  resourceName: 'HomepageVideo',
  statusActions: publishActions,
})

export const adminHeroSlidesRouter = createAdminCrudRouter(HeroSlide, heroSlideInputSchema, {
  resourceName: 'HeroSlide',
  statusActions: {
    activate: (doc) => (doc.active = true),
    deactivate: (doc) => (doc.active = false),
  },
  imageFields: ['image'],
})
