import { Schema, model } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const auditLogSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: String },
  },
  { timestamps: true },
)

auditLogSchema.plugin(idTransform)

export const AuditLog = model('AuditLog', auditLogSchema)
