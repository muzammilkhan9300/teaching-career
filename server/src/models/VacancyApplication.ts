import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const vacancyApplicationSchema = new Schema(
  {
    vacancyId: { type: Schema.Types.ObjectId, ref: 'Vacancy', required: true },
    vacancyTitle: { type: String, required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    applicationStatus: { type: String, default: 'Applied' },
  },
  { timestamps: true },
)

vacancyApplicationSchema.plugin(idTransform)

export type VacancyApplicationDoc = InferSchemaType<typeof vacancyApplicationSchema>
export const VacancyApplication = model('VacancyApplication', vacancyApplicationSchema)
