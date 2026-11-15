// Sample school requirements and homepage updates. Used by the local seed
// script (seed.ts) and, once only, by bootstrapHomepageContent.ts to fill an
// empty production database so the homepage hero box isn't blank.

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)
const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000)

// Demo requirements — sample content for local development, like the rest of this seed.
export const schoolRequirementsSeed = [
  {
    jobTitle: 'Mathematics Teacher (O Level)',
    schoolName: 'Beacon School',
    city: 'Lahore',
    shortDescription: 'Experienced O Level Mathematics teacher for Grades 9–11, full time.',
    detailedDescription:
      'Beacon School requires a Mathematics teacher for O Level classes (Grades 9–11).\n\nRequirements: Master’s in Mathematics or a related field, at least 2 years of O Level teaching experience, and strong classroom communication.',
    publishedAt: daysAgo(1),
    expiresAt: daysFromNow(30),
  },
  {
    jobTitle: 'Computer Science Teacher',
    schoolName: 'Greenwood Academy',
    city: 'Karachi',
    shortDescription: 'Computer Science teacher for Cambridge curriculum, Grades 6–10.',
    detailedDescription:
      'Greenwood Academy is looking for a Computer Science teacher for its Cambridge stream.\n\nRequirements: BS Computer Science (or equivalent) and practical knowledge of Python and basic web development.',
    publishedAt: daysAgo(3),
    expiresAt: daysFromNow(21),
  },
  {
    jobTitle: 'Primary English Teacher',
    schoolName: 'City Grammar School',
    city: 'Islamabad',
    shortDescription: 'Primary English teacher with strong phonics and spoken English skills.',
    detailedDescription: 'City Grammar School requires a Primary English teacher for Grades 1–5. Fresh graduates with strong spoken English are encouraged.',
    publishedAt: daysAgo(12),
    expiresAt: null,
  },
]

export const homepageUpdatesSeed = [
  {
    title: 'Greenwood Academy joins TeachingCareer',
    description: 'Greenwood Academy, Karachi, is now registered with TeachingCareer for teacher recruitment.',
    image: '/assets/images/School1.jpg',
    publishedAt: daysAgo(2),
    readMoreUrl: '/school-profiles',
  },
  {
    title: 'Home tutor requests now open in all cities',
    description: 'Parents across Pakistan can now request a verified home tutor online.',
    image: '/assets/images/about-home-tutor.jpg',
    publishedAt: daysAgo(6),
    readMoreUrl: '/home-tutor',
  },
  {
    title: 'How we verify every teacher',
    description: 'Read how TeachingCareer reviews qualifications and experience before shortlisting candidates.',
    image: '',
    publishedAt: daysAgo(14),
    readMoreUrl: '/blog/teacher-verification-explained',
  },
]
