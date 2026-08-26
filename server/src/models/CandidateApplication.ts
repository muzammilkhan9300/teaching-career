import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const candidateApplicationSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    whatsapp: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    gender: { type: String },
    qualification: { type: String, required: true },
    degreeName: { type: String, required: true },
    major: { type: String, required: true },
    institute: { type: String, required: true },
    completionYear: { type: String },
    isFresher: { type: String, enum: ['yes', 'no'], required: true },
    experienceYears: { type: String },
    experienceOrg: { type: String },
    experienceDetails: { type: String },
    teachWhere: { type: [String], default: [] },
    subjects: { type: [String], default: [] },
    subjectOther: { type: String },
    classes: { type: [String], default: [] },
    classOther: { type: String },
    availability: { type: String },
    preferredTime: { type: String },
    declaration: { type: Boolean, required: true },

    // Presence of degreeDocumentPath is enforced at submission time in
    // routes/candidateRegistrations.ts, not here — all three document paths
    // are cleared once an admin verifies or rejects the application (see
    // routes/admin/adminCandidateVerification.ts), so none can be `required`
    // at the schema level.
    profilePhotoPath: { type: String },
    degreeDocumentPath: { type: String },
    experienceDocumentPath: { type: String },
    policeVerificationPath: { type: String },

    homeTuitionEligibility: { type: String, enum: ['Pending', 'Not Requested'], required: true },
    policeVerificationStatus: { type: String, enum: ['Pending', 'Not Required'], required: true },
    applicationStatus: { type: String, default: 'New' },
  },
  { timestamps: true },
)

candidateApplicationSchema.plugin(idTransform)

export type CandidateApplicationDoc = InferSchemaType<typeof candidateApplicationSchema>
export const CandidateApplication = model('CandidateApplication', candidateApplicationSchema)
