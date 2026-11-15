import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const candidateSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    tags: { type: [String], default: [] },
    verified: { type: Boolean, default: true },
    photo: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    // Self-edited public extras (see routes/profileEdit.ts), synced from the
    // owner's CandidateApplication by lib/publishing.ts.
    about: { type: String, default: '' },
    skills: { type: [String], default: [] },
  },
  { timestamps: true },
)

candidateSchema.plugin(idTransform)

export type CandidateDoc = InferSchemaType<typeof candidateSchema>
export const Candidate = model('Candidate', candidateSchema)
