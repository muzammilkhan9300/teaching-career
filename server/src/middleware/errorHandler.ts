import type { NextFunction, Request, Response } from 'express'
import { MulterError } from 'multer'
import mongoose from 'mongoose'
import { ZodError } from 'zod'
import { HttpError } from '../utils/HttpError.js'

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` })
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, details: err.details })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({ message: 'Validation failed', details: err.flatten() })
    return
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(404).json({ message: 'Not found' })
    return
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ message: 'Validation failed', details: err.errors })
    return
  }

  if (err instanceof MulterError) {
    res.status(400).json({ message: err.message })
    return
  }

  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
}
