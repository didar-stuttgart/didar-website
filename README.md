# DIDAR Website

DIDAR — Iranische Kulturgemeinschaft Stuttgart / انجمن فرهنگی هنری اشتوتگارت.

The website is bilingual: Persian (fa, RTL, default) and German (de, LTR, /de prefix). It presents events, accepts event registrations, membership applications and contact messages, and provides a private admin panel.

- Production: https://www.didar-stuttgart.com/
- Repository: https://github.com/didar-Stuttgart/didar-website
- Default branch: main
- Canonical technical documentation: this file plus ARCHITECTURE.md, DATABASE.md, FORMS.md, EVENTS_AND_REGISTRATION.md, ADMIN_GUIDE.md, DEPLOYMENT.md, SECURITY.md, PROJECT_STATE.md

> **Registration model:** DIDAR intentionally uses manual-review workflows. Public submissions are saved first; admins review and contact people manually. There is no email-verification flow, automatic approval/confirmation, or automatic capacity enforcement. Event registration receipts are acknowledgments, not confirmations. Do not reintroduce the removed verification architecture.

## Current implementation

| Area | Current implementation |
|---|---|
| Framework | Next.js 15.5.28 Pages Router, React 18.3, Supabase/PostgreSQL, Vercel, Resend REST API, plain CSS |
| Authentication | Single admin password hash in `ADMIN_PASSWORD_HASH`; DB-backed sessions in `admin_sessions`; HttpOnly cookie |
| Public writes | Next.js API routes call SECURITY DEFINER RPCs |
| Admin writes | Server-side API routes use `SUPABASE_SECRET_KEY` after session validation |
| Event images | Admin-only upload endpoint; Supabase Storage bucket `event-images`; resulting public URL stored in `events.image_url` |
| Event slugs | Optional custom single-segment slug; empty on create preserves automatic Persian-title slug generation |
| Email | Resend REST API; admin notifications for public submissions; event registrants also receive a receipt + cancellation link |
| Caching | ISR: home/list normally 3600 s; event detail 60 s; current production deployment also revalidates public event paths after admin event mutations |
| Tests | No runnable automated test suite is configured in `package.json` |

## Routes

Public:
`/`, `/veranstaltungen`, `/veranstaltungen/[slug]`, `/kontakt`, `/mitglied-werden`, `/ueber-uns`, `/impressum`, `/datenschutz`, `/registrations/cancel`, and legacy `/registrations/verify`. German routes use the `/de` locale prefix.

Admin:
`/admin/login`, `/admin`, `/admin/events`, `/admin/events/[slug]`, `/admin/registrations`, `/admin/memberships`, `/admin/contact`, `/admin/content`, `/admin/settings`.

## Database and migrations

The repository contains `data/schema.sql` and migrations 001 through 014. A fresh database cannot be reconstructed safely by blindly running migrations only; follow [DATABASE.md](DATABASE.md).

Important recent migrations:

- `migration_012_registration_self_cancellation.sql` — receipt-email cancellation token and cancellation RPC.
- `migration_013_allow_reregistration_after_cancel.sql` — partial unique index allowing a new active registration after a cancellation while preserving history.
- `migration_014_event_image_storage.sql` — configures the public-read `event-images` Storage bucket with a 5 MB JPEG/PNG/WebP allowlist.

The repository does **not** prove that every migration is applied to Production. Check [DEPLOYMENT.md](DEPLOYMENT.md) before relying on production schema/storage state.

## Deployment branch note

The GitHub default branch is `main` at commit `0c6cb98d288e6e0ee026a6ba902cc76e913b3e09` as of 2026-11-03.

The currently deployed Production deployment is:

- Vercel deployment: `dpl_9H4DxWc3hT44yfK5giN2g5DhvGaJ`
- target: Production
- source branch: `feature/event-upload-custom-slugs`
- source commit: `0b1379e471c9a9a03053bcacc5ceae58250ec91e`
- state: READY

That production commit adds the event-mutation ISR revalidation helper on top of the code already merged into `main`. Production and `main` should therefore not be described as identical until the feature branch's final commit is merged.

## Local development

```bash
git clone https://github.com/didar-Stuttgart/didar-website.git
cd didar-website
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables and migration ordering are documented in [DEPLOYMENT.md](DEPLOYMENT.md).

## Commands

`npm run dev` — development server.

`npm run build` — production build; build-time page generation reads Supabase.

`npm run start` — serve the production build.

`npm run lint` — Next.js lint command. The latest verified run succeeded with warnings only.

## Working rules

- Do not commit `.env.local`, credentials, exports, or secrets.
- Preserve Persian spelling `اشتوتگارت`.
- Keep public form writes manual-review based.
- Do not broaden Supabase public permissions casually.
- For UI changes, verify rendered pages in a browser.
- For email changes, verify actual delivery; HTTP 201 alone is not proof of delivery.
- Database changes require an explicit migration and production ordering review.
- Do not modify known issues unless explicitly requested.

See [PROJECT_STATE.md](PROJECT_STATE.md) for the current status and unresolved decisions.

## Developer quick reference

### Public request paths

- `GET /api/events?category=all|recurring|upcoming|past`
- `GET /api/events/[eventId]/capacity-status`
- `POST /api/registrations/submit`
- `POST /api/registrations/cancel`
- `/api/registrations/verify` is disabled and returns 404
- `POST /api/memberships/submit`
- `POST /api/contact/submit`
- `GET /api/health`

### Admin/auth request paths

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/verify`
- `GET /api/admin/stats`
- `GET, POST /api/admin/events`
- `GET, PATCH, DELETE /api/admin/events/[slug]`
- `POST /api/admin/events/upload-image`
- `GET /api/admin/registrations` with optional `?eventId=<id>`
- `PATCH, DELETE /api/admin/registrations/[id]`
- `GET /api/admin/registrations/export`
- membership/contact/content/settings endpoints are listed in [ARCHITECTURE.md](ARCHITECTURE.md#5-api-routes)

### Before changing database-dependent code

Read [DATABASE.md](DATABASE.md) and the relevant numbered migration first. A migration file existing in Git does not prove that Production has received it. This matters especially for migrations 012–014.

### Before changing event rendering

Read [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md). Event images, slugs, registration status, the known auto-open issue and ISR revalidation are intentionally coupled behaviors.

### Before changing email behavior

Read [FORMS.md](FORMS.md) and inspect `lib/admin-email.js` / `lib/registration-receipt-email.js`. Public submissions must remain saved even when email delivery fails.
