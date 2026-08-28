import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

export const SCHOOL_REGISTRATION_STATUSES = ['Pending', 'Approved', 'Rejected', 'Resubmitted'] as const

const schoolRegistrationSchema = new Schema(
  {
    // Optional — legacy records submitted before accounts existed have no
    // owner and simply aren't editable via the self-service flow; every new
    // submission always sets this (see routes/schoolRegistrations.ts).
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    // Set the first time this registration is approved and a public School
    // is created from it — later re-approvals update that same School
    // instead of creating a duplicate listing.
    publishedSchoolId: { type: Schema.Types.ObjectId, ref: 'School' },
    schoolName: { type: String, required: true },
    schoolCity: { type: String, required: true },
    schoolArea: { type: String, required: true },
    schoolLogoPath: { type: String },
    schoolYear: { type: String, required: true },
    schoolBranches: { type: String },
    schoolWebsite: { type: String },
    schoolWhatsapp: { type: String, required: true },
    schoolPhone: { type: String, required: true },
    schoolType: { type: String },
    schoolBoard: { type: String },
    schoolGrades: { type: String },
    schoolDesc: { type: String },
    registrationStatus: { type: String, enum: SCHOOL_REGISTRATION_STATUSES, default: 'Pending' },
    rejectionReason: { type: String },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  { timestamps: true },
)

schoolRegistrationSchema.plugin(idTransform)

export type SchoolRegistrationDoc = InferSchemaType<typeof schoolRegistrationSchema>
export const SchoolRegistration = model('SchoolRegistration', schoolRegistrationSchema)
