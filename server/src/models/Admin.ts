import { Schema, model, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true },
)

// Never let the password hash leave the server, even by accident.
adminSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id)
    delete ret._id
    delete ret.__v
    delete ret.passwordHash
    return ret
  },
})

adminSchema.methods.comparePassword = function comparePassword(this: HydratedDocument<AdminSchemaType>, candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash)
}

type AdminSchemaType = InferSchemaType<typeof adminSchema>
export type AdminDoc = HydratedDocument<AdminSchemaType, { comparePassword: (candidate: string) => Promise<boolean> }>

export const Admin = model<AdminSchemaType, Model<AdminSchemaType, object, { comparePassword: (candidate: string) => Promise<boolean> }>>(
  'Admin',
  adminSchema,
)

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12)
}
