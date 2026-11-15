import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

// One background image of the homepage hero slider.
const heroSlideSchema = new Schema(
  {
    image: { type: String, required: true }, // /uploads/homepage/... or /assets/images/...
    alt: { type: String, default: '' },
    // CSS object-position for the crop, e.g. "50% 50%" or "12% 50%" — lets
    // the admin keep the subject in frame on wide/narrow screens.
    position: { type: String, default: '50% 50%' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

heroSlideSchema.plugin(idTransform)

export type HeroSlideDoc = InferSchemaType<typeof heroSlideSchema>
export const HeroSlide = model('HeroSlide', heroSlideSchema)
