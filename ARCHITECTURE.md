# DIDAR Website — Architecture Reference

This is the technical companion to `ONBOARDING.md`. Read that first if you're new. This document goes into implementation detail: every route, the database schema, and how the pieces actually connect.

## 1. Request flow, end to end

**A public page (e.g. the homepage):**
`Browser requests /` → Next.js runs `getStaticProps()` in `pages/index.js` at build time (and again on a schedule, see below) → that function calls Supabase directly (server-side, no API round trip needed) → returns pre-rendered HTML → the browser never has to wait on the database.

**A form submission (e.g. event registration):**
`Browser submits the form` → `fetch('/api/registrations/submit', { method: 'POST', ... })` → the API route validates the input (`lib/validation.js`), checks the request isn't rate-limited (`lib/rate-limit.js`), inserts a row into Supabase using the public key → returns success/error JSON → the form shows a confirmation or error message. The browser never talks to Supabase directly for writes.

**An admin action (e.g. viewing registrations):**
`Browser (already logged in) requests /admin/registrations` → the page checks its session via `POST /api/auth/verify` → if valid, it calls `/api/admin/registrations` → that endpoint checks the session again server-side, then queries Supabase using the **secret/admin key** (which bypasses Row Level Security) → returns the data. See section 4 for a caveat on this flow.

## 2. Rendering strategy: Incremental Static Regeneration (ISR)

Pages that show event data (`pages/index.js`, `pages/veranstaltungen/index.js`, `pages/veranstaltungen/[slug].js`) use Next.js's `getStaticProps` with `revalidate: 3600` (1 hour). This means:

- The page is built once (or first-visited) as static HTML — fast, no database call on every visitor.
- Next.js automatically rebuilds that page in the background at most once per hour if it's requested again.
- If you publish a new event in the admin panel and want it live immediately rather than waiting up to an hour, redeploying (pushing to `main`) forces a fresh build.

This is a deliberate trade-off: much faster and cheaper than querying the database on every page view, at the cost of events not appearing *instantly* the moment they're added.

## 3. Database schema (Supabase / PostgreSQL)

The authoritative schema lives in `data/schema.sql`. Four tables:

**`events`** — one row per event. Bilingual fields (`title_fa`/`title_de`, `description_fa`/`description_de`, `location_fa`/`location_de`) so each event has both languages side by side rather than two separate rows. Key fields:
- `status`: `draft` | `published` | `archived` — only `published` events are visible to the public.
- `registration_status`: `not_open` | `open` | `closed` — the current source of truth for whether visitors can register (see below).
- `registration_open` (boolean) — an older field, no longer read anywhere in the app, kept only so nothing breaks if something still references it. Safe to drop later once confirmed unused.
- `slug` — used in the URL (`/veranstaltungen/[slug]`), must be unique.

**`event_registrations`** — one row per person who registers for an event. Minimal personal data only (name, email, optional phone/Telegram/comment). A person can only register once per event (`UNIQUE (event_id, email)`).

**`membership_applications`** — one row per membership application. Similar shape to registrations. Email must be unique across the whole table (only one application per email address).

**`contact_submissions`** — one row per contact form message.

### Row Level Security (RLS)

RLS is PostgreSQL's own permission system, enforced by the database itself regardless of what the application code does — a second line of defense beyond the API code. The rules, per table:

- `events`: the public can `SELECT` only rows where `status = 'published'`. Nothing else is allowed for the public.
- `event_registrations`, `membership_applications`, `contact_submissions`: the public can `INSERT` only — no reading, updating, or deleting. This means even if someone found the public API key, they could not read anyone else's registration, application, or message.

The admin panel bypasses RLS entirely by using a separate **secret/service key** (`SUPABASE_SECRET_KEY` in the environment) that has full database access. This key must never be exposed to the browser — it's only ever used inside API routes running on the server (see `lib/supabase.js`'s `createServerClient()` vs. the public client).

## 4. Authentication — how the admin panel is protected, and its current bug

There is exactly one admin account, protected by a single password (its hash is stored in the `ADMIN_PASSWORD_HASH` environment variable — never the plaintext password itself). Login uses a session cookie, not a username/password sent with every request.

**The flow as currently wired:**

| Step | File | Session store it uses |
|---|---|---|
| Login | `pages/api/auth/login.js` | `lib/session-store.js` |
| Logout | `pages/api/auth/logout.js` | `lib/session-store.js` |
| Verify (used by the dashboard on page load) | `pages/api/auth/verify.js` | `lib/session-store.js` |
| Every admin data endpoint (`/api/admin/stats`, `/events`, `/registrations`, `/memberships`, `/content`, `/settings`) | via `requireAdminSession()` in `lib/api-middleware.js` | `lib/admin-auth.js` |

**The bug:** `lib/session-store.js` and `lib/admin-auth.js` each keep their own independent in-memory list of valid sessions (both literally called `activeSessions`, but they are two different objects in two different files). A session created by logging in is stored in `session-store.js`'s list. But every admin data endpoint checks `admin-auth.js`'s list instead — which never received that session. The practical effect: logging in appears to succeed (the login/verify calls only ever look at `session-store.js`, so they agree with each other), but the moment the dashboard tries to load actual data from `/api/admin/stats` or any other admin data endpoint, that check fails against the *other* store and returns `401 Unauthorized`.

