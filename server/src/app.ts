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
  if (env.nodeEnv === 'production') app.set('trust proxy', 1)

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
  const uploadsRoot = path.resolve(process.cwd(), 'uploads')
  app.use('/uploads/photos', express.static(path.join(uploadsRoot, 'photos')))
  app.use('/uploads/logos', express.static(path.join(uploadsRoot, 'logos')))
  app.use('/api', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
