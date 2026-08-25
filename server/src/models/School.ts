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
  },
  { timestamps: true },
)

schoolSchema.plugin(idTransform)

export type SchoolDoc = InferSchemaType<typeof schoolSchema>
export const School = model('School', schoolSchema)
