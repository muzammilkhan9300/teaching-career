import path from 'node:path'
import multer, { type FileFilterCallback, type StorageEngine } from 'multer'
import type { Request } from 'express'
import { env } from '../config/env.js'
import { HttpError } from '../utils/HttpError.js'
import { deleteFile, saveFile } from '../lib/fileStore.js'

// homepageImage: admin-uploaded hero slides, service thumbnails and update
// logos (routes/admin/adminUploads.ts) — public, stored in uploads/homepage.
// schoolCover: a school's public cover image (Edit Profile), stored in uploads/covers.
const PHOTO_FIELDS = new Set(['profilePhoto', 'schoolLogo', 'homepageImage', 'schoolCover'])
const DOCUMENT_FIELDS = new Set(['degreeDocument', 'experienceDocument', 'policeVerification'])

const PHOTO_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const DOCUMENT_EXTS = new Set(['.pdf', '.jpg', '.jpeg', '.png'])
// degreeDocument is the "Resume / CV" upload — Word files are allowed there only.
const CV_EXTS = new Set(['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'])

function subdirFor(fieldname: string) {
  if (fieldname === 'schoolLogo') return 'logos'
  if (fieldname === 'homepageImage') return 'homepage'
  if (fieldname === 'schoolCover') return 'covers'
  if (PHOTO_FIELDS.has(fieldname)) return 'photos'
  return 'documents'
}

// Files go straight into persistent storage (lib/fileStore.ts — MongoDB
// GridFS), never onto the app's own disk, which the host wipes on redeploy.
// `file.filename` is set exactly as the old disk storage did, so
// uploadedFileUrl() and every stored "/uploads/<dir>/<name>" path are unchanged.
const storage: StorageEngine = {
  _handleFile(_req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase()
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    saveFile(`${subdirFor(file.fieldname)}/${filename}`, file.stream)
      .then((size) => callback(null, { filename, size }))
      .catch((err) => callback(err))
  },
  // Called by multer when a request fails after a file was stored (e.g. a
  // later file in the same request is too large) — don't leave it behind.
  _removeFile(_req, file, callback) {
    deleteFile(`${subdirFor(file.fieldname)}/${file.filename}`).then(() => callback(null))
  },
}

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase()
  const allowed = PHOTO_FIELDS.has(file.fieldname)
    ? PHOTO_EXTS
    : file.fieldname === 'degreeDocument'
      ? CV_EXTS
      : DOCUMENT_FIELDS.has(file.fieldname)
        ? DOCUMENT_EXTS
        : null

  if (!allowed) {
    callback(new HttpError(400, `Unexpected file field: ${file.fieldname}`))
    return
  }
  if (!allowed.has(ext)) {
    callback(new HttpError(400, `File type not allowed for "${file.fieldname}". Allowed: ${[...allowed].join(', ')}`))
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
