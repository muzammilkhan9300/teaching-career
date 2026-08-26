import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

// Singleton document — there is always exactly one Settings row, upserted
// by its fixed id via getSettings()/updateSettings() in routes/settings.ts.
const settingsSchema = new Schema(
  {
    phone: { type: String, required: true },
    phoneSecondary: { type: String },
    whatsapp: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    social: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
  },
  { timestamps: true },
)

settingsSchema.plugin(idTransform)

export type SettingsDoc = InferSchemaType<typeof settingsSchema>
export const Settings = model('Settings', settingsSchema)

export const SETTINGS_SINGLETON_ID = '000000000000000000000001'
