import { Router } from 'express'
import { BlogPost } from '../models/BlogPost.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { NotFoundError } from '../utils/HttpError.js'

export const blogPostsRouter = Router()

blogPostsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const posts = await BlogPost.find().sort({ date: -1 })
    res.json(posts)
  }),
)

blogPostsRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({ slug: req.params.slug })
    if (!post) throw new NotFoundError('Article not found')
    res.json(post)
  }),
)
