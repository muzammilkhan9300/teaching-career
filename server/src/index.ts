import { env } from './config/env.js'
import { connectDb } from './db/connect.js'
import { createApp } from './app.js'
import { bootstrapHomepageContent } from './seed/bootstrapHomepageContent.js'
import { importDiskUploads } from './lib/fileStore.js'

async function main() {
  await connectDb()
  await bootstrapHomepageContent()
  const app = createApp()
  app.listen(env.port, () => {
    console.log(`[server] listening on port ${env.port} (${env.nodeEnv})`)
  })
  // Move any files left in the old on-disk uploads folder into persistent storage.
  importDiskUploads().catch((err) => console.error('[fileStore] import of local uploads failed', err))
}

main().catch((err) => {
  console.error('[server] failed to start', err)
  process.exit(1)
})
