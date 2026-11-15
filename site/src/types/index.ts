export interface Vacancy {
  id: string
  title: string
  school: string
  schoolId: string
  subject: string
  qualification: string
  experience: string
  curriculum: string
  employmentType: 'Full Time' | 'Part Time'
  salaryRange: string
  city: string
  area: string
  joiningDate: string
  teachersNeeded: number
  description: string
  active: boolean
  archived: boolean
}

export interface School {
  id: string
  name: string
  city: string
  area: string
  curriculum: string
  tag: string
  registered: boolean
  photo: string
  about: string
  subjects: string
  status: 'Active' | 'Suspended'
  activeVacancyCount: number
  // Owner-editable public extras (may be empty for older listings)
  coverImage?: string
  address?: string
  website?: string
  facilities?: string[]
}

export interface Candidate {
  id: string
  name: string
  role: string
  city: string
  area: string
  qualification: string
  experience: string
  tags: string[]
  verified: boolean
  photo: string
  status: 'Active' | 'Suspended'
  // Owner-editable public extras (may be empty for older listings)
  about?: string
  skills?: string[]
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  body: string[]
  status: 'Draft' | 'Published' | 'Archived'
}

export interface Service {
  id: string
  title: string
  description: string
  icon: 'cap' | 'person' | 'pin' | 'check' | 'shield' | 'clock' | 'book'
  order: number
  status: 'Draft' | 'Published' | 'Archived'
  showAsNew: boolean
  image: string
  learnMoreUrl: string
}

// ---- Homepage hero content (managed under Admin → Homepage) ----

export interface SchoolRequirement {
  id: string
  jobTitle: string
  schoolName: string
  city: string
  shortDescription: string
  detailedDescription: string
  publishedAt: string
  expiresAt: string | null
  order: number
  status: 'Draft' | 'Published'
  createdAt: string
}

export interface HomepageUpdate {
  id: string
  title: string
  description: string
  image: string
  publishedAt: string
  readMoreUrl: string
  order: number
  status: 'Draft' | 'Published'
  createdAt: string
}

export interface HomepageVideo {
  id: string
  title: string
  description: string
  youtubeUrl: string
  youtubeId: string
  order: number
  status: 'Draft' | 'Published'
  createdAt: string
}

export interface HeroSlide {
  id: string
  image: string
  alt: string
  position: string
  order: number
  active: boolean
  createdAt: string
}

export interface HomepageContent {
  slides: HeroSlide[]
  requirements: SchoolRequirement[]
  services: Service[]
  updates: HomepageUpdate[]
  videos: HomepageVideo[]
}

export interface Settings {
  id: string
  phone: string
  phoneSecondary?: string
  whatsapp: string
  email: string
  address: string
  social: {
    instagram: string
    facebook: string
    linkedin: string
    youtube: string
  }
}

export interface SchoolDetail extends School {
  activeVacancies: Vacancy[]
}

export interface CandidatesPage {
  items: Candidate[]
  total: number
  page: number
  totalPages: number
}

export type SuccessType = 'candidate' | 'school' | 'home-tutor' | 'application'

export interface MyCandidateApplication {
  id: string
  /** Set once verified — the public Candidate listing this application owns. */
  publishedCandidateId?: string
  skills?: string[]
  about?: string
  fullName: string
  email: string
  whatsapp: string
  city: string
  area: string
  gender?: string
  qualification: string
  degreeName: string
  major: string
  institute: string
  completionYear?: string
  isFresher: 'yes' | 'no'
  experienceYears?: string
  experienceOrg?: string
  experienceDetails?: string
  teachWhere: string[]
  subjects: string[]
  subjectOther?: string
  classes: string[]
  classOther?: string
  availability?: string
  preferredTime?: string
  declaration: boolean
  profilePhotoPath?: string
  degreeDocumentPath?: string
  experienceDocumentPath?: string
  policeVerificationPath?: string
  homeTuitionEligibility: 'Pending' | 'Not Requested'
  policeVerificationStatus: 'Pending' | 'Not Required'
  applicationStatus: 'New' | 'Reviewed' | 'Resubmitted' | 'Verified' | 'Rejected'
  rejectionReason?: string
  submittedAt?: string
  approvedAt?: string
  rejectedAt?: string
  createdAt: string
  updatedAt: string
}

export interface MySchoolRegistration {
  id: string
  publishedSchoolId?: string
  schoolName: string
  schoolCity: string
  schoolArea: string
  schoolLogoPath?: string
  schoolYear: string
  schoolBranches?: string
  schoolWebsite?: string
  schoolWhatsapp: string
  schoolPhone: string
  schoolType?: string
  schoolBoard?: string
  schoolGrades?: string
  schoolDesc?: string
  schoolCoverPath?: string
  schoolAddress?: string
  schoolEmail?: string
  schoolFacilities?: string[]
  registrationStatus: 'Pending' | 'Approved' | 'Rejected' | 'Resubmitted'
  rejectionReason?: string
  submittedAt?: string
  approvedAt?: string
  rejectedAt?: string
  createdAt: string
  updatedAt: string
}
