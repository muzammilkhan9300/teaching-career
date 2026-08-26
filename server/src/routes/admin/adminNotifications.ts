import { Router } from 'express'
import { Notification } from '../../models/Notification.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireAdmin } from '../../middleware/requireAdmin.js'
import { NotFoundError } from '../../utils/HttpError.js'

export const adminNotificationsRouter = Router()
adminNotificationsRouter.use(requireAdmin)

adminNotificationsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [items, unreadCount] = await Promise.all([
      Notification.find().sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ read: false }),
    ])
    res.json({ items, unreadCount })
  }),
)

adminNotificationsRouter.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
    if (!notification) throw new NotFoundError()
    res.json(notification)
  }),
)

adminNotificationsRouter.post(
  '/mark-all-read',
  asyncHandler(async (_req, res) => {
    await Notification.updateMany({ read: false }, { read: true })
    res.status(204).end()
  }),
)

adminNotificationsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndDelete(req.params.id)
    if (!notification) throw new NotFoundError()
    res.status(204).end()
  }),
)
