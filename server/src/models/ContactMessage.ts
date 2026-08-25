import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
)

contactMessageSchema.plugin(idTransform)

export type ContactMessageDoc = InferSchemaType<typeof contactMessageSchema>
export const ContactMessage = model('ContactMessage', contactMessageSchema)
