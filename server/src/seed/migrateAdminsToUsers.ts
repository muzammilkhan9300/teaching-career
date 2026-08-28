import mongoose from 'mongoose'
import { connectDb } from '../db/connect.js'
import { User } from '../models/User.js'

// One-off migration for the Admin -> User merge. Reads the old `admins`
// collection directly (no Mongoose model needed) and copies each account
// into `users`, preserving its bcrypt hash as-is (no rehash needed) and its
// role. Does not touch or drop the old collection — it's left in place,
// unused, as a rollback safety net.
async function main() {
  await connectDb()
  const db = mongoose.connection.db
  if (!db) throw new Error('No database connection')

  const oldAdmins = await db.collection('admins').find({}).toArray()
  console.log(`[migrate] found ${oldAdmins.length} account(s) in the old admins collection`)

  let migrated = 0
  let skipped = 0

  for (const admin of oldAdmins) {
    const email = String(admin.email).toLowerCase()
    const existing = await User.findOne({ email })

    if (existing) {
      if (existing.role !== 'user') {
        console.log(`[migrate] SKIP ${email} — already a User with role "${existing.role}"`)
      } else {
        console.log(`[migrate] CONFLICT ${email} — a public User account already exists with this email. Not overwriting; resolve manually if this admin needs staff access.`)
      }
      skipped++
      continue
    }

    await User.create({
      name: admin.name,
      email,
      passwordHash: admin.passwordHash,
      authProvider: 'local',
      role: admin.role,
      active: admin.active ?? true,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    })
    console.log(`[migrate] OK ${email} -> role "${admin.role}"`)
    migrated++
  }

  console.log(`[migrate] done — migrated ${migrated}, skipped ${skipped}`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('[migrate] failed', err)
  process.exit(1)
})
