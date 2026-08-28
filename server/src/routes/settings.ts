import { Router } from 'express'
import { Settings, SETTINGS_SINGLETON_ID } from '../models/Settings.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { requirePermission } from '../lib/permissions.js'
import { logAction } from '../lib/audit.js'
import { settingsInputSchema } from '../validation/adminResources.js'

export const settingsRouter = Router()

export async function getOrCreateSettings() {
  let settings = await Settings.findById(SETTINGS_SINGLETON_ID)
  if (!settings) {
    settings = await Settings.create({
      _id: SETTINGS_SINGLETON_ID,
      phone: '0312 8423576',
      phoneSecondary: '0300 0243546',
      whatsapp: '923128423676',
      email: 'info@teachingcareer.pk',
      address: 'Islamabad, Pakistan',
      social: { instagram: '', facebook: '', linkedin: '', youtube: '' },
    })
  }
  return settings
}

// Site-wide contact info / social links — all of this is already shown
// publicly in the footer and contact pages, so it's safe to expose as-is.
settingsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const settings = await getOrCreateSettings()
    res.json(settings)
  }),
)

export const adminSettingsRouter = Router()
adminSettingsRouter.use(requireAdmin, requirePermission('manageSettings'))

adminSettingsRouter.put(
  '/',
  asyncHandler(async (req, res) => {
    const data = settingsInputSchema.parse(req.body)
    const settings = await Settings.findByIdAndUpdate(SETTINGS_SINGLETON_ID, data, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    })
    logAction(req, 'update', 'Settings', settings.id)
    res.json(settings)
  }),
)
