# ARCHITECTURE

How the DIDAR website is put together and how data moves through it. Every statement here was checked against the code (file paths are real). For tables and SQL see [DATABASE.md](DATABASE.md); for the form flows see [FORMS.md](FORMS.md); for events see [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md).

## 1. System overview

```
Browser ──► Vercel (Next.js 15, Pages Router)
              ├─ static/ISR pages ──► Supabase (reads with the publishable key)
              ├─ pages/api/* (serverless) ─┬─► Supabase  (publishable key: public forms, public reads)
              │                            │            (secret key: admin only)
              │                            └─► Resend REST API (admin notification + registrant receipt)
              └─ admin UI (client-rendered pages that call /api/admin/*)
```

- One Next.js app serves the public site, the admin UI and all API routes.
- There is **no ORM**; code uses `@supabase/supabase-js` directly.
- Email is sent from API routes with `fetch('https://api.resend.com/emails', …)`.
- The site is bilingual: Persian (`fa`, RTL, default, no URL prefix) and German (`de`, LTR, `/de` prefix).

## 2. Key files

| Path | Responsibility |
|---|---|
| `next.config.js` | `i18n` (locales `fa`,`de`; default `fa`; `localeDetection: false`), security headers |
| `pages/_app.js` | Loads fonts and global CSS, derives `currentLang` from `router.locale`, sets `<html lang/dir>`, renders `Header` + page + `Footer`, passes `currentLang` to every page |
| `lib/i18n.js` | `t(key, lang, params)`, `getDirection`, `formatDate`, `formatTime`, `translations` dictionary |
| `lib/supabase.js` | Three clients: `supabase` (browser/publishable), `createServerClient()` (publishable, no session persistence), `createAdminClient()` (secret key, bypasses RLS) |
| `lib/validation.js` | Server-side validators for the three public forms and login |
| `lib/middleware.js` | `withRateLimit()` (used by public form APIs). Also exports `requireAdmin()` and `compose()`, which nothing imports |
| `lib/rate-limit.js` | In-memory per-process IP rate limiter |
| `lib/api-middleware.js` | `requireAdminSession(req,res)` used by every admin API route |
| `lib/admin-auth.js` | PBKDF2 hash/verify, password policy checker, session token generator |
| `lib/session-store-db.js` | Admin sessions in the `admin_sessions` table (hashed tokens) |
| `lib/admin-email.js` | Admin notification emails (registration, membership, contact, cancellation) |
| `lib/registration-receipt-email.js` | Receipt email to the registrant (HTML + plain text, FA/DE) |
| `lib/registration-cancellation.js` | Cancellation token generation/hash/format check and cancellation URL |
| `lib/events-categorizer.js`, `lib/events-filter.js`, `lib/event-image.js` | Event grouping, public-field whitelist, image fallback |
| `lib/cms-client.js` | `getCMSContent()` reads `cms_content` with fallback to i18n |
| `components/*` | `Header` (nav, language toggle, mobile menu), `Footer`, `EventCard`, `EventCarousel`, `SocialIcons`, `SuccessModal` |

Unused/dead code (verified by searching imports): `lib/email.js` (old verification/confirmation mailer, also references SendGrid), `lib/verification.js` (token helpers of the removed verification flow), `lib/session-store.js` (old in-memory session store), `requireAdmin()` in `lib/middleware.js`. They are kept pending owner confirmation (see [PROJECT_STATE.md](PROJECT_STATE.md)).

## 3. Routing and languages

- `next.config.js` enables Next.js locale routing: Persian at `/…`, German at `/de/…`. `localeDetection` is off, so the language is decided only by the URL.
- `pages/_app.js` reads `router.locale` and sets `document.documentElement.lang` and `dir` (`rtl` for `fa`). It also stores the choice in `localStorage` (`didar-lang`) purely as a convenience; the URL always wins.
- The header language toggle (`FA | DE`) calls `router.push` with the other locale, staying on the same route.
- Each page receives `currentLang` and renders text through `t(key, currentLang)`; many pages also set `dir` on their wrapper. Font stacks are CSS variables in `styles/globals.css` (`--font-serif` Playfair Display, `--font-fa-sans` Vazirmatn, `--font-fa-display` Lalezar); RTL-specific rules live in `styles/rtl.css`.
- The admin UI is Persian-only text.

