# TeachingCareer — Server

Express + TypeScript + MongoDB (Mongoose) API for the TeachingCareer platform.

## Setup

```bash
cp .env.example .env   # adjust MONGODB_URI / CLIENT_ORIGIN / JWT_SECRET / ADMIN_* as needed
npm install
npm run seed            # populates vacancies, schools, candidates, blog posts
npm run create-admin    # bootstraps one admin account from ADMIN_EMAIL/ADMIN_PASSWORD in .env
npm run dev              # http://localhost:4000, watches for changes
```

## Structure

```
src/
├── index.ts           bootstrap: connects Mongo, starts Express
├── app.ts              Express app: middleware, routes, error handling
├── config/env.ts       typed environment variables
├── db/connect.ts        mongoose connection
├── lib/jwt.ts             sign/verify admin JWTs, cookie config
├── models/               Mongoose schemas (Vacancy, School, Candidate, BlogPost, Admin,
│                        CandidateApplication, SchoolRegistration, HomeTutorRequest,
│                        ContactMessage, VacancyApplication)
├── routes/                public resource routes, mounted under /api; routes/admin/ holds
│                         the admin-only CRUD + submission-inbox routers, mounted under
│                         /api/admin/*
├── middleware/             asyncHandler, errorHandler, upload (Multer), rateLimiter,
│                          requireAdmin (JWT-cookie auth guard)
├── validation/              Zod schemas for each write endpoint
└── seed/                    seed.ts (public demo data) and createAdmin.ts (one-off admin
                            account bootstrap) — kept separate since seed.ts wipes and
                            reseeds its collections and shouldn't touch admin accounts
```

Uploaded files (candidate photos/documents, school logos) are written to `uploads/` on local disk
and served at `/uploads/...`. Every model's `toJSON` output uses `id` (not `_id`) to match the
client's TypeScript types; `Admin.toJSON` additionally strips `passwordHash`.

## Admin auth

`POST /api/admin/auth/login` sets an httpOnly, `sameSite=lax` JWT cookie (`tc_admin_token`) —
not stored in localStorage, to limit XSS exposure. `requireAdmin` middleware protects every route
under `/api/admin/*` except `login`. In production, set a real `JWT_SECRET` (the app refuses to
start without one when `NODE_ENV=production`) and serve the client over HTTPS so the `secure`
cookie flag applies.
