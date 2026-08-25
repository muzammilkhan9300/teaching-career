import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const schoolRegistrationSchema = new Schema(
  {
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
    registrationStatus: { type: String, default: 'New' },
  },
  { timestamps: true },
)

schoolRegistrationSchema.plugin(idTransform)

export type SchoolRegistrationDoc = InferSchemaType<typeof schoolRegistrationSchema>
export const SchoolRegistration = model('SchoolRegistration', schoolRegistrationSchema)
