import { Schema, model, type InferSchemaType } from 'mongoose'
import { idTransform } from './plugins/idTransform.js'

const blogPostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    body: { type: [String], default: [] },
  },
  { timestamps: true },
)

blogPostSchema.plugin(idTransform)

export type BlogPostDoc = InferSchemaType<typeof blogPostSchema>
export const BlogPost = model('BlogPost', blogPostSchema)
