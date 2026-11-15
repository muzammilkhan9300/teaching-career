import { z } from 'zod'
import { parseYouTubeId } from '../lib/youtube.js'

// Shared field rules for the homepage content managed in the admin panel.

/** '' or an internal path ("/services", "/blog/slug") or an absolute http(s) URL. */
export const optionalLink = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === '' || (v.startsWith('/') && !v.startsWith('//')) || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v), {
    message: 'Enter a site path starting with "/" or a full https:// link.',
  })
  .default('')

/** Images must come from the admin uploader (/uploads/homepage/...) or the bundled site assets. */
const imagePath = z
  .string()
  .trim()
  .regex(/^\/(uploads\/homepage|assets\/images)\/[A-Za-z0-9._-]+$/, 'Upload an image using the image field.')

export const optionalImage = z.union([z.literal(''), imagePath]).default('')

const order = z.coerce.number().int().min(-1000).max(1000).default(0)

const requiredDate = z.preprocess((v) => (v === '' || v === null || v === undefined ? new Date() : v), z.coerce.date())

// Expiry picked as a plain day ("2026-12-31") means "open until the end of
// that day", not midnight at its start.
const optionalExpiryDate = z.preprocess((v) => {
  if (v === '' || v === undefined) return null
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T23:59:59.999Z`
  return v
}, z.coerce.date().nullable())

export const schoolRequirementInputSchema = z
  .object({
    jobTitle: z.string().trim().min(2, 'Enter the job title.').max(150),
    schoolName: z.string().trim().min(2, 'Enter the school name.').max(150),
    city: z.string().trim().min(2, 'Enter the city.').max(80),
    shortDescription: z.string().trim().min(5, 'Enter a short description.').max(300),
    detailedDescription: z.string().trim().max(5000).default(''),
    publishedAt: requiredDate,
    expiresAt: optionalExpiryDate,
    order,
  })
  .refine((d) => !d.expiresAt || d.expiresAt > d.publishedAt, {
    message: 'Expiry date must be after the publication date.',
    path: ['expiresAt'],
  })

export const homepageUpdateInputSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title.').max(150),
  description: z.string().trim().min(5, 'Enter a short description.').max(400),
  image: optionalImage,
  publishedAt: requiredDate,
  readMoreUrl: optionalLink,
  order,
})

export const homepageVideoInputSchema = z
  .object({
    title: z.string().trim().min(2, 'Enter a video title.').max(150),
    description: z.string().trim().max(400).default(''),
    youtubeUrl: z.string().trim().min(1, 'Paste a YouTube link.'),
    order,
  })
  .transform((data, ctx) => {
    const youtubeId = parseYouTubeId(data.youtubeUrl)
    if (!youtubeId) {
      ctx.addIssue({
        code: 'custom',
        path: ['youtubeUrl'],
        message: 'Enter a valid YouTube link (youtube.com/watch?v=… or youtu.be/…).',
      })
      return z.NEVER
    }
    return { ...data, youtubeId }
  })

export const heroSlideInputSchema = z.object({
  image: imagePath,
  alt: z.string().trim().max(200).default(''),
  position: z
    .string()
    .trim()
    .regex(/^(100|[1-9]?\d)% (100|[1-9]?\d)%$/, 'Use the form "50% 50%" (horizontal% vertical%).')
    .default('50% 50%'),
  order,
  active: z.boolean().default(true),
})
