# ARCHITECTURE

Current implementation architecture. For database details see [DATABASE.md](DATABASE.md); for forms see [FORMS.md](FORMS.md); for event lifecycle see [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md).

## 1. System overview

```text
Browser
  -> Next.js 15 Pages Router on Vercel
      -> public pages / ISR -> Supabase (publishable key)
      -> pages/api/* -> Supabase
            public routes -> publishable key + SECURITY DEFINER RPCs
            admin routes  -> SUPABASE_SECRET_KEY after session validation
      -> Resend REST API for email notifications/receipts
```

There is no separate backend service and no ORM.

## 2. Rendering and language model

Next.js locale routing is configured for `fa` and `de`:

- Persian is the default locale and has no URL prefix.
- German uses the `/de` prefix.
- `localeDetection` is disabled.
- `pages/_app.js` sets document language and direction.
- The Header language switcher moves between locale routes while preserving the current path.

Public page rendering:

| Route | Rendering/data |
|---|---|
| `/` | ISR, published events + CMS content; 3600 s on success |
| `/veranstaltungen` | ISR, published events; 3600 s on success |
| `/veranstaltungen/[slug]` | blocking fallback + ISR, 60 s |
| `/kontakt` | static page + form |
| `/mitglied-werden` | static page + form |
| `/ueber-uns` | static JSX/i18n |
| `/impressum`, `/datenschutz` | hard-coded legal pages |
| `/registrations/cancel` | token-based cancellation UI |
| `/registrations/verify` | legacy static page; verification API is disabled |

## 3. Authentication

Admin authentication is database-backed.

1. `POST /api/auth/login` verifies `ADMIN_PASSWORD_HASH`.
2. A random session token is generated.
3. Only its SHA-256 hash is stored in `admin_sessions`.
4. The token is returned as an HttpOnly `session_token` cookie; Production adds `Secure`.
5. Admin pages and API routes validate the token through the DB-backed session store.
6. Logout removes the session row.

There is one shared admin account. No username table or public user account system exists.

## 4. Data access

| Client | Key | Use |
|---|---|---|
| `createServerClient()` | publishable | public reads + RPC calls |
| `createAdminClient()` | `SUPABASE_SECRET_KEY` | admin APIs and admin sessions |
| `supabase` | publishable | exported browser client; not currently used by pages |

Public form endpoints use the narrow RPCs:

- `insert_event_registration_manual`
- `insert_membership_application_manual`
- `insert_contact_submission_manual`
- `cancel_event_registration_manual`

## 5. API routes

Public APIs include:

- `GET /api/events`
- `GET /api/events/[eventId]/capacity-status`
- `POST /api/registrations/submit`
- `POST /api/registrations/cancel`
- `/api/registrations/verify` (disabled; 404)
- `POST /api/memberships/submit`
- `POST /api/contact/submit`
- `GET /api/health`

Admin APIs cover stats, events, event-image upload, registrations, memberships, contact, CMS content and organization settings. All admin APIs call `requireAdminSession`.

## 6. Event images and slugs

`lib/event-image.js` is the single image resolver used by event cards and the event detail page.

```text
events.image_url -> deterministic fallback (/images/event-1.jpg … event-5.jpg)
```

Admin event images can be:

- uploaded as JPEG/PNG/WebP up to 5 MB through `/api/admin/events/upload-image`;
- stored in Supabase Storage bucket `event-images`;
- saved back into `events.image_url`;
- or supplied as an existing URL/path.

Custom event slugs are validated as a single safe URL segment. A blank slug on create uses the existing Persian-title generator. On update, a non-empty slug changes the stored URL; no automatic redirect from the previous slug is created.

## 7. Caching and event mutation revalidation

Normal ISR windows are:

- home: 3600 s
- event list: 3600 s
- event detail: 60 s

The current Production deployment also contains `lib/revalidate-event-pages.js`. After successful event create/update/archive mutations it explicitly invalidates:

- `/`
- `/veranstaltungen`
- the affected event detail path(s)

Revalidation failures are logged and do not roll back the successful database mutation.

This helper is present on the currently deployed Production commit `0b1379e...`; the default `main` branch at `0c6cb98...` does not yet contain that final helper commit.

## 8. Manual registration flow

