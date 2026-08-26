import { Schema, model } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const notificationSchema = new Schema(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
)

notificationSchema.plugin(idTransform)

export const Notification = model('Notification', notificationSchema)
