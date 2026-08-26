import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const vacancySchema = new Schema(
  {
    title: { type: String, required: true },
    school: { type: String, required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    subject: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    curriculum: { type: String, required: true },
    employmentType: { type: String, enum: ['Full Time', 'Part Time'], required: true },
    salaryRange: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    joiningDate: { type: String, required: true },
    teachersNeeded: { type: Number, required: true, default: 1 },
    description: { type: String, required: true },
    active: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
)

vacancySchema.plugin(idTransform)

export type VacancyDoc = InferSchemaType<typeof vacancySchema>
export const Vacancy = model('Vacancy', vacancySchema)
