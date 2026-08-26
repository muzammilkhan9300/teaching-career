import mongoose from 'mongoose'
import { connectDb } from '../db/connect.js'
import { Admin, hashPassword } from '../models/Admin.js'

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME ?? 'Admin'

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before running this script.')
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters.')
  }

  await connectDb()

  const passwordHash = await hashPassword(password)
  const admin = await Admin.findOneAndUpdate(
    { email: email.toLowerCase() },
    { email: email.toLowerCase(), passwordHash, name },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  console.log(`[create-admin] admin account ready: ${admin.email}`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('[create-admin] failed', err)
  process.exit(1)
})
