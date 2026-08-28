import mongoose from 'mongoose'
import { env } from '../config/env.js'

/** Strips credentials before logging — the raw URI has the DB password embedded in it. */
function redactUri(uri: string) {
  return uri.replace(/\/\/[^/@]+@/, '//<redacted>@')
}

export async function connectDb() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(env.mongodbUri)
  console.log(`[db] connected to ${redactUri(env.mongodbUri)}`)
}
