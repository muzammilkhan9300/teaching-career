import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

// A fixed set of icon keys the public Services page knows how to render —
// keeps admin-authored content constrained to icons that already exist in
// the site's design system rather than accepting arbitrary icon names.
export const SERVICE_ICON_KEYS = ['cap', 'person', 'pin', 'check', 'shield', 'clock', 'book'] as const

const serviceSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, enum: SERVICE_ICON_KEYS, default: 'shield' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Published' },
    // Homepage "New Services" tab — only published services with showAsNew
    // appear there; the full Services page shows every published service.
    // (Not named `isNew`: that's a reserved Mongoose document property.)
    showAsNew: { type: Boolean, default: false },
    image: { type: String, default: '' }, // thumbnail, /uploads/homepage/...
    learnMoreUrl: { type: String, default: '' }, // internal path or https:// link; falls back to /services
  },
  { timestamps: true },
)

serviceSchema.plugin(idTransform)

export type ServiceDoc = InferSchemaType<typeof serviceSchema>
export const Service = model('Service', serviceSchema)