### Public pages

| Route | File | Data source |
|---|---|---|
| `/` | `pages/index.js` | `getStaticProps` (ISR): published events (categorised) + CMS hero/about text |
| `/veranstaltungen` | `pages/veranstaltungen/index.js` | `getStaticProps` (ISR) published events |
| `/veranstaltungen/[slug]` | `pages/veranstaltungen/[slug].js` | `getStaticPaths` (`fallback: 'blocking'`) + `getStaticProps` (`revalidate: 60`); contains the registration form |
| `/kontakt` | `pages/kontakt.js` | static + form |
| `/mitglied-werden` | `pages/mitglied-werden.js` | static + form |
| `/ueber-uns` | `pages/ueber-uns.js` | static JSX / `t()` |
| `/impressum`, `/datenschutz` | `pages/impressum.js`, `pages/datenschutz.js` | hard-coded JSX (not CMS-driven) |
| `/registrations/cancel` | `pages/registrations/cancel.js` | reads `?token=`, POSTs to `/api/registrations/cancel` |
| `/registrations/verify` | `pages/registrations/verify.js` | legacy static thank-you page for old emailed links; the matching API returns 404 |

### Admin pages (all client-rendered; each calls `POST /api/auth/verify` on load and redirects to login if invalid)

`/admin/login`, `/admin` (dashboard counts), `/admin/events`, `/admin/events/[slug]` (create/edit; slug `new` creates), `/admin/registrations`, `/admin/memberships`, `/admin/content`, `/admin/settings`.

## 4. Rendering and caching

- `/` and `/veranstaltungen`: ISR. `getStaticProps` returns `revalidate: 3600` on success and `300` on error/fallback paths (see the file).
- `/veranstaltungen/[slug]`: ISR with `revalidate: 60`. Event rows are fetched with the publishable key (`status = 'published'`), filtered through `filterPublicEvent()` so `admin_notes` and other internal columns never reach the browser.
- `GET /api/events` sends `Cache-Control: public, max-age=300`.
- `npm run build` talks to Supabase to pre-render pages, so the build needs valid Supabase env vars and network access.
- Event images use plain `<img>` (ESLint warns `no-img-element`); `lib/event-image.js` supplies a deterministic fallback from `public/images/event-1…5.jpg`.

## 5. API routes

Public (no auth):