```text
visitor
  -> POST /api/registrations/submit
  -> validate + rate limit
  -> SECURITY DEFINER RPC
  -> row status='new'
  -> admin notification
  -> registrant receipt + cancellation link
  -> HTTP 201
```

Email helpers swallow send failures. A failed email does not roll back a saved submission.

## 9. Security boundaries

- Admin secret key is server-only.
- Public personal-data tables are not publicly readable.
- Rate limiting is in-memory per process/IP.
- CSV exports use formula-injection-safe cell escaping.
- The homepage strips `admin_notes` before embedding event data.

Known gaps and unresolved decisions are maintained in [SECURITY.md](SECURITY.md) and [PROJECT_STATE.md](PROJECT_STATE.md).

## 10. Request/response operational details

### Public forms

The three public form APIs are rate-limited by an in-memory IP limiter. Default is 10 requests per 60 seconds; `RATE_LIMIT_REQUESTS` and `RATE_LIMIT_WINDOW_MS` can override the defaults. The limiter is per server instance, not a global Vercel-wide quota.

Server validation lives in `lib/validation.js` and is authoritative. Client-side repeat-email confirmation is UX-only and is not stored.

### Registration response semantics

- Invalid event id: HTTP 400.
- Missing/unpublished event: HTTP 404.
- `registration_status !== 'open'`: HTTP 409 with `errorType: registration_closed`.
- Duplicate active event/email: HTTP 409 with `errorType: duplicate_email`.
- Validation failure: HTTP 400 with a `details` array.
- Successful save: HTTP 201.
- Email failure does not turn a successful database insert into an error.

### Admin registration filter

`GET /api/admin/registrations?eventId=<positive integer>` filters server-side. The admin UI sorts the loaded result set locally by date, name or status. The CSV exporter is not limited by the selected event filter.

### Admin event archive

`DELETE /api/admin/events/[slug]` does not delete the row. It updates `status='archived'`. Registrations remain associated with the event.

## 11. Source-to-behavior map

| Behavior | Primary source |
|---|---|
| Locale/direction | `next.config.js`, `pages/_app.js`, `lib/i18n.js` |
| Public form validation | `lib/validation.js` |
| Public form rate limiting | `lib/middleware.js`, `lib/rate-limit.js` |
| Admin login/session | `pages/api/auth/*.js`, `lib/admin-auth.js`, `lib/session-store-db.js` |
| Public registration insert | `pages/api/registrations/submit.js` + migration 012 RPC |
| Self-cancellation | `pages/api/registrations/cancel.js` + migration 012 RPC |
| Re-registration uniqueness | migration 013 |
| Event image upload | `pages/api/admin/events/upload-image.js` + migration 014 |
| Event image display | `lib/event-image.js`, EventCard, event detail page |
| Custom slug handling | `lib/event-slug.js`, admin event APIs |
| Public event-field filtering | `lib/events-filter.js` |
| Public event grouping | `lib/events-categorizer.js` |
| Homepage CMS fallback | `lib/cms-client.js`, `pages/index.js` |
| Admin CMS editing | `pages/admin/content.js`, `pages/api/admin/content/cms.js` |
| Organization settings | `pages/admin/settings.js`, `pages/api/admin/settings/organization.js` |
| Production event ISR refresh | `lib/revalidate-event-pages.js` on the current Production commit |

The Production revalidation helper is not in `main` yet, so source inspection from `main` and Production behavior can differ until the branches converge.

## 3A. Public page source map

| Route | Primary file |
|---|---|
| `/` | `pages/index.js` |
| `/veranstaltungen` | `pages/veranstaltungen/index.js` |
| `/veranstaltungen/[slug]` | `pages/veranstaltungen/[slug].js` |
| `/kontakt` | `pages/kontakt.js` |
| `/mitglied-werden` | `pages/mitglied-werden.js` |
| `/ueber-uns` | `pages/ueber-uns.js` |
| `/impressum` | `pages/impressum.js` |
| `/datenschutz` | `pages/datenschutz.js` |
| `/registrations/cancel` | `pages/registrations/cancel.js` |
| `/registrations/verify` | `pages/registrations/verify.js` (legacy) |

Use this table as the starting point for route-local UI/content changes; the API ownership map is separate.
