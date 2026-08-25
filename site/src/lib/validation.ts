import { z } from 'zod'

const MAX_PHOTO_BYTES = 2 * 1024 * 1024
const MAX_DOC_BYTES = 5 * 1024 * 1024
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp']
const DOC_EXTS = ['pdf', 'jpg', 'jpeg', 'png']
const LOGO_EXTS = ['jpg', 'jpeg', 'png']

function fileExt(files: FileList) {
  return files[0]?.name.split('.').pop()?.toLowerCase() ?? ''
}

function optionalFile(maxBytes: number, allowedExts: string[]) {
  return z
    .custom<FileList | undefined>()
    .refine((files) => !files || files.length === 0 || files[0].size <= maxBytes, {
      message: `File is too large. Max ${Math.round(maxBytes / 1024 / 1024)}MB.`,
    })
    .refine((files) => !files || files.length === 0 || allowedExts.includes(fileExt(files)), {
      message: `File type not allowed. Allowed: ${allowedExts.join(', ')}.`,
    })
}

function requiredFile(maxBytes: number, allowedExts: string[], requiredMessage: string) {
  return optionalFile(maxBytes, allowedExts).refine((files) => !!files && files.length > 0, {
    message: requiredMessage,
  })
}

export const candidateRegistrationSchema = z
  .object({
    profilePhoto: optionalFile(MAX_PHOTO_BYTES, IMAGE_EXTS),
    fullName: z.string().min(2, 'Please enter your full name.'),
    email: z.string().min(1, 'Please enter your email address.').email('Please enter a valid email address.'),
    whatsapp: z.string().min(7, 'Please enter a valid WhatsApp number.'),
    city: z.string().min(1, 'Please select your city.'),
    area: z.string().min(1, 'Please enter your area.'),
    gender: z.string().optional(),
    qualification: z.string().min(1, 'Please select your highest qualification.'),
    degreeName: z.string().min(1, 'Please enter your degree / qualification name.'),
    major: z.string().min(1, 'Please enter your field / major.'),
    institute: z.string().min(1, 'Please enter your university / institute.'),
    completionYear: z.string().optional(),
    degreeDocument: requiredFile(MAX_DOC_BYTES, DOC_EXTS, 'Degree / qualification document is required.'),
    isFresher: z.enum(['yes', 'no']),
    experienceYears: z.string().optional(),
    experienceOrg: z.string().optional(),
    experienceDocument: optionalFile(MAX_DOC_BYTES, DOC_EXTS),
    experienceDetails: z.string().optional(),
    teachWhere: z.array(z.string()).min(1, 'Please select at least one teaching preference.'),
    policeVerification: optionalFile(MAX_DOC_BYTES, DOC_EXTS),
    subjects: z.array(z.string()).min(1, 'Please select at least one subject.'),
    subjectOther: z.string().optional(),
    classes: z.array(z.string()).optional(),
    classOther: z.string().optional(),
    availability: z.string().optional(),
    preferredTime: z.string().optional(),
    declaration: z.boolean().refine((v) => v === true, 'Please confirm the declaration to continue.'),
  })
  .superRefine((data, ctx) => {
    if (data.isFresher === 'no' && (!data.experienceDocument || data.experienceDocument.length === 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['experienceDocument'],
        message: 'Experience letter / proof of experience is required since you selected "No" for Fresher.',
      })
    }
  })

export type CandidateRegistrationInput = z.infer<typeof candidateRegistrationSchema>

export const schoolRegistrationSchema = z.object({
  schoolName: z.string().min(2, 'Please enter the school name.'),
  schoolCity: z.string().min(1, 'Please select the city.'),
  schoolArea: z.string().min(1, 'Please enter the area.'),
  schoolLogo: optionalFile(MAX_PHOTO_BYTES, LOGO_EXTS),
  schoolYear: z.string().min(1, 'Please enter the year established.'),
  schoolBranches: z.string().optional(),
  schoolWebsite: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+\..+/.test(v), 'Please enter a valid website URL.'),
  schoolWhatsapp: z.string().min(7, 'Please enter a valid WhatsApp number.'),
  schoolPhone: z.string().min(7, 'Please enter a valid phone number.'),
  schoolType: z.string().optional(),
  schoolBoard: z.string().optional(),
  schoolGrades: z.string().optional(),
  schoolDesc: z.string().optional(),
})

export type SchoolRegistrationInput = z.infer<typeof schoolRegistrationSchema>

export const homeTutorSchema = z.object({
  parentName: z.string().min(2, 'Please enter your name.'),
  parentEmail: z.string().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
  parentWhatsapp: z.string().min(7, 'Please enter a valid WhatsApp number.'),
  parentCity: z.string().min(1, 'Please select your city.'),
  parentArea: z.string().min(1, 'Please enter your area.'),
  contactTime: z.string().optional(),
  studentName: z.string().min(2, 'Please enter the student name.'),
  studentClass: z.string().min(1, 'Please select the class / grade.'),
  studentGender: z.string().optional(),
  subjectsNeeded: z.string().min(1, 'Please select the subject(s) needed.'),
  syllabus: z.string().optional(),
  purpose: z.string().optional(),
  daysPerWeek: z.string().optional(),
  preferredTime: z.string().optional(),
  tuitionLocation: z.string().optional(),
  urgency: z.string().optional(),
  additionalReq: z.string().optional(),
  parentMessage: z.string().optional(),
  agreeTerms: z.boolean().refine((v) => v === true, 'Please agree to the terms to continue.'),
})

export type HomeTutorInput = z.infer<typeof homeTutorSchema>

export const contactMessageSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  email: z.string().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
  message: z.string().min(5, 'Please enter your message.'),
})

export type ContactMessageInput = z.infer<typeof contactMessageSchema>
