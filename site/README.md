# TeachingCareer — Client

React + TypeScript + Vite frontend for TeachingCareer, a platform connecting schools, teaching
candidates, and parents looking for home tutors. This is the frontend phase of a planned MERN
stack build — an Express/MongoDB backend replaces the current localStorage demo persistence in a
later phase.

## Stack

- React 19 + TypeScript, built with Vite
- Tailwind CSS v4 for styling
- React Router for routing
- React Hook Form + Zod for form state and validation
- Framer Motion for entrance/transition animation
- react-helmet-async for per-page SEO metadata

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and produce a production build
npm run preview  # preview the production build locally
```

## Project structure

```
src/
├── components/
│   ├── icons/       hand-rolled SVG icon components
│   ├── layout/       Header, Footer, Breadcrumb
│   ├── sections/     reusable page sections (hero, cards, how-it-works, ...)
│   └── ui/            form fields, buttons, pagination, toast, skeletons
├── data/              typed demo datasets (vacancies, schools, candidates, blog posts)
├── layouts/           RootLayout (header + outlet + footer)
├── lib/               validation schemas (Zod) and the demo localStorage helper
├── pages/             one component per route
└── types/             shared TypeScript interfaces
```

## Demo data note

Form submissions (candidate registration, school registration, home tutor requests, contact
messages, vacancy applications) are currently saved to `localStorage` via `src/lib/demoStorage.ts`
so the app is fully testable end-to-end without a backend. Every save call is a single, isolated
line — swapping in a real API request once the Express/MongoDB backend exists is a small, local
change per form, not a rewrite.
