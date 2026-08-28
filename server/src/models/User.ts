import { Schema, model, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose'
import bcrypt from 'bcryptjs'

// The single account system for the whole application — public visitors and
// staff are both a User, distinguished only by `role`. There is no separate
// admin collection: staff dashboard access is an authorization check
// (role !== 'user'), not a different login system. Public registration
// (routes/userAuth.ts) never accepts a `role` field, so every self-signup is
// forced to the schema default 'user' — only an existing super_admin can
// elevate another account's role (routes/admin/adminStaff.ts).
export const USER_ROLES = ['user', 'moderator', 'admin', 'super_admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String }, // absent for Google-only accounts
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: USER_ROLES, default: 'user' },
    active: { type: Boolean, default: true },
    passwordResetTokenHash: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true },
)

userSchema.index({ googleId: 1 }, { unique: true, sparse: true })

// Never let sensitive fields leave the server, even by accident.
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id)
    delete ret._id
    delete ret.__v
    delete ret.passwordHash
    delete ret.passwordResetTokenHash
    delete ret.passwordResetExpires
    return ret
  },
})

userSchema.methods.comparePassword = function comparePassword(this: HydratedDocument<UserSchemaType>, candidate: string) {
  if (!this.passwordHash) return Promise.resolve(false)
  return bcrypt.compare(candidate, this.passwordHash)
}

type UserSchemaType = InferSchemaType<typeof userSchema>
export type UserDoc = HydratedDocument<UserSchemaType, { comparePassword: (candidate: string) => Promise<boolean> }>

export const User = model<UserSchemaType, Model<UserSchemaType, object, { comparePassword: (candidate: string) => Promise<boolean> }>>(
  'User',
  userSchema,
)

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12)
}
