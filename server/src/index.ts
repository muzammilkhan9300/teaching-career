import { env } from './config/env.js'
import { connectDb } from './db/connect.js'
import { createApp } from './app.js'

async function main() {
  await connectDb()
  const app = createApp()
  app.listen(env.port, () => {
    console.log(`[server] listening on port ${env.port} (${env.nodeEnv})`)
  })
}

main().catch((err) => {
  console.error('[server] failed to start', err)
  process.exit(1)
})
