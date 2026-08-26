import { Notification } from '../models/Notification.js'

/** Fire-and-forget — a notification failing to save should never block the public submission it's about. */
export function notify(type: string, message: string, link?: string) {
  Notification.create({ type, message, link }).catch((err) => {
    console.error('[notify] failed to create notification', err)
  })
}
