import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

// A school's teaching requirement, published by TeachingCareer on the
// homepage. Deliberately separate from Vacancy: Vacancy is a school-owned
// listing with a direct "apply" flow, whereas requirements follow the
// merit-based process — TeachingCareer shortlists candidates itself and
// there is no direct application at all.
const schoolRequirementSchema = new Schema(
  {
    jobTitle: { type: String, required: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    detailedDescription: { type: String, default: '' },
    publishedAt: { type: Date, required: true, default: () => new Date() },
    // Optional — once past, the requirement drops off every public listing
    // automatically (filtered at query time, see routes/homepage.ts).
    expiresAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },
  },
  { timestamps: true },
)

schoolRequirementSchema.index({ status: 1, publishedAt: -1 })
schoolRequirementSchema.plugin(idTransform)

export type SchoolRequirementDoc = InferSchemaType<typeof schoolRequirementSchema>
export const SchoolRequirement = model('SchoolRequirement', schoolRequirementSchema)
