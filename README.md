# TeachingCareer

A MERN-stack platform connecting schools, teaching candidates, and parents looking for home
tutors.

```
site/    React + TypeScript + Vite + Tailwind frontend
server/  Express + MongoDB (Mongoose) backend API
```

## Getting started

Requires a MongoDB server reachable at the URI in `server/.env` (defaults to
`mongodb://127.0.0.1:27017/teachingcareer`).

```bash
npm install --prefix server
npm install --prefix site
npm install                 # installs `concurrently` for the root dev script

npm run seed                # populate MongoDB with demo vacancies/schools/candidates/blog posts
cd server && npm run create-admin && cd ..   # bootstrap the admin account from server/.env
npm run dev                 # starts the API (port 4000) and the client (port 5173) together
```

Or run each independently:

```bash
cd server && npm run dev    # http://localhost:4000
cd site && npm run dev      # http://localhost:5173 (proxies /api and /uploads to the server)
```

## Admin panel

`http://localhost:5173/admin/login` — sign in with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` set in
`server/.env` (see `server/.env.example`) before running `npm run create-admin`; that account is
always a `super_admin`. From there:

- **Dashboard** — live stats and pending-review counts pulled straight from MongoDB.
- **Vacancies / Schools / Candidates / Blogs / Services** — full CRUD, plus reversible
  Close/Reopen/Archive/Restore/Suspend/Publish actions (public pages never show archived,
  suspended, or draft records).
- **Candidate Applications / School Registrations** — review submitted documents, then
  Verify/Approve (creates the public listing and permanently deletes the uploaded documents,
  keeping only the verification status) or Reject (also deletes the documents).
- **Documents** — the queue of applications still awaiting a decision.
- **Home Tutor Requests / Contact Messages / Vacancy Applications** — status + delete inboxes.
- **Notifications** — a bell with unread count, generated whenever a public form is submitted.
- **Staff** (`super_admin` only) — create/suspend admin accounts and set their role
  (`super_admin` / `admin` / `moderator` — enforced server-side, not just hidden in the UI).
- **Reports** (`admin`+) — submission trends and content breakdowns from live aggregation queries.
- **Audit Logs** (`super_admin` only) — every admin action, who did it, and when.
- **Settings** (`super_admin` only) — site-wide contact info and social links, reflected live on
  the public Footer/Header/Contact/Home-Tutor pages.

See `server/README.md` for the full role/capability matrix and the document-privacy model, and
`site/README.md` for the client structure.
