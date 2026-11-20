import { Router } from 'express'
import { cached } from '../lib/memoCache.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { NotFoundError } from '../utils/HttpError.js'
import { SchoolRequirement } from '../models/SchoolRequirement.js'
import { HomepageUpdate } from '../models/HomepageUpdate.js'
import { HomepageVideo } from '../models/HomepageVideo.js'
import { HeroSlide } from '../models/HeroSlide.js'
import { Service } from '../models/Service.js'

// Public, read-only. Content stays visible for as long as it is Published —
// it only disappears when an admin unpublishes (or deletes) it. Publication
// and expiry dates are informational and never hide anything automatically.
// Drafts never leave the server.

function liveRequirementFilter() {
  return { status: 'Published' }
}

function liveUpdateFilter() {
  return { status: 'Published' }
}

// Display order first (lower = earlier), then newest first.
const ORDERED_NEWEST = { order: 1, publishedAt: -1, createdAt: -1 } as const

export const homepageRouter = Router()

// Everything the hero needs in one round trip.
homepageRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    // Short cache: also cleared on every admin write (routes/index.ts).
    const data = await cached('homepage', 60_000, async () => {
      const [slides, requirements, flaggedServices, updates, videos] = await Promise.all([
        HeroSlide.find({ active: true }).sort({ order: 1, createdAt: 1 }).limit(10),
        // The hero box is deliberately compact: 2 requirements, 1 featured
        // service, 1 featured update (+ the featured video). Full lists live on
        // /school-requirements, /services and /updates.
        SchoolRequirement.find(liveRequirementFilter()).sort(ORDERED_NEWEST).limit(2),
        Service.find({ status: 'Published', showAsNew: true }).sort({ order: 1, createdAt: -1 }).limit(1),
        HomepageUpdate.find(liveUpdateFilter()).sort(ORDERED_NEWEST).limit(1),
        HomepageVideo.find({ status: 'Published' }).sort({ order: 1, createdAt: -1 }).limit(1),
      ])
      // No service ticked "Show in the homepage New Services tab"? Feature the
      // first published service (by display order) rather than leaving the tab
      // empty while published services exist. It's shown without the New badge.
      const services =
        flaggedServices.length > 0
          ? flaggedServices
          : await Service.find({ status: 'Published' }).sort({ order: 1, createdAt: -1 }).limit(1)
      return { slides, requirements, services, updates, videos }
    })
    res.json(data)
  }),
)

// Full "All Updates" listing page.
export const homepageUpdatesRouter = Router()

homepageUpdatesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const updates = await HomepageUpdate.find(liveUpdateFilter()).sort({ publishedAt: -1, createdAt: -1 }).limit(100)
    res.json(updates)
  }),
)

export const schoolRequirementsRouter = Router()

schoolRequirementsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const requirements = await SchoolRequirement.find(liveRequirementFilter()).sort(ORDERED_NEWEST).limit(100)
    res.json(requirements)
  }),
)

schoolRequirementsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const requirement = await SchoolRequirement.findOne({ _id: req.params.id, ...liveRequirementFilter() })
    if (!requirement) throw new NotFoundError('This requirement is no longer available.')
    res.json(requirement)
  }),
)
