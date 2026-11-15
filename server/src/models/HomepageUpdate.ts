import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

// "Latest Updates" tab on the homepage — newly registered schools, partners,
// announcements and news.
const homepageUpdateSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: '' }, // /uploads/homepage/... (school logo or photo)
    publishedAt: { type: Date, required: true, default: () => new Date() },
    readMoreUrl: { type: String, default: '' }, // internal path (/blog/...) or https:// link
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },
  },
  { timestamps: true },
)

homepageUpdateSchema.plugin(idTransform)

export type HomepageUpdateDoc = InferSchemaType<typeof homepageUpdateSchema>
export const HomepageUpdate = model('HomepageUpdate', homepageUpdateSchema)
