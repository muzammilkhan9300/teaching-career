import fs from 'node:fs'
import path from 'node:path'
import { env } from '../config/env.js'
import { deleteFile, keyFromStoredPath } from './fileStore.js'

const UPLOADS_ROOT = env.uploadsRoot

/**
 * Deletes a previously uploaded file, given its stored "/uploads/<subdir>/<name>"
 * path: removes it from persistent storage (lib/fileStore.ts) and any leftover
 * copy in the old on-disk uploads folder. Fire-and-forget; never throws.
 */
export function deleteUploadedFile(storedPath: string | undefined | null) {
  if (!storedPath) return
  const key = keyFromStoredPath(storedPath)
  if (!key) return // never touch /assets images, external URLs or odd paths
  void deleteFile(key)

  const absolute = path.join(UPLOADS_ROOT, key)
  if (!absolute.startsWith(UPLOADS_ROOT)) return // defensive: never delete outside uploads/
  fs.rm(absolute, { force: true }, (err) => {
    if (err) console.error('[files] failed to delete', absolute, err)
  })
}
