import mongoose from 'mongoose'
import { SchoolRequirement } from '../models/SchoolRequirement.js'
import { HomepageUpdate } from '../models/HomepageUpdate.js'
import { schoolRequirementsSeed, homepageUpdatesSeed } from './homepageSamples.js'

// Runs on every server start, but each section is filled at most ONCE per
// database: a marker in `bootstrap_flags` records that it ran, so content an
// admin later deletes or unpublishes is never brought back. It only inserts
// into a section that is completely empty — existing records are never
// touched, overwritten or deleted.

const FLAGS = 'bootstrap_flags'

async function fillOnce(key: string, model: mongoose.Model<any>, docs: object[]) {
  const flags = mongoose.connection.db!.collection<{ _id: string; ranAt: Date; inserted: number }>(FLAGS)
  if (await flags.findOne({ _id: key })) return

  const existing = await model.estimatedDocumentCount()
  const inserted = existing === 0 ? (await model.insertMany(docs)).length : 0
  await flags.insertOne({ _id: key, ranAt: new Date(), inserted })
  if (inserted) console.log(`[bootstrap] added ${inserted} sample ${key} to the empty collection`)
}

export async function bootstrapHomepageContent() {
  try {
    await fillOnce('school-requirements', SchoolRequirement, schoolRequirementsSeed)
    await fillOnce('homepage-updates', HomepageUpdate, homepageUpdatesSeed)
  } catch (err) {
    // Never block the site from starting over sample content.
    console.error('[bootstrap] homepage sample content skipped', err)
  }
}
