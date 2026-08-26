import fs from 'node:fs'
import path from 'node:path'

const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads')

/** Deletes a file previously saved under uploads/, given its stored "/uploads/<subdir>/<name>" path. */
export function deleteUploadedFile(storedPath: string | undefined | null) {
  if (!storedPath) return
  const relative = storedPath.replace(/^\/?uploads\//, '')
  const absolute = path.join(UPLOADS_ROOT, relative)
  if (!absolute.startsWith(UPLOADS_ROOT)) return // defensive: never delete outside uploads/
  fs.rm(absolute, { force: true }, (err) => {
    if (err) console.error('[files] failed to delete', absolute, err)
  })
}