There's also a second, smaller duplication worth knowing about: `lib/middleware.js` exports a `requireAdmin()` wrapper that also uses `admin-auth.js`'s store, but nothing currently imports `lib/middleware.js` — only `lib/api-middleware.js`'s `requireAdminSession()` is actually used by routes. So there are effectively three near-identical pieces of session-checking code (`session-store.js`, `admin-auth.js`, and the unused wrapper in `middleware.js`) where the project only needs one.

**To fix this** (not done as part of this audit — flagged for a deliberate decision, since it's a real code change): pick one session store (most likely `lib/session-store.js`, since it's simpler and already used for login/logout/verify), point every admin API route's `requireAdminSession` at it instead of `admin-auth.js`, and then delete the now-unused duplicate code in `admin-auth.js`'s session functions and the unused `lib/middleware.js` file. `admin-auth.js` should keep its password-hashing functions (`hashPassword`, `verifyPassword`, `validatePassword`) — only the session-tracking part of it is duplicated.

Beyond this bug, the auth design itself is intentionally simple for a single-admin site: sessions are stored **in memory**, meaning they're wiped whenever the server restarts or redeploys (the admin would just need to log in again — not a security problem, just a minor inconvenience). This is a documented, deliberate trade-off from Phase 1 (see `PROJECT_STATE.md`), not something to "fix" by adding Redis or a database-backed session store unless the project's needs actually grow past a single admin.

## 5. API route reference

**Public form submissions** (all: validate input → rate-limit by IP → insert into Supabase → return JSON):
- `POST /api/registrations/submit` — event registration
- `POST /api/memberships/submit` — membership application
- `POST /api/contact/submit` — contact message

**Public read-only:**
- `GET /api/events` — published events, optional `?status=upcoming|past|all`
- `GET /api/health` — deployment health check (used to confirm the site + Supabase connection are working after a deploy)

**Authentication:**
- `POST /api/auth/login` — password → session cookie
- `POST /api/auth/logout` — clears the session
- `POST /api/auth/verify` — checks if the current session cookie is still valid

**Admin (all require a valid admin session — subject to the bug in section 4):**
- `/api/admin/stats` — dashboard summary numbers
- `/api/admin/events`, `/api/admin/events/[slug]` — create/edit events
- `/api/admin/registrations`, `/api/admin/registrations/[id]`, `/api/admin/registrations/export` — manage and export event registrations
- `/api/admin/memberships`, `/api/admin/memberships/[id]`, `/api/admin/memberships/export` — manage and export membership applications
- `/api/admin/content` — edit page content
- `/api/admin/settings` — contact info and social links

## 6. Styling

Plain CSS, no framework (no Tailwind, no CSS-in-JS library) and no CSS modules except for the admin panel (`styles/admin.module.css`, scoped so its class names can't accidentally clash with the public site's). Public-site styles are split by purpose, all loaded globally via `pages/_app.js`, in this load order (order matters — later files can override earlier ones):

1. `globals.css` — CSS custom properties (design tokens: colors, spacing, font sizes), resets
2. `layout.css` — page-level layout structures
3. `components.css` — reusable component styles (buttons, cards, forms)
4. `rtl.css` — right-to-left overrides for Persian
5. `enhancements.css` — later refinements and fixes layered on top (loads last, so it wins any conflicts with the files above — this is why Phase 11's duplicate `.form-group` cleanup kept the copy here and removed the one in `components.css`)

## 7. Environment variables

Defined in `.env.example` (template) and `.env.local` (real values, never committed):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — public, safe to expose to the browser; limited by RLS.
- `SUPABASE_SECRET_KEY` — full database access, server-side only, must never reach the browser.
- `ADMIN_PASSWORD_HASH` — the one admin account's password, hashed (PBKDF2-SHA256). Generated by `scripts/setup-admin.js`.
- `RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW_MS` — public form rate limiting (default: 10 requests per 60 seconds per IP).
- `NODE_ENV`, `VERCEL_ENV` — set automatically by Vercel in deployed environments.

## 8. Known technical debt / things a maintainer should be aware of

- **The session-store duplication bug** — see section 4. This is the most important one.
- `data/mockEvents.json` was removed during the cleanup pass that produced this document — it was leftover placeholder data from before Supabase was wired in, and nothing imported it anymore.
- The old `registration_open` boolean column still exists in the `events` table for backward compatibility but is unused by the app. Safe to drop once confirmed nothing external depends on it.
- Rate limiting and admin sessions are both in-memory (see section 4) — fine for this project's actual scale (single admin, low traffic), but worth knowing if traffic or team size ever grows meaningfully.
- This document and `ONBOARDING.md` were generated by reading the code as of September 2026. Treat `PROJECT_STATE.md` as the more current, chronological source of truth for what's changed since — update these two files if the architecture changes significantly (a new page type, a new service, a different auth system, etc.), the same way `PROJECT_STATE.md` gets updated after each phase.
