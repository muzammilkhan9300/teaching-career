import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

// A link to a video on the TeachingCareer YouTube channel. No video file is
// ever stored or uploaded — only the pasted URL and the id parsed from it
// (lib/youtube.ts), from which the thumbnail and embed URLs are derived.
const homepageVideoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    youtubeUrl: { type: String, required: true },
    youtubeId: { type: String, required: true, match: /^[A-Za-z0-9_-]{11}$/ },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },
  },
  { timestamps: true },
)

homepageVideoSchema.plugin(idTransform)

export type HomepageVideoDoc = InferSchemaType<typeof homepageVideoSchema>
export const HomepageVideo = model('HomepageVideo', homepageVideoSchema)
