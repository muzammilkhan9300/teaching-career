import fs from 'node:fs'
import path from 'node:path'
import type { Readable } from 'node:stream'
import mongoose from 'mongoose'
import { env } from '../config/env.js'

// Persistent storage for every uploaded file (photos, logos, covers, homepage
// images and verification documents).
//
// Why the database: the app's own folder (server/uploads) is NOT persistent on
// the host — every redeploy replaces the app directory, so files written there
// vanished while the database kept pointing at them. Files are now stored in
// MongoDB GridFS (bucket "uploads"), which lives in the same Atlas database as
// the records that reference them and survives restarts and redeploys.
//
// Keys mirror the public URL: a file served at /uploads/photos/123.jpg is
// stored under the GridFS filename "photos/123.jpg", so stored paths in the
// database ("/uploads/<dir>/<name>") are unchanged and remain valid.

const BUCKET = 'uploads'

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export function contentTypeFor(name: string) {
  return CONTENT_TYPES[path.extname(name).toLowerCase()] ?? 'application/octet-stream'
}

function bucket() {
  const db = mongoose.connection.db
  if (!db) throw new Error('Database is not connected')
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET })
}

/** "/uploads/photos/a.jpg" or "photos/a.jpg" -> "photos/a.jpg"; rejects anything that isn't <dir>/<file>. */
export function keyFromStoredPath(storedPath: string) {
  const key = storedPath.replace(/^\/?uploads\//, '')
  return /^[a-z]+\/[A-Za-z0-9._-]+$/.test(key) ? key : null
}

/** Streams a file into storage under `key`. Resolves with the stored size in bytes. */
export function saveFile(key: string, source: Readable) {
  return new Promise<number>((resolve, reject) => {
    const upload = bucket().openUploadStream(key, { metadata: { contentType: contentTypeFor(key) } })
    let size = 0
    source.on('data', (chunk: Buffer) => (size += chunk.length))
    source.on('error', (err) => {
      upload.abort().catch(() => {})
      reject(err)
    })
    upload.on('error', reject)
    upload.on('finish', () => resolve(size))
    source.pipe(upload)
  })
}

/** Opens a stored file for reading, or returns null if it doesn't exist. */
export async function openFile(key: string) {
  const file = await bucket().find({ filename: key }).sort({ uploadDate: -1 }).limit(1).next()
  if (!file) return null
  return {
    length: file.length,
    contentType: (file.metadata?.contentType as string | undefined) ?? contentTypeFor(key),
    stream: () => bucket().openDownloadStream(file._id),
  }
}

/** Deletes every stored copy of `key`. Never throws. */
export async function deleteFile(key: string) {
  try {
    const files = await bucket().find({ filename: key }).toArray()
    await Promise.all(files.map((f) => bucket().delete(f._id)))
  } catch (err) {
    console.error('[fileStore] failed to delete', key, err)
  }
}

/**
 * One-time-per-file import of anything still sitting in the old on-disk
 * uploads folder (server/uploads/<dir>/<file>) into persistent storage, so
 * files uploaded before this change keep working. Idempotent: files already
 * stored are skipped. Runs on every start; cheap when there's nothing to do.
 */
export async function importDiskUploads() {
  const root = env.uploadsRoot
  if (!fs.existsSync(root)) return
  let imported = 0
  for (const dir of fs.readdirSync(root)) {
    const dirPath = path.join(root, dir)
    if (!fs.statSync(dirPath).isDirectory()) continue
    for (const name of fs.readdirSync(dirPath)) {
      const key = keyFromStoredPath(`${dir}/${name}`)
      if (!key || !fs.statSync(path.join(dirPath, name)).isFile()) continue
      if (await openFile(key)) continue
      await saveFile(key, fs.createReadStream(path.join(dirPath, name)))
      imported++
    }
  }
  if (imported) console.log(`[fileStore] imported ${imported} file(s) from the local uploads folder into persistent storage`)
}
