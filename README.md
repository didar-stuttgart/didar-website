# DIDAR Website

Website of **DIDAR — Iranische Kulturgemeinschaft Stuttgart / انجمن فرهنگی هنری اشتوتگارت**, a bilingual (Persian RTL / German LTR) site for presenting events, taking event registrations, membership applications and contact messages, with a private admin panel.

- Production: https://www.didar-stuttgart.com/
- Repository: https://github.com/didar-Stuttgart/didar-website
- Hosting: Vercel (deployed from GitHub; see [DEPLOYMENT.md](DEPLOYMENT.md) for what is and is not verified)

> **Read this first.** DIDAR uses **manual** registration workflows on purpose: a submission is saved immediately and an admin reviews and contacts people by hand. There is no email-verification token, no automatic approval, and no automatic capacity enforcement. Do not reintroduce those. Details: [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md), [FORMS.md](FORMS.md).

## Documentation map

| Document | Purpose |
|---|---|
| [README.md](README.md) | This entry point: setup, commands, structure |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the system fits together: routing, rendering, i18n, API, data flow |
| [DATABASE.md](DATABASE.md) | Verified tables, migrations, RPCs, grants/RLS, how to change the schema |
| [FORMS.md](FORMS.md) | The three public forms end to end (UI → API → DB → email) |
| [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md) | Event model/lifecycle, categorisation, registration status, receipt + self-cancellation, known issues |
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | What the admin panel really does, and its limitations |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Environment variables, build, deploy, migrations, post-deploy checks, troubleshooting |
| [SECURITY.md](SECURITY.md) | Implemented controls vs. known gaps, secrets handling, incident steps |
| [PROJECT_STATE.md](PROJECT_STATE.md) | What exists, what is verified, known issues, owner decisions, next tasks |

Supplementary / historical documents (not canonical, may be outdated — trust the code and the nine documents above): `ONBOARDING.md`, `SETUP_GUIDE.md`, `SUPABASE_ARCHITECTURE.md`, `CMS_ARCHITECTURE.md`, `CONTENT_INVENTORY.md`, and `docs/claude-onboarding/*`. See [PROJECT_STATE.md](PROJECT_STATE.md#7-supplementary-markdown-files) for the status of each.

## Technology stack (from `package.json` / installed versions)

| Area | Choice |
|---|---|
| Framework | Next.js **15.5.x** (installed 15.5.25) using the **Pages Router**, React 18.3 |
| Database | Supabase (PostgreSQL) through `@supabase/supabase-js` (2.x) |
| Email | Resend **REST API** called with `fetch` (the `resend` npm package is listed in `package.json` but is **not imported anywhere**) |
| Styling | Plain global CSS files in `styles/` (+ `admin.module.css`); fonts via `next/font/google` (Playfair Display, Vazirmatn, Lalezar), self-hosted at build time |
| i18n | Next.js locale routing (`fa` default, `de`) + hand-written dictionary in `lib/i18n.js` |
| Auth | Single admin; PBKDF2 password hash in env var + DB-backed session cookie |
| Tests | One Jest-style file (`__tests__/auth.test.js`) exists but **Jest is not installed and there is no `test` script** — see [PROJECT_STATE.md](PROJECT_STATE.md) |
| Node | `engines.node >= 18` (verified locally with Node 22) |

## Local development

```bash
git clone https://github.com/didar-Stuttgart/didar-website.git
cd didar-website
npm install
cp .env.example .env.local      # then fill in values (never commit .env.local)
npm run dev                     # http://localhost:3000   (FA)  and /de (DE)
```

Required variables are listed in [DEPLOYMENT.md](DEPLOYMENT.md#2-environment-variables). `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are mandatory at import time (`lib/supabase.js` throws without them), so pages and API routes will fail to load without them.

Create the admin password hash (interactive, prints a `salt:hash` string for `ADMIN_PASSWORD_HASH`):

```bash
node scripts/setup-admin.js
```

Database: create a Supabase project, then apply `data/schema.sql` and the migrations in the order given in [DATABASE.md](DATABASE.md#1-how-to-build-a-database-from-scratch). A new database cannot be built by running only the numbered migrations.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (pre-renders pages; reads Supabase at build time) |
| `npm run start` | Serve the production build |
| `npm run lint` | `next lint` (config: `.eslintrc.json`; currently warnings only, no errors) |

## Routes at a glance

Public: `/`, `/veranstaltungen`, `/veranstaltungen/[slug]`, `/kontakt`, `/mitglied-werden`, `/ueber-uns`, `/impressum`, `/datenschutz`, `/registrations/cancel` (self-cancellation), `/registrations/verify` (legacy thank-you page for old links). Every public route also exists under `/de/...`; the Persian version has **no** prefix.

Admin: `/admin/login`, `/admin`, `/admin/events`, `/admin/events/[slug]`, `/admin/registrations`, `/admin/memberships`, `/admin/content`, `/admin/settings`.

API: see [ARCHITECTURE.md](ARCHITECTURE.md#5-api-routes).

## Repository layout

```
pages/                 Next.js pages (+ pages/api/** API routes)
  admin/               Admin UI (login, dashboard, events, registrations, memberships, content, settings)
  api/                 auth/, contact/, events/, memberships/, registrations/, admin/, health.js
  registrations/       cancel.js (self-cancel UI), verify.js (legacy, static message)
  veranstaltungen/     index.js, [slug].js (event detail + registration form)
components/            Header, Footer, EventCard, EventCarousel, SocialIcons, SuccessModal
lib/                   supabase clients, i18n, validation, admin auth/session, email, event helpers
styles/                global CSS (globals, layout, components, enhancements, rtl) + admin.module.css
data/                  schema.sql + migration_001…012 + verify_migration_004.sql
public/                images and icons
scripts/               setup-admin.js (password hash), tmp/insert_events.js (one-off, see PROJECT_STATE)
__tests__/             auth.test.js (not runnable via npm, see above)
docs/claude-onboarding historical AI-onboarding notes (not canonical)
```

## Working rules (short)

- Never commit `.env.local`, keys, or exports (`.gitignore` covers `.env*`, `*.csv`, `*.xlsx`).
- Database changes need an explicit migration **applied to production before** the code that depends on it is deployed (this caused a production outage for migration 012; see [DEPLOYMENT.md](DEPLOYMENT.md#5-database-migrations)).
- Persian spelling uses **اشتوتگارت**.
- Prefer small, focused changes; verify in a browser for UI changes, and with real delivery tests for email changes.
