import type { Schema } from 'mongoose'

/**
 * Serializes _id -> id (string) and drops __v, so API responses match the
 * shape the client's TypeScript types (src/types/index.ts) already expect.
 */
export function idTransform(schema: Schema) {
  schema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = String(ret._id)
      delete ret._id
      delete ret.__v
      return ret
    },
  })
}
