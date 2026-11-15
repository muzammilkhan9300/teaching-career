import { z } from 'zod'

// Self-service Edit Profile for a verified candidate / approved school.
// Both schemas are `.strict()`: any key that isn't on these allow-lists —
// document paths, statuses, ownerId, verified/registered flags, etc. — makes
// the whole request fail with 400 instead of being silently ignored.
// Bodies arrive as multipart/form-data, so arrays are JSON-encoded strings.

const jsonStringArray = (maxItems: number, itemMax: number) =>
  z.preprocess(
    (val) => {
      if (typeof val !== 'string') return val
      try {
        return JSON.parse(val)
      } catch {
        return val
      }
    },
    z.array(z.string().trim().min(1).max(itemMax)).max(maxItems),
  )

const optionalText = (max: number) => z.string().trim().max(max).optional().default('')
const phone = z.string().trim().regex(/^[0-9+()\-\s]{7,20}$/, 'Enter a valid phone number (digits, spaces, + or -).')
const yesFlag = z.enum(['true', 'false']).optional()

export const candidateProfileEditSchema = z
  .object({
    // Public profile
    fullName: z.string().trim().min(2, 'Enter your full name.').max(100),
    city: z.string().trim().min(1, 'Enter your city.').max(80),
    area: z.string().trim().min(1, 'Enter your area / address.').max(150),
    about: optionalText(1000),
    skills: jsonStringArray(20, 40).default([]),
    // Education
    qualification: z.string().trim().min(1, 'Select your highest qualification.').max(60),
    degreeName: z.string().trim().min(1, 'Enter your degree name.').max(150),
    major: z.string().trim().min(1, 'Enter your field / major.').max(150),
    institute: z.string().trim().min(1, 'Enter your university / institute.').max(150),
    completionYear: z.string().trim().regex(/^(19|20)\d{2}$/, 'Enter a 4-digit year.').or(z.literal('')).optional().default(''),
    // Teaching
    subjects: jsonStringArray(15, 40).refine((a) => a.length > 0, 'Select at least one subject.'),
    subjectOther: optionalText(80),
    classes: jsonStringArray(10, 40).default([]),
    classOther: optionalText(80),
    // Only applied for candidates already verified as experienced — switching
    // fresher/experienced needs an experience letter, i.e. a full resubmission.
    experienceYears: optionalText(40),
    experienceOrg: optionalText(150),
    experienceDetails: optionalText(1500),
    // Private contact (never shown publicly)
    whatsapp: phone,
    email: z.string().trim().email('Enter a valid email address.').max(150),
    removeProfilePhoto: yesFlag,
  })
  .strict()

export const schoolProfileEditSchema = z
  .object({
    // Public profile
    schoolName: z.string().trim().min(2, 'Enter the school name.').max(150),
    schoolCity: z.string().trim().min(1, 'Enter the city.').max(80),
    schoolArea: z.string().trim().min(1, 'Enter the area.').max(120),
    schoolAddress: optionalText(250),
    schoolWebsite: z
      .string()
      .trim()
      .max(200)
      .refine((v) => v === '' || /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(v), 'Enter a full website address starting with https://')
      .optional()
      .default(''),
    schoolDesc: z.string().trim().min(20, 'Write at least a short description (20+ characters).').max(2000),
    schoolFacilities: jsonStringArray(20, 60).default([]),
    // Private contact (never shown publicly)
    schoolPhone: phone,
    schoolWhatsapp: phone,
    schoolEmail: z.string().trim().email('Enter a valid email address.').max(150).or(z.literal('')).optional().default(''),
    removeCoverImage: yesFlag,
  })
  .strict()
