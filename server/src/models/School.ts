import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const schoolSchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    curriculum: { type: String, required: true },
    tag: { type: String, required: true },
    registered: { type: Boolean, default: true },
    photo: { type: String, required: true },
    subjects: { type: String, required: true },
    about: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    // Public extras the school owner can edit (routes/profileEdit.ts), synced
    // from the owner's SchoolRegistration by lib/publishing.ts. Contact phone
    // and email stay private on the registration, like every other listing.
    coverImage: { type: String, default: '' },
    address: { type: String, default: '' },
    website: { type: String, default: '' },
    facilities: { type: [String], default: [] },
  },
  { timestamps: true },
)

schoolSchema.plugin(idTransform)

export type SchoolDoc = InferSchemaType<typeof schoolSchema>
export const School = model('School', schoolSchema)
