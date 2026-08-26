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
`server/.env` (see `server/.env.example`) before running `npm run create-admin`. From there you can
manage vacancies/schools/candidates and review every form submission (candidate applications,
school registrations, home-tutor requests, contact messages, vacancy applications).

See `server/README.md` and `site/README.md` for details on each half.
