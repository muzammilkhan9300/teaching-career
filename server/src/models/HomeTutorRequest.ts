import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const homeTutorRequestSchema = new Schema(
  {
    parentName: { type: String, required: true },
    parentEmail: { type: String, required: true },
    parentWhatsapp: { type: String, required: true },
    parentCity: { type: String, required: true },
    parentArea: { type: String, required: true },
    contactTime: { type: String },
    studentName: { type: String, required: true },
    studentClass: { type: String, required: true },
    studentGender: { type: String },
    subjectsNeeded: { type: String, required: true },
    syllabus: { type: String },
    purpose: { type: String },
    daysPerWeek: { type: String },
    preferredTime: { type: String },
    tuitionLocation: { type: String },
    urgency: { type: String },
    additionalReq: { type: String },
    parentMessage: { type: String },
    agreeTerms: { type: Boolean, required: true },
    requestStatus: { type: String, default: 'New' },
    assignedCandidateId: { type: Schema.Types.ObjectId, ref: 'Candidate' },
    assignedCandidateName: { type: String },
  },
  { timestamps: true },
)

homeTutorRequestSchema.plugin(idTransform)

export type HomeTutorRequestDoc = InferSchemaType<typeof homeTutorRequestSchema>
export const HomeTutorRequest = model('HomeTutorRequest', homeTutorRequestSchema)
