# TeachingCareer — Server

Express + TypeScript + MongoDB (Mongoose) API for the TeachingCareer platform.

## Setup

```bash
cp .env.example .env   # adjust MONGODB_URI / CLIENT_ORIGIN / JWT_SECRET / ADMIN_* as needed
npm install
npm run seed            # populates vacancies, schools, candidates, blog posts, services
npm run create-admin    # bootstraps one super_admin account from ADMIN_EMAIL/ADMIN_PASSWORD in .env
npm run dev              # http://localhost:4000, watches for changes
```

## Structure

```
src/
├── index.ts           bootstrap: connects Mongo, starts Express
├── app.ts              Express app: middleware, routes, error handling
├── config/env.ts       typed environment variables
├── db/connect.ts        mongoose connection
├── lib/                   jwt.ts (sign/verify the one session JWT, cookie config),
│                         permissions.ts (role → capability map + requirePermission
│                         middleware), audit.ts (logAction helper), notify.ts (in-app
│                         notification helper), files.ts (deleteUploadedFile — used by the
│                         verification flow)
├── models/               Mongoose schemas: User (the single account model — public visitors
│                        and staff alike, distinguished by `role`), the public listings
│                        (Vacancy, School, Candidate, BlogPost, Service), AuditLog,
│                        Notification, Settings (singleton), and the private submissions
│                        (CandidateApplication, SchoolRegistration, HomeTutorRequest,
│                        ContactMessage, VacancyApplication)
├── routes/                public resource routes (incl. userAuth.ts — register/login/
│                         logout/profile/password-reset/Google) mounted under /api;
│                         routes/admin/ holds every admin-only router, mounted under
│                         /api/admin/*
├── middleware/             asyncHandler, errorHandler, upload (Multer), rateLimiter,
│                          requireUser (session guard), requireAdmin (session guard +
│                          role !== 'user' check)
├── validation/              Zod schemas for each write endpoint
└── seed/                    seed.ts (public demo data — wipes and reseeds its collections),
                            createAdmin.ts (one-off super_admin bootstrap, kept separate so
                            reseeding never touches accounts), migrateAdminsToUsers.ts (one-off,
                            already run — migrated the old separate Admin collection into User)
```

Uploaded files land in `uploads/` on local disk: `photos/` and `logos/` are served publicly at
`/uploads/...`; `documents/` (candidate degree/experience/police-verification uploads) is **not**
mounted at all — it's only reachable through the authenticated
`GET /api/admin/documents/:applicationId/:field` route, and every file in it is permanently
deleted the moment an admin verifies or rejects the application it belongs to (see
`routes/admin/adminCandidateVerification.ts`). Every model's `toJSON` output uses `id` (not
`_id`); `User.toJSON` additionally strips `passwordHash` and the password-reset token fields.

## Accounts, sessions & roles

There is one account system, `User` — public visitors and staff are the same model,
distinguished only by `role`. `POST /api/auth/login` (and `/register`, `/logout`, `/me`) sets an
httpOnly, `sameSite=lax` JWT cookie (`tc_user_token`) — not stored in localStorage, to limit XSS
exposure. Registration never accepts a `role` field, so every self-signup is forced to the
schema default `'user'`; only an existing `super_admin` can grant a staff role
(`PUT /api/admin/staff/:id`).

`requireUser` middleware (any signed-in account) protects the profile endpoints;
`requireAdmin` middleware protects every route under `/api/admin/*` by additionally requiring
`role !== 'user'`. `requirePermission(capability)` (`lib/permissions.ts`) layers finer-grained
authorization on top of that, enforced **server-side** regardless of what the client UI shows:

| Role | Capabilities |
| --- | --- |
| `super_admin` | everything, including staff management, site settings, and audit logs |
| `admin` | manage all content/listings, review submissions, hard-delete records |
| `moderator` | view everything, review/verify/approve/reject submissions — no create/edit/delete |
| `user` | none — a normal public account, gets 401/403 on every `/api/admin/*` route |

The bootstrap account from `npm run create-admin` is always `super_admin` (there must be at least
one, and the API refuses to demote/suspend the last remaining one). In production, set a real
`JWT_SECRET` (the app refuses to start without one when `NODE_ENV=production`) and serve the
client over HTTPS so the `secure` cookie flag applies.

## Candidate / school verification

`CandidateApplication` and `SchoolRegistration` are private submissions reviewed by an admin. A
**Verify**/**Approve** action creates the corresponding public `Candidate`/`School` listing from
the submission's data and permanently deletes its uploaded documents (degree, experience letter,
police verification) — only the verification status is retained. **Reject** deletes the same
documents without creating a listing. Public read endpoints never expose these private
submissions or any PII field (phone, WhatsApp, email) — only the curated public `Candidate`/
`School` records, which never carry that data.
