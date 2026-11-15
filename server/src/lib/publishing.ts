import type { CandidateApplication } from '../models/CandidateApplication.js'
import type { SchoolRegistration } from '../models/SchoolRegistration.js'

// How a private submission maps onto its public listing. Shared by the admin
// verify/approve routes and the owner's self-service Edit Profile route, so a
// listing always looks the same no matter which path last published it.
// Never includes `verified`/`registered`/`status` — those are admin-owned.

export const DEFAULT_SCHOOL_PHOTO = '/assets/images/School.jpg'

function humanize(slug: string) {
  return slug
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

export function candidateFieldsFrom(application: InstanceType<typeof CandidateApplication>) {
  const tags: string[] = []
  tags.push(application.teachWhere.includes('home_tuition') ? 'Home Tuition' : 'School Teaching')
  if (application.classes.length > 0) tags.push(application.classes.map(humanize).join(', '))

  const primarySubject = application.subjects.find((s) => s !== 'other') ?? application.subjects[0]

  return {
    name: application.fullName,
    role: primarySubject ? `${humanize(primarySubject)} Teacher` : `${application.major} Teacher`,
    city: application.city,
    area: application.area,
    qualification: application.degreeName || application.qualification,
    experience: application.isFresher === 'no' && application.experienceYears ? application.experienceYears : 'Fresher',
    tags,
    photo: application.profilePhotoPath ?? '',
    about: application.about ?? '',
    skills: application.skills ?? [],
  }
}

export function schoolFieldsFrom(registration: InstanceType<typeof SchoolRegistration>) {
  return {
    name: registration.schoolName,
    city: registration.schoolCity,
    area: registration.schoolArea,
    curriculum: registration.schoolBoard || 'Not specified',
    tag: registration.schoolType || registration.schoolBoard || 'Registered',
    registered: true,
    photo: registration.schoolLogoPath || DEFAULT_SCHOOL_PHOTO,
    subjects: registration.schoolGrades || 'Not specified',
    about: registration.schoolDesc || `${registration.schoolName} is a registered institution based in ${registration.schoolCity}.`,
    coverImage: registration.schoolCoverPath ?? '',
    address: registration.schoolAddress ?? '',
    website: registration.schoolWebsite ?? '',
    facilities: registration.schoolFacilities ?? [],
  }
}
