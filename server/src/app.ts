import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  // Behind a reverse proxy in production, req.ip would otherwise resolve to
  // the proxy's address instead of the real client — breaks rate limiting
  // and audit-log IPs.
  if (env.isProduction) app.set('trust proxy', 1)

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(cors({ origin: env.clientOrigin, credentials: true }))
  app.use(morgan('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  // Only low-sensitivity images are publicly servable. Candidate/school
  // verification documents live in uploads/documents and are intentionally
  // NOT mounted here — they're only reachable through the authenticated
  // routes in routes/admin/adminDocuments.ts, and are deleted once a
  // candidate application is verified or rejected.
  app.use('/uploads/photos', express.static(path.join(env.uploadsRoot, 'photos')))
  app.use('/uploads/logos', express.static(path.join(env.uploadsRoot, 'logos')))
  app.use('/api', apiRouter)

  // This one process also serves the built React app when it's present (see
  // config/env.ts's clientDistPath) — deploy hosts that run a single process
  // per domain share the API and the static frontend rather than needing two
  // separate deployments. Deliberately not gated on env.isProduction: some
  // hosts don't reliably propagate NODE_ENV to the running process, and
  // whether a build exists on disk is a more trustworthy signal than an
  // environment variable that may not have arrived.
  if (fs.existsSync(env.clientDistPath)) {
    app.use(express.static(env.clientDistPath))
    app.get(/^(?!\/api\/|\/uploads\/).*/, (_req, res) => {
      res.sendFile(path.join(env.clientDistPath, 'index.html'))
    })
  } else if (env.isProduction) {
    console.warn(`[server] clientDistPath not found: ${env.clientDistPath} (site not built?)`)
  }

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
