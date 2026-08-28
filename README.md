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
npm run dev                 # starts the API (port 4000) and the client (port 5174) together
```

Or run each independently:

```bash
cd server && npm run dev    # http://localhost:4000
cd site && npm run dev      # http://localhost:5174 (proxies /api and /uploads to the server)
```

## Deploying to Hostinger (Cloud Startup)

Hostinger runs this as one Node.js application (no bundled database service) that serves both the
API and the built React app, backed by an external MongoDB (e.g. Atlas). This works with either
Hostinger's classic hPanel "Setup Node.js App" tool or its newer GitHub-import Node.js flow.

1. **Database** — use a MongoDB Atlas connection string (or any reachable `MONGODB_URI`); Cloud
   Startup has nowhere to run MongoDB itself.
2. **Push this repo to GitHub** and connect it in Hostinger's Node.js app import, or `git clone` it
   over SSH for the classic hPanel flow.
3. Configure the app:
   - **Node.js version**: 20.19+ or 22.12+ (`engines` in each `package.json` enforces this).
   - **Root directory**: `./` (repo root) — the root `package.json`'s scripts drive both `server/`
     and `site/`.
   - **Build command**: `npm run build` (installs both subpackages' dependencies, then builds the
     server and the client).
   - **Output directory**: `server/dist`. This matters beyond documentation — the client build is
     configured (`site/vite.config.ts`) to output into `server/dist/public`, nested inside this
     same directory, specifically so that a platform which only keeps a declared "output
     directory" for the running app doesn't discard the built frontend.
   - **Entry file / Application startup file**: `server/dist/index.js`.
   - **Environment variables** — set at least: `NODE_ENV=production`, `MONGODB_URI`,
     `CLIENT_ORIGIN` (your `https://` domain), `JWT_SECRET` (long random string — the app refuses
     to start without one in production), `JWT_EXPIRES_IN`, `CONTACT_RECIPIENT_EMAIL`, plus the
     optional `GOOGLE_*`/`SMTP_*` vars from `server/.env.example` if you use those features. Leave
     `PORT` alone — the platform injects it. Note: some hosts don't set `NODE_ENV` to the literal
     string `production` (Hostinger's Node.js app manager uses `deployment`) — the app treats any
     value other than `development` as production, so this is handled either way.
4. Once deployed, run the one-time admin bootstrap over SSH from the repo root:
   `cd server && npm run create-admin`.
5. Visit your domain — `/` serves the React app, `/api/*` is the API, and uploaded photos/logos
   are served from `/uploads/*` (verification documents stay private, never exposed as static
   files). Redeploy (not just restart) after every push so the platform rebuilds `server/dist`.

Point your domain's DNS at Hostinger and issue an SSL certificate (hPanel's free Let's Encrypt)
before going live — the auth cookie is `secure`-flagged in production and requires HTTPS.

## Accounts & the admin panel

There is one account system for the whole app — public visitors and staff are both a `User`,
distinguished only by `role` (`user` / `moderator` / `admin` / `super_admin`). Everyone signs in
through the same `/login` page; a `role` of anything above `user` additionally unlocks
`/admin` and every `/api/admin/*` route (enforced server-side, not just hidden in the UI — a
`user`-role account gets a 403 from the API and an in-app "Access Denied" screen, not just a
missing button).

Run `cd server && npm run create-admin` (bootstraps a `super_admin` from `ADMIN_EMAIL`/
`ADMIN_PASSWORD` in `server/.env`, see `server/.env.example`) before sign-in. From `/admin`:

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