| Route | Methods | Notes |
|---|---|---|
| `/api/events` | GET | Published events grouped by `?category=all|recurring|upcoming|past`, public fields only |
| `/api/events/[eventId]/capacity-status` | GET | Counts registrations with status `verified` (which never occurs in the manual model) → effectively always "not full"; see [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md) |
| `/api/registrations/submit` | POST | Rate-limited; saves registration, sends admin notification + receipt |
| `/api/registrations/cancel` | POST | Rate-limited; cancels by token (GET not allowed, so opening the link never mutates) |
| `/api/registrations/verify` | any | Disabled: always 404 |
| `/api/memberships/submit` | POST | Rate-limited |
| `/api/contact/submit` | POST | Rate-limited |
| `/api/health` | GET | Reads `events` through Supabase; `200 {status:'healthy'}` or `503` |

Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/verify`.

Admin (all require `requireAdminSession`, else `401 {error:'Unauthorized'}`):

| Route | Methods | Table |
|---|---|---|
| `/api/admin/stats` | GET | `events`, `event_registrations`, `membership_applications` (counts over last 7 days / upcoming events) |
| `/api/admin/events` | GET, POST | `events` |
| `/api/admin/events/[slug]` | GET, PATCH, DELETE | `events` (DELETE only sets `status='archived'`) |
| `/api/admin/fix-event-status` | POST | sets an event's `registration_status` to `open` |
| `/api/admin/registrations` | GET | `event_registrations` + event titles; optional `?eventId=<id>` filter (positive integer, else 400) |
| `/api/admin/registrations/[id]` | PATCH / DELETE | `status`, `admin_notes` / delete exactly one row by primary key (`lib/admin-records.js`) |
| `/api/admin/registrations/export` | GET | CSV download |
| `/api/admin/memberships`, `/[id]`, `/export` | GET / PATCH + DELETE / GET | `membership_applications` |
| `/api/admin/contact`, `/contact/[id]` | GET / DELETE | `contact_submissions` (list; delete one row) |
| `/api/admin/content/cms` | GET, POST | `cms_content` (updates `content_fa`/`content_de`) |
| `/api/admin/content` | GET, POST | **legacy**: queries a table named `content` that no migration creates; not used by any admin page |
| `/api/admin/settings/organization` | GET, POST | `organization_settings` |
| `/api/admin/settings` | GET, POST | **legacy**: in-memory object, lost on every restart/cold start, not used by `/admin/settings` |

Response conventions (not strictly uniform): errors are `{ error: string, details?: string[] }`; successes are usually `{ success: true, … }`. Rate limiting returns `429 { error, retryAfter }` with a `Retry-After` header.

## 6. Data access model

| Client | Key | Used for |
|---|---|---|
| `createServerClient()` | publishable (anon role) | public reads of `events` / `cms_content` and calling the form RPCs. Row access is limited by grants + RLS |
| `createAdminClient()` | `SUPABASE_SECRET_KEY` (service role) | all admin API routes and `admin_sessions`; bypasses RLS |
| `supabase` | publishable | exported for browser use; no page currently imports it directly |

Public writes never `INSERT` directly: they call `SECURITY DEFINER` RPCs (`insert_event_registration_manual`, `insert_membership_application_manual`, `insert_contact_submission_manual`, `cancel_event_registration_manual`) that `anon` may execute. Details in [DATABASE.md](DATABASE.md).

## 7. End-to-end flow: event registration

```
/veranstaltungen/[slug] form (client checks: required, email==repeat email)
  → POST /api/registrations/submit  (withRateLimit)
      → load event (published) via publishable key; 409 if registration_status != 'open'
      → validateEventRegistration (server-side, authoritative)
      → generateCancellationToken (raw token kept in memory, SHA-256 hash sent to DB)
      → RPC insert_event_registration_manual  → row status 'new'   [409 on duplicate (event_id,email)]
      → await sendRegistrationNotification (admin; never throws)
      → await sendRegistrationReceipt     (registrant; never throws)
      → 201 { success, message, registrationId }
```

Membership and contact are the same pattern without token and receipt. The notification/receipt calls are **awaited** (not fire-and-forget) because serverless functions stop after the response is sent; both helpers swallow their own errors, so a mail failure cannot roll back or fail the saved submission.

## 8. Cross-cutting behaviour

- **Validation:** server-side in `lib/validation.js`; the client adds UX checks only (and the repeat-email comparison, which is client-only by design).
- **Rate limiting:** `lib/rate-limit.js` keeps a `Map` per server instance (default 10 requests/60 s per IP, env-configurable). On Vercel this is per warm instance, so it is a best-effort control, not a global limit. Login is not rate-limited. See [SECURITY.md](SECURITY.md).
- **Security headers** (`next.config.js`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`. No CSP is set, and HSTS is not set in code; the production response nevertheless carries `strict-transport-security: max-age=63072000`, added by Vercel (observed 2026-10-17).
- **Logging:** `console.log/error` to the hosting logs. Auth routes log verbose diagnostics (including a 16-character token preview) — see [SECURITY.md](SECURITY.md).
- **Browser storage:** only `localStorage['didar-lang']` (language preference). The admin session is an HttpOnly cookie (`session_token`).

## 9. Where to go next

[DATABASE.md](DATABASE.md) · [FORMS.md](FORMS.md) · [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md) · [ADMIN_GUIDE.md](ADMIN_GUIDE.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [SECURITY.md](SECURITY.md) · [PROJECT_STATE.md](PROJECT_STATE.md)
