# TeachingCareer — Server

Express + TypeScript + MongoDB (Mongoose) API for the TeachingCareer platform.

## Setup

```bash
cp .env.example .env   # adjust MONGODB_URI / PORT / CLIENT_ORIGIN if needed
npm install
npm run seed            # populates vacancies, schools, candidates, blog posts
npm run dev              # http://localhost:4000, watches for changes
```

## Structure

```
src/
├── index.ts           bootstrap: connects Mongo, starts Express
├── app.ts              Express app: middleware, routes, error handling
├── config/env.ts       typed environment variables
├── db/connect.ts        mongoose connection
├── models/               Mongoose schemas (Vacancy, School, Candidate, BlogPost,
│                        CandidateApplication, SchoolRegistration, HomeTutorRequest,
│                        ContactMessage, VacancyApplication)
├── routes/                one file per resource, mounted under /api
├── middleware/             asyncHandler, errorHandler, upload (Multer), rateLimiter
├── validation/              Zod schemas for each write endpoint
└── seed/seed.ts              one-off script to populate demo data (`npm run seed`)
```

Uploaded files (candidate photos/documents, school logos) are written to `uploads/` on local disk
and served at `/uploads/...`. Every model's `toJSON` output uses `id` (not `_id`) to match the
client's TypeScript types.
