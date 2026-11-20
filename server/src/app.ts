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
import { asyncHandler } from './middleware/asyncHandler.js'
import { openFile } from './lib/fileStore.js'

// Public images only (the regex in createApp limits it to photos/logos/
// covers/homepage). Filenames are unique per upload, so they're cacheable
// forever. Verification documents are never served here.
const serveStoredUpload = asyncHandler(async (req, res, next) => {
  const [dir, name] = [req.params[0], req.params[1]]
  const stored = await openFile(`${dir}/${name}`)
  if (!stored) {
    next() // falls through to the JSON 404
    return
  }
  res.setHeader('Content-Type', stored.contentType)
  res.setHeader('Content-Length', String(stored.length))
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.setHeader('X-Upload-Storage', 'database')
  stored.stream().on('error', next).pipe(res)
})

export function createApp() {
  const app = express()

  // Behind a reverse proxy in production, req.ip would otherwise resolve to
  // the proxy's address instead of the real client — breaks rate limiting
  // and audit-log IPs.
  if (env.isProduction) app.set('trust proxy', 1)

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          // Homepage videos: thumbnails come from YouTube's image CDN and the
          // player is the privacy-enhanced youtube-nocookie embed — nothing
          // else external is allowed beyond helmet's defaults.
          // blob: = local previews of a photo the user just picked (and the
          // crop editor); those URLs only exist inside the page that made them.
          'img-src': ["'self'", 'data:', 'blob:', 'https://i.ytimg.com'],
          'frame-src': ['https://www.youtube-nocookie.com'],
          // The candidate-photo crop editor runs a self-hosted WebAssembly face
          // detector (site/public/vendor/face). This allows compiling WASM
          // from our own origin only; it does not allow eval().
          'script-src': ["'self'", "'wasm-unsafe-eval'"],
        },
      },
    }),
  )
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
  // Served from persistent storage (lib/fileStore.ts) at the same URLs as before.
  app.get(/^\/uploads\/(photos|logos|covers|homepage)\/([A-Za-z0-9._-]+)$/, serveStoredUpload)
  app.use('/api', apiRouter)

  // This one process also serves the built React app when it's present (see
  // config/env.ts's clientDistPath) — deploy hosts that run a single process
  // per domain share the API and the static frontend rather than needing two
  // separate deployments. Deliberately not gated on env.isProduction: some
  // hosts don't reliably propagate NODE_ENV to the running process, and
  // whether a build exists on disk is a more trustworthy signal than an
  // environment variable that may not have arrived.
  if (fs.existsSync(env.clientDistPath)) {
    // Site images have a smaller .webp twin (site/public/assets/images).
    // Browsers that accept WebP get it from the SAME URL, so every existing
    // reference — code, CSS and image paths stored in the database — gets the
    // lighter file without changing anything. The original stays as fallback.
    const imagesDir = path.join(env.clientDistPath, 'assets', 'images')
    const hasWebp = (base: string) => fs.existsSync(path.join(imagesDir, `${base}.webp`))
    app.get(/^\/assets\/images\/([A-Za-z0-9._-]+)\.(jpe?g|png)$/, (req, res, next) => {
      res.vary('Accept')
      if (req.accepts('image/webp') && hasWebp(req.params[0])) {
        req.url = `/assets/images/${req.params[0]}.webp`
      }
      next()
    })

    app.use(
      express.static(env.clientDistPath, {
        setHeaders(res, filePath) {
          const name = path.basename(filePath)
          if (name === 'index.html') {
            // Always revalidate the page so a new deploy is picked up at once.
            res.setHeader('Cache-Control', 'no-cache')
          } else if (/-[A-Za-z0-9_-]{8}\.(js|css)$/.test(name)) {
            // Vite build output: the hash changes whenever the content does.
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
          } else {
            // Unhashed public files (images, fonts, face-detection runtime).
            res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400')
          }
        },
      }),
    )
    app.get(/^(?!\/api\/|\/uploads\/).*/, (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache')
      res.sendFile(path.join(env.clientDistPath, 'index.html'))
    })
  } else if (env.isProduction) {
    console.warn(`[server] clientDistPath not found: ${env.clientDistPath} (site not built?)`)
  }

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
