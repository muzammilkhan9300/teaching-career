import fs from 'node:fs'
import path from 'node:path'
import multer, { type FileFilterCallback } from 'multer'
import type { Request } from 'express'
import { env } from '../config/env.js'

const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads')

const PHOTO_FIELDS = new Set(['profilePhoto', 'schoolLogo'])
const DOCUMENT_FIELDS = new Set(['degreeDocument', 'experienceDocument', 'policeVerification'])

const PHOTO_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const DOCUMENT_EXTS = new Set(['.pdf', '.jpg', '.jpeg', '.png'])

function subdirFor(fieldname: string) {
  if (fieldname === 'schoolLogo') return 'logos'
  if (PHOTO_FIELDS.has(fieldname)) return 'photos'
  return 'documents'
}

const storage = multer.diskStorage({
  destination(_req: Request, file, callback) {
    const dir = path.join(UPLOADS_ROOT, subdirFor(file.fieldname))
    fs.mkdirSync(dir, { recursive: true })
    callback(null, dir)
  },
  filename(_req: Request, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase()
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    callback(null, unique)
  },
})

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase()
  const allowed = PHOTO_FIELDS.has(file.fieldname) ? PHOTO_EXTS : DOCUMENT_FIELDS.has(file.fieldname) ? DOCUMENT_EXTS : null

  if (!allowed) {
    callback(new Error(`Unexpected file field: ${file.fieldname}`))
    return
  }
  if (!allowed.has(ext)) {
    callback(new Error(`File type not allowed for "${file.fieldname}". Allowed: ${[...allowed].join(', ')}`))
    return
  }
  callback(null, true)
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
})

/** Public URL path (served by app.ts's express.static) for a saved upload. */
export function uploadedFileUrl(file: Express.Multer.File) {
  return `/uploads/${subdirFor(file.fieldname)}/${file.filename}`
}
