# Next13-CRUD

A CRUD app that started as a Next.js tutorial project (Next.js 13 App Router + MongoDB) and was
iteratively hardened into a small but complete full-stack application: authentication, per-user
authorization, an admin panel, search/pagination, structured logging, and an automated test suite.

See [PHASES.md](PHASES.md) for the full history of what changed and why, and
[TROUBLESHOOTING.md](TROUBLESHOOTING.md) for setup/infra gotchas encountered along the way (Atlas
config, Windows DNS resolution, Next.js caching quirks).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 13 (App Router), React 18 |
| Database | MongoDB Atlas via Mongoose |
| Auth | NextAuth v4 (Credentials provider, JWT sessions, bcrypt password hashing) |
| Validation | Zod (shared schemas for forms and Server Actions) |
| Mutations | Server Actions (`"use server"`) — no REST API routes for writes |
| Styling | Tailwind CSS |
| Notifications | react-hot-toast |
| Logging | pino (structured, server-side only) |
| Unit tests | Vitest |
| Integration tests | Playwright (real browser, against the real database) |

## Features

**Auth & authorization**
- Email/password accounts (NextAuth Credentials + bcrypt), JWT sessions.
- Every topic has an owner; only the owner or an `admin` can edit/delete it.
- `middleware.js` protects `/`, `/addTopic`, `/editTopic/**` (any session) and `/admin`
  (admin role only).
- `/admin`: list users, delete accounts — cascades to delete that user's topics.
- The account matching the `ADMIN_EMAIL` env var is auto-promoted to `admin` on registration.

**Topics CRUD**
- Create/update/delete via Server Actions, validated with Zod on both client and server.
- Search (title/description, debounced-as-you-type, regex-escaped to avoid ReDoS) + pagination.
- Toast notifications instead of native `alert()`/`confirm()`.
- `loading.js` / `error.js` / `not-found.js` boundaries per route segment.

**Engineering**
- Structured server-side logging (pino) — connection lifecycle, Server Action failures.
- 15 unit tests (Zod schemas, regex-escaping helper) + 5 Playwright end-to-end tests covering the
  full CRUD flow, cross-user authorization, and admin-driven account/data deletion — run against a
  real Atlas database with automatic, prefix-scoped cleanup (`pwtest_*` emails, `[PW-TEST]` titles)
  that always runs, even if a test fails mid-way.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` in the project root with:
   ```
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_SECRET=<random string, e.g. `openssl rand -base64 32`>
   NEXTAUTH_URL=http://localhost:3001
   ADMIN_EMAIL=you@example.com
   ```
   (The account that registers with this email becomes the superadmin.)
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Register an account using the email from `ADMIN_EMAIL` to get admin access.

If you hit connection issues (paused Atlas cluster, DNS resolution on Windows, etc.), check
[TROUBLESHOOTING.md](TROUBLESHOOTING.md) first — most of it has already been diagnosed.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | Integration tests (Playwright, spins up its own dev server on port 3100) |

### Maintenance scripts (`scripts/`)

One-off CLIs for direct database fixes, not part of the app runtime:
- `assign-owner-to-legacy-topics.js <admin-email>` — backfill `owner` on topics predating the
  ownership model.
- `promote-to-admin.js <email>` — grant admin to an existing account without recreating it.
- `reset-password.js <email> <new-password>` — reset a forgotten password directly in the database.

## Project structure

```
app/
  actions/        Server Actions (topics, auth, admin)
  api/auth/       NextAuth route handler
  admin/          Admin panel
  addTopic/, editTopic/[id]/, login/, register/
components/       TopicForm, TopicsList, SearchBar, Pagination, Navbar, RemoveBtn, ...
libs/             mongodb, authOptions, validation (Zod), logger (pino), search (regex escaping)
models/           Mongoose schemas (Topic, User)
e2e/              Playwright integration tests + DB test helpers
scripts/          Manual maintenance CLIs (see above)
```
