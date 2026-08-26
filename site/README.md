# TeachingCareer — Client

React + TypeScript + Vite frontend for TeachingCareer, a platform connecting schools, teaching
candidates, and parents looking for home tutors. Talks to the Express + MongoDB API in `../server`
— see the root `README.md` for running both together.

## Stack

- React 19 + TypeScript, built with Vite
- Tailwind CSS v4 for styling
- React Router for routing
- @tanstack/react-query for server data fetching/caching and mutations
- React Hook Form + Zod for form state and validation
- Lucide + react-icons for real icons (UI icons and brand/social marks, respectively)
- Framer Motion for entrance/transition animation
- react-helmet-async for per-page SEO metadata

## Getting started

The dev server proxies `/api` and `/uploads` to `http://localhost:4000`, so run the API
(`../server`) alongside this.

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and produce a production build
npm run preview  # preview the production build locally
```

## Project structure

```
src/
├── admin/              admin-panel-only code: AdminAuthContext (cookie session),
│                       AdminRoute (redirects to /admin/login when signed out),
│                       AdminLayout (sidebar), adminQueries.ts (CRUD/status hooks),
│                       and generic components/ (DataTable, ResourceFormModal, StatusBadge)
├── components/
│   ├── icons/          index.tsx (public site) and admin.ts (admin-only icons) —
│   │                   real icons from lucide-react / react-icons
│   ├── layout/          Header, Footer, Breadcrumb
│   ├── sections/        reusable page sections (hero, cards, how-it-works, ...)
│   └── ui/               form fields, buttons, pagination, toast, skeletons
├── layouts/              RootLayout (public header + outlet + footer)
├── lib/                  api.ts (fetch wrapper), queries.ts (public data hooks),
│                        validation.ts (Zod schemas for the public forms)
├── pages/                one component per public route; pages/admin/ holds the admin
│                        panel's pages (dashboard, vacancies/schools/candidates CRUD,
│                        the shared submissions-inbox page)
└── types/                shared TypeScript interfaces
```

## Data flow

Public listing/detail pages fetch from the API via `@tanstack/react-query` hooks in
`src/lib/queries.ts`. All 4 public forms (candidate/school registration, home-tutor request,
contact) and the vacancy-apply button submit to the API directly — nothing is stored client-side.
The admin panel (`/admin`) is a separate, cookie-authenticated section that manages the public
listings and reviews form submissions; see the root `README.md` for how to create the first admin
account.
