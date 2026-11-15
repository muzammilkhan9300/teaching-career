import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { NotFoundError } from '../utils/HttpError.js'
import { SchoolRequirement } from '../models/SchoolRequirement.js'
import { HomepageUpdate } from '../models/HomepageUpdate.js'
import { HomepageVideo } from '../models/HomepageVideo.js'
import { HeroSlide } from '../models/HeroSlide.js'
import { Service } from '../models/Service.js'

// Public, read-only. Every query here filters to published/active content —
// drafts, inactive slides, future-dated and expired items never leave the server.

/** Published, already live, and not past its expiry date. */
function liveRequirementFilter() {
  const now = new Date()
  return {
    status: 'Published',
    publishedAt: { $lte: now },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  }
}

function liveUpdateFilter(now = new Date()) {
  return { status: 'Published', publishedAt: { $lte: now } }
}

// Display order first (lower = earlier), then newest first.
const ORDERED_NEWEST = { order: 1, publishedAt: -1, createdAt: -1 } as const

export const homepageRouter = Router()

// Everything the hero needs in one round trip.
homepageRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const now = new Date()
    const [slides, requirements, services, updates, videos] = await Promise.all([
      HeroSlide.find({ active: true }).sort({ order: 1, createdAt: 1 }).limit(10),
      // The hero box is deliberately compact: 2 requirements, 1 featured
      // service, 1 featured update (+ the featured video). Full lists live on
      // /school-requirements, /services and /updates.
      SchoolRequirement.find(liveRequirementFilter()).sort(ORDERED_NEWEST).limit(2),
      Service.find({ status: 'Published', showAsNew: true }).sort({ order: 1, createdAt: -1 }).limit(1),
      HomepageUpdate.find(liveUpdateFilter(now)).sort(ORDERED_NEWEST).limit(1),
      HomepageVideo.find({ status: 'Published' }).sort({ order: 1, createdAt: -1 }).limit(1),
    ])
    res.json({ slides, requirements, services, updates, videos })
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
