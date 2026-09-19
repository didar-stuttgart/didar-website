# DIDAR Website — Admin Panel Full Functional & Content Audit

**Mode:** Read-only analysis. No code, data, or configuration was modified.
**Date:** September 19, 2026
**Scope:** `didar-stuttgart/didar-website` (local copy at `C:\Users\Avid\Desktop\didar-website`), production at `https://didar-website.vercel.app`
**Stack (verified from `package.json`):** Next.js 15 (Pages Router, not App Router), React 18, `@supabase/supabase-js` 2.x. Plain CSS (no Tailwind, no CSS-in-JS). No TypeScript. No test framework in the repo.
**Method:** Every claim below was checked against the actual file contents (not filenames or assumptions). Git history (`git log`) and `git status` were also inspected. No Supabase dashboard access was available in this session, so a small number of claims about the *live* database are marked "**verify in Supabase**" — these are things the code implies but that only the live database can confirm.

A short version of the two most important findings, for orientation before the detail below:

1. **The Content admin page (`/admin/content`) and the Settings admin page (`/admin/settings`) both appear to work — they load, accept input, and save successfully — but neither one is actually connected to anything a visitor sees.** The homepage hero text, the About page text, the contact email, and the social media links are all hardcoded directly in the page/component source files. Saving new values in these two admin pages changes rows in a database table (Content) or a temporary server variable (Settings) that no public page ever reads. This was confirmed by searching the entire codebase for every field name these two admin pages save, outside of the admin files themselves — zero matches for all of them except one URL.
2. **The Registrations and Memberships admin pages, and the dashboard stats box, query Supabase tables named `registrations` and `memberships`.** The schema file that defines the actual database (`data/schema.sql`) creates tables named `event_registrations` and `membership_applications` instead — there is no `registrations` or `memberships` table anywhere in the repository's SQL. If the live Supabase project matches the committed schema (which is the norm, but was not directly verified — **verify in Supabase**), these three admin features would fail with a database error rather than showing data.

Both are explained in full, with file evidence, in the relevant sections below (primarily §6, §7, §8 and §13).

---

## 1. Admin Architecture — Overview

**Framework pattern:** Next.js Pages Router. Every admin screen is a page component under `pages/admin/`; every admin operation is a matching serverless API route under `pages/api/admin/`. There is no separate backend service — Vercel runs each `pages/api/*` file as its own serverless function.

**Admin pages found** (verified by reading each file, not inferred from the folder listing):

| File | Route |
|---|---|
| `pages/admin/login.js` | `/admin/login` |
| `pages/admin/index.js` | `/admin` |
| `pages/admin/events/index.js` | `/admin/events` |
| `pages/admin/events/[slug].js` | `/admin/events/[slug]` (also serves "new event" at `/admin/events/new`, see §2) |
| `pages/admin/registrations.js` | `/admin/registrations` |
| `pages/admin/memberships.js` | `/admin/memberships` |
| `pages/admin/content.js` | `/admin/content` |
| `pages/admin/settings.js` | `/admin/settings` |

That is the **complete list** — there is no `/admin/events/new.js` file, no reports page, no user-management page, no gallery/media-library page, and no analytics page anywhere in `pages/admin/`.

**Admin API routes found:**

| File | Route |
|---|---|
| `pages/api/auth/login.js` | `POST /api/auth/login` |
| `pages/api/auth/logout.js` | `POST /api/auth/logout` |
| `pages/api/auth/verify.js` | `POST /api/auth/verify` |
| `pages/api/admin/stats.js` | `GET /api/admin/stats` |
| `pages/api/admin/events/index.js` | `GET`, `POST /api/admin/events` |
| `pages/api/admin/events/[slug].js` | `GET`, `PATCH`, `DELETE /api/admin/events/[slug]` |
| `pages/api/admin/registrations/index.js` | `GET /api/admin/registrations` |
| `pages/api/admin/registrations/[id].js` | `PATCH /api/admin/registrations/[id]` |
| `pages/api/admin/registrations/export.js` | `GET /api/admin/registrations/export` |
| `pages/api/admin/memberships/index.js` | `GET /api/admin/memberships` |
| `pages/api/admin/memberships/[id].js` | `PATCH /api/admin/memberships/[id]` |
| `pages/api/admin/memberships/export.js` | `GET /api/admin/memberships/export` |
| `pages/api/admin/content/index.js` | `GET`, `POST /api/admin/content` |
| `pages/api/admin/settings/index.js` | `GET`, `POST /api/admin/settings` |

**Shared/support code used by admin:**

| File | Role |
|---|---|
| `lib/session-store.js` | The one real session store (in-memory `Map`). Used by login, logout, verify, and (via `lib/api-middleware.js`) every admin data route. |
| `lib/api-middleware.js` | Exports `requireAdminSession()` — the guard every `pages/api/admin/*` route calls first. |
| `lib/admin-auth.js` | Password hashing/verification (PBKDF2-SHA256) and password-strength validation. Session-tracking code that used to live here was removed (see §12). |
| `lib/middleware.js` | Exports `requireAdmin()` and `withRateLimit()`. `requireAdmin()` is **not used anywhere** in the current codebase (dead code, kept "in case it's wired up later" per its own comment) — every route uses `requireAdminSession()` from `api-middleware.js` instead. `withRateLimit()` **is** used, by the three public form endpoints. |
| `lib/supabase.js` | Exports `supabase` (client-side), `createServerClient()` (publishable key, used by public pages/forms), and `createAdminClient()` (secret key, used by every admin API route). |
| `styles/admin.module.css` | The only stylesheet used by admin pages (CSS Modules, 606 lines). Public pages use a separate set of plain global stylesheets and never load this file. |

No middleware file (`middleware.js` at the project root, the Next.js convention for edge middleware) exists — route protection happens only inside each API handler and each admin page's client-side `useEffect`, not at the framework level. Details and implications in §12.

---

## 2. Admin Route-by-Route Map

| Admin route | Page file | Purpose | What it reads | What it can change | Data source | Public site impact | Main actions |
|---|---|---|---|---|---|---|---|
| `/admin/login` | `pages/admin/login.js` | Password entry | Nothing | Nothing (creates a session) | — | None | Submit password → `POST /api/auth/login` |
| `/admin` | `pages/admin/index.js` | Dashboard home | Counts from `GET /api/admin/stats` (upcoming events, new registrations this week, new memberships this week) | Nothing directly | Supabase (`events`, and — per the code — `registrations`/`memberships`, see §13 critical finding) | None | Logout; links to the 5 sections below |
| `/admin/events` | `pages/admin/events/index.js` | List all events | All events (`GET /api/admin/events`, every status) | Deletes events (hard delete) | Supabase `events` | Yes — deleting removes it from the public site and **cascades to delete all of its registrations** (see §3) | "رویداد جدید" (new event) link; "ویرایش" (edit) per row; "حذف" (delete) per row with a plain JS `confirm()` |
| `/admin/events/new` | `pages/admin/events/[slug].js` (same file, `slug === 'new'`) | Create event | Nothing (blank form) | Creates one event row | Supabase `events` | Yes, once `status` is `published` | "ذخیره رویداد" (save) |
| `/admin/events/[slug]` | `pages/admin/events/[slug].js` | Edit event | One event (`GET /api/admin/events/[slug]`) | All fields listed in §3 | Supabase `events` | Yes | "ذخیره رویداد" (save); "انصراف" (cancel, just navigates back) |
| `/admin/registrations` | `pages/admin/registrations.js` | View/manage event sign-ups | All registrations (`GET /api/admin/registrations`) — see §13 for the table-name concern | Registration `status` only, per row | Supabase (queried as `registrations`; schema defines `event_registrations` — see §13) | None (admin-only data) | Client-side sort (date/name/status); status dropdown per card; "دانلود CSV" export |
| `/admin/memberships` | `pages/admin/memberships.js` | View/manage membership applications | All applications (`GET /api/admin/memberships`) — see §13 | Application `status` only, per row | Supabase (queried as `memberships`; schema defines `membership_applications` — see §13) | None (admin-only data) | Status dropdown per card; "دانلود CSV" export |
| `/admin/content` | `pages/admin/content.js` | Edit "page content" | The one `content` row (`GET /api/admin/content`) | 6 text fields (hero title/subtitle × FA/DE, about intro × FA/DE) | Supabase `content` table | **None — see §6, no public page reads this table** | "ذخیره تغییرات" (save) |
| `/admin/settings` | `pages/admin/settings.js` | Edit contact/social info | The in-memory settings object (`GET /api/admin/settings`) | Contact email, Telegram channel, Telegram contact, Instagram URL | An in-memory JS variable in `pages/api/admin/settings/index.js` — **not a database** | **None — see §7, no public page reads this** | "ذخیره تغییرات" (save) |

There is no route for creating an admin user, no role/permission settings screen, no media library, no site-wide "publish/preview" toggle, and no audit log viewer.

---

## 3. Event Management — Field by Field

**Can the admin (verified from `pages/admin/events/[slug].js` and `pages/api/admin/events/*`):**

| Capability | Answer |
|---|---|
| Create an event | **YES** |
| Edit an event | **YES** |
| Delete an event | **YES** — hard delete, permanent, cascades to registrations (see below) |
| Publish/unpublish | **YES**, via the `status` dropdown (`draft` / `published` only — see below) |
| Change title (FA) | **YES** |
| Change title (DE) | **YES** |
| Change description (FA) | **YES** |
| Change description (DE) | **YES** |
| Change date | **YES** |
| Change time | **YES** (optional) |
| Change location (FA/DE) | **YES** |
| Change image | **YES, but only as a raw image URL** — there is no upload control (see §10) |
| Change slug | **NO** — the slug is set only once, automatically, at creation (`event.title_fa.toLowerCase().replace(/\s+/g, '-')` in `pages/api/admin/events/index.js`), and is never sent by the edit form again. There is no slug field anywhere in the admin UI. Because it is derived from the Persian title using plain lowercase + hyphen substitution (no transliteration), a Persian title produces a slug that is just the Persian text with spaces turned into hyphens — readable German-style URLs are not guaranteed. |
| Change event category/type | **NO** — `EventCard.js` and the event detail page both know how to display a `category`/`category_fa`/`category_de` field if present, but no schema column exists for it (`data/schema.sql`) and no admin form field sets it. It can only ever be blank today. |
| Change any other metadata (registration status) | **YES** — a dedicated 3-state dropdown: "هنوز باز نشده" (not yet open) / "باز است" (open) / "بسته شده" (closed), mapped to `registration_status` |
| Control homepage appearance | **NO manual control.** The homepage (`pages/index.js`) always shows the 3 soonest published upcoming events, automatically, sorted by date. There is no "feature this event" toggle and no way to exclude a specific upcoming event from the homepage while still publishing it to `/veranstaltungen`. |
| Control ordering on `/veranstaltungen` | **NO manual control.** Upcoming events are always sorted soonest-first, past events always most-recent-first (`pages/veranstaltungen/index.js`). There is no drag-to-reorder or priority field. |
| Control "featured" events | **NO** — no such concept exists in the schema or the UI. |
| Create draft events | **YES** — `status: 'draft'` is the default for a new event and is a selectable option. |
| Archive events | **Partially / not really.** The database schema (`data/schema.sql`) allows a third status, `archived`, but the admin edit form's dropdown only offers two options, `draft` and `published` (`pages/admin/events/[slug].js`). There is no way to set an event to `archived` from the admin UI. |

**Field-by-field detail:**

**FIELD: Title (Persian) — `title_fa`**
Can admin edit? YES. Where stored: Supabase `events.title_fa` (TEXT, required). Public page affected: event detail page, event cards, homepage. Homepage affected: YES (if among the 3 shown). Events listing affected: YES. Limitations: none found.

**FIELD: Title (German) — `title_de`**
Same as above, column `title_de`.

**FIELD: Description (Persian/German) — `description_fa` / `description_de`**
Can admin edit? YES (plain multi-line textarea, no rich text/formatting, no image embedding). Where stored: Supabase `events`. Public page affected: event detail page (full text) and event cards (auto-truncated to 120 characters by `EventCard.js`, with `…` appended — this truncation is a front-end display rule, not stored separately). Limitations: no formatting options at all (no bold, no line-break control beyond literal newlines, no links).

**FIELD: Event date — `event_date`**
Can admin edit? YES (native date picker). Where stored: `events.event_date` (DATE, required). Affects: sorting into "upcoming" vs "past" everywhere (homepage, `/veranstaltungen`, registration eligibility), and the date shown on the event card/detail page.

**FIELD: Event time — `event_time`**
Can admin edit? YES, optional (native time picker). Where stored: `events.event_time` (TIME, nullable). Affects: displayed time on the event card/detail page only; has no effect on date-based sorting.

**FIELD: Location (Persian/German) — `location_fa` / `location_de`**
Can admin edit? YES, optional free text. If left blank, the public pages show a fallback string ("مکان به زودی اعلام می‌شود" / "Ort wird bekannt gegeben") rather than nothing.

**FIELD: Image — `image_url`**
Can admin edit? YES, but only by pasting a URL into a text input (`type="url"`). There is no file upload, no image picker, and no validation that the URL actually points to a reachable image. See §10 for full detail. If left blank, the public event card shows one of five generic stock images from `/public/images/event-*.jpg`, chosen deterministically (a hash of the event's id/slug), not a manually chosen fallback.

**FIELD: Slug**
Can admin edit? NO (see table above). It is set once, silently, on creation, and the field never appears in the admin UI at all — not even as a read-only display.

**FIELD: Category / event type**
Can admin edit? NO (see table above) — no schema column, no form field, even though the display components already look for one.

**FIELD: Status (draft/published/archived) — `status`**
Can admin edit? YES, but only between `draft` and `published` — `archived` exists in the database's `CHECK` constraint but is unreachable from the UI.
Public page affected: `published` is the only status the public site (and its RLS policy) will ever show; `draft` is completely invisible on the public site.

**FIELD: Registration status — `registration_status`**
Can admin edit? YES — three explicit states (`not_open` / `open` / `closed`). This is the field that actually gates the public registration form (`pages/api/registrations/submit.js` rejects a submission server-side unless `registration_status === 'open'`, independent of what the client shows). Where stored: `events.registration_status`. Note: an older boolean column, `registration_open`, still exists in the schema and in the database, but per `PROJECT_STATE.md` and confirmed by grep, nothing in the current code reads it any more — it is dead data, kept only for backward compatibility.

**FIELD: Ordering / featured / homepage inclusion**
Can admin edit? NO — none of these exist as concepts in the schema or the admin UI (see table above).

**FIELD: Admin notes on an event — `admin_notes`**
The `events` table has an `admin_notes` column (private, per the schema's own comment), but **no admin UI field exists to read or write it** — it is defined in the database but completely unused by any page or API route.

**What happens to the public site after an event is changed:** Because `pages/index.js`, `pages/veranstaltungen/index.js`, and `pages/veranstaltungen/[slug].js` all use `getStaticProps` with `revalidate: 3600`, a change made in the admin panel is written to Supabase immediately, but the already-built static HTML for those pages keeps serving the old content until either (a) up to one hour passes and someone happens to request the page again (triggering Next's background regeneration), or (b) the project is redeployed (a fresh `git push` to `main`, which forces a full rebuild). There is no "publish now" or manual revalidation button in the admin panel itself.

---

## 4. Event Registration Management

**Data collected** (from `data/schema.sql`, table `event_registrations`, and `pages/api/registrations/submit.js`):

- First name (required)
- Last name (required)
- Email (required)
- Phone (optional)
- Telegram ID (optional)
- Comment (optional)
- The event it belongs to (`event_id`, foreign key)
- `status` (`new` / `contacted` / `confirmed` / `declined`, default `new`)
- `admin_notes` (private, text)
- `created_at` / `updated_at` (automatic timestamps)

There is **no separate "registration date" column** distinct from `created_at` — the admin UI's "تاریخ ثبت‌نام" (registration date) column reads a field called `registration_date`, which does not appear in `data/schema.sql` at all (see §13 critical finding: this whole feature queries a table, `registrations`, that isn't the one the schema defines).

**What Admin can do (from `pages/admin/registrations.js` and its API routes):**

| Action | Available? | Detail |
|---|---|---|
| View registrations | YES | Loads the entire table at once, no pagination |
| Filter | **NO** | No filter control at all — not by event, not by status |
| Search | **NO** | No search box |
| Sort | YES (client-side only) | A dropdown re-sorts the already-loaded list by date, name, or status; it does not re-query the server |
| Open registration details | Not as a separate view — every registration is already shown expanded, as a card, all at once | — |
| Change registration status | YES | A `<select>` per card, `PATCH /api/admin/registrations/[id]` |
| Delete registration | **NO** — there is no delete button and no `DELETE` handler in `pages/api/admin/registrations/[id].js` (it only implements `PATCH`) |
| Export CSV | YES | "دانلود CSV" button, `GET /api/admin/registrations/export` |
| See which event it belongs to | YES, displayed as `reg.event_title \|\| reg.event` — note this reads a field named `event` (a plain string), not a join to the `events` table by `event_id` |
| See registration date | YES (see caveat above about the actual column name) |
| Modify participant information (name/email/phone/etc.) | **NO** — only `status` and (via the API, though there is no UI control for it) `admin_notes` can be changed; first/last name, email, phone, and Telegram ID are read-only in the admin UI |

**Immutable fields:** first name, last name, email, phone, Telegram ID, comment, the event reference, and the submission date — none of these have an edit control anywhere in the admin UI.
**Changeable fields:** `status` (UI control exists); `admin_notes` (API supports it via `PATCH`, but no UI field exists to set it — so in practice it can currently only be set by someone calling the API directly, not through the admin panel).

**Supabase effect:** a `PATCH` updates the row's `status` (and `admin_notes`, if ever sent) in place; nothing else changes.
**Public-facing effect:** none. The registrant is never shown their own status, and no notification of any kind is sent automatically when status changes — this matches the project's documented "manual confirmation email, sent by the admin outside the website" model (see `00_MASTER_CONTEXT.md` §11–13).
**Notification to participant:** **NO automatic notification of any kind** — confirmed by reading every relevant file; there is no email-sending code, API key, or service anywhere in the repository (no SendGrid/Resend/SMTP/Brevo integration exists). This is consistent with the project's own stated scope (`00_MASTER_CONTEXT.md`: "There is NO automatic confirmation email").

---

## 5. Membership Management

**Data collected** (from `data/schema.sql`, table `membership_applications`, and `pages/api/memberships/submit.js`):

- First name (required)
- Last name (required)
- Email (required, unique across the whole table — a person can only apply once, ever, with the same email)
- Phone (optional)
- Telegram ID (optional)
- Additional information (optional free text)
- `status` (`new` / `contacted` / `accepted` / `declined`, default `new`)
- `admin_notes` (private)
- `created_at` / `updated_at`

**What Admin can do (from `pages/admin/memberships.js`):**

| Action | Available? | Detail |
|---|---|---|
| View | YES | Full list, no pagination |
| Open details | Cards are already expanded | — |
| Approve / reject | YES, via status dropdown (`new`/`contacted`/`accepted`/`declined`) | `PATCH /api/admin/memberships/[id]` |
| Change status | YES | Same as above |
| Delete | **NO** — no delete button, and `pages/api/admin/memberships/[id].js` only implements `PATCH` |
| Export | YES | CSV, `GET /api/admin/memberships/export` |
| Edit applicant information | **NO** — name/email/phone/Telegram/additional info are read-only |
| Filter | **NO** | |
| Search | **NO** | |
| Sort | **NO** — unlike the Registrations page, Memberships has no sort control at all; the list is always in whatever order the API returns it (`created_at` descending, per the query) |

**Per-action effect:**
- **Database effect:** a `PATCH` updates only `status` (and, via the API only, `admin_notes`, again with no UI field to set it).
- **Public website effect:** none.
- **Applicant notification:** **NO automatic email is sent** on status change — same conclusion as §4, verified by the absence of any email-sending code in the repository. The project's own documentation (`00_MASTER_CONTEXT.md` §15) confirms this is intentional: the admin is expected to contact the applicant manually, by email, outside the website.

---

## 6. Content Management — What `/admin/content` Actually Controls

This is the most consequential finding in the audit, so it is laid out in full.

**What the page's form contains** (`pages/admin/content.js`): two sections, "صفحه خانگی" (Homepage) and "درباره ما" (About), with six text inputs in total:

- `homepage_hero_title_fa`, `homepage_hero_subtitle_fa`, `homepage_hero_title_de`, `homepage_hero_subtitle_de`
- `about_intro_fa`, `about_intro_de`

**What happens when the admin clicks Save:** `POST /api/admin/content` runs, and `pages/api/admin/content/index.js` writes those six values into a table called `content` in Supabase (there is exactly one row, updated in place — confirmed by reading the handler's insert-or-update logic). This part **does work** as a database operation: git history shows a dedicated commit, `c9bdcb3 Fix: Replace in-memory content storage with Supabase database persistence`, so this used to be an in-memory-only fake and was later wired to a real table.

**What actually renders on the public homepage and About page:** I searched the entire codebase for every one of those six field names, and separately for any reference to `from('content')` or `/api/admin/content`, outside of the admin page and its own API route. There were **zero matches**. Specifically:

- The homepage hero title is hardcoded directly in JSX: `pages/index.js` — `{currentLang === 'fa' ? 'دیدار اشتوتگارت' : 'DIDAR Stuttgart'}`. It does not read `homepage_hero_title_fa`/`_de` from anywhere, and does not even use the matching translation key that already exists in `lib/i18n.js` (`home.brand_name`, itself also unused).
- The homepage hero tagline and description come from `lib/i18n.js`'s `translations` object (`home.hero_tagline`, `home.hero_description`) — hardcoded source-file constants, not database values, and not the same fields as the admin form's "subtitle" at all.
- `pages/ueber-uns.js` (the About page) has **no data-fetching function whatsoever** (no `getStaticProps`, no `getServerSideProps`) — every string on the page, including the block that corresponds conceptually to "about intro," is written directly in the JSX as a hardcoded Persian/German conditional.

**Conclusion:** the Content admin page is fully functional as a form that writes to a database table, but that table is **never read by any part of the live website**. An admin who changes the homepage hero title or the About text in `/admin/content`, clicks Save, and sees "تغییرات با موفقیت ذخیره شدند" (changes saved successfully), will see **no change at all** on the public site, no matter how long they wait or how many times they redeploy. This is not a caching delay (unlike the event `revalidate: 3600` behavior in §3) — the data path required to show it does not exist.

**Content inventory, using the requested categories:**

| Content | Current value / location | Admin-editable? | Language | Where it appears publicly | Database/storage | Dynamic or hardcoded? | Does changing it affect the site? |
|---|---|---|---|---|---|---|---|
| Homepage hero title (form fields) | Saved in Supabase `content` table | Form says YES | FA + DE | Nowhere — not read | Supabase `content` | Stored dynamically, but unused | **NO — disconnected** |
| Homepage hero title (actual displayed text) | Hardcoded string in `pages/index.js` | NO | FA + DE | Homepage hero | Source code | Hardcoded | Requires a code change + redeploy |
| Homepage hero tagline/description (actual displayed text) | `lib/i18n.js` translation keys `home.hero_tagline` / `home.hero_description` | NO | FA + DE | Homepage hero | Source code | Hardcoded | Requires a code change + redeploy |
| About intro (form fields) | Saved in Supabase `content` table | Form says YES | FA + DE | Nowhere — not read | Supabase `content` | Stored dynamically, but unused | **NO — disconnected** |
| About page text (actual displayed text) | Hardcoded JSX in `pages/ueber-uns.js` | NO | FA + DE | `/ueber-uns` | Source code | Hardcoded | Requires a code change + redeploy |
| Membership page text | Hardcoded JSX in `pages/mitglied-werden.js` | NO | FA + DE | `/mitglied-werden` | Source code | Hardcoded | Requires a code change + redeploy |
| Contact page text | Hardcoded JSX in `pages/kontakt.js` | NO | FA + DE | `/kontakt` | Source code | Hardcoded | Requires a code change + redeploy |
| Impressum / Datenschutz full text | Hardcoded JSX in `pages/impressum.js`, `pages/datenschutz.js` | NO | FA + DE | `/impressum`, `/datenschutz` | Source code | Hardcoded | Requires a code change + redeploy |
| Navigation labels, form labels, status labels, buttons, etc. | `lib/i18n.js` translations object | NO | FA + DE | Site-wide | Source code | Hardcoded | Requires a code change + redeploy |
| Events (title/description/date/location/etc.) | Supabase `events` table | **YES**, fully | FA + DE | Homepage, `/veranstaltungen`, event detail | Supabase | Dynamic | YES (subject to the up-to-1-hour ISR cache, §3) |
| Contact email shown on site | Hardcoded literal string `info@didar-stuttgart.com`, repeated separately in `components/Footer.js`, `pages/kontakt.js`, `pages/impressum.js`, `pages/datenschutz.js` | NO | Shown in both, same address | Footer, Kontakt, Impressum, Datenschutz | Source code (repeated 4 times, not a shared constant) | Hardcoded | Requires editing 4 files + redeploy |
| Social links (Instagram/Telegram URLs) | Hardcoded in `components/SocialIcons.js`'s `SOCIAL_LINKS` constant | NO | Language-neutral URLs | Header, Footer, mobile menu, Kontakt page | Source code | Hardcoded | Requires a code change + redeploy (see §7 — this is exactly what the Settings page's form fields *appear* to control, but don't) |
| Logo, favicon, hero banner, event fallback images, about/membership/contact images | Static files in `public/images/` | NO | — | Site-wide | Files committed to the git repository | Hardcoded (a file, not a database value) | Requires replacing the file + redeploy |

Answering the exact categories requested: (A) content editable from Admin **and actually live**: only Events. (B) Content that exists but is not editable from Admin: all page copy on Home/About/Membership/Contact/Impressum/Datenschutz, navigation and UI labels, contact email, social links, all images. (C) Hardcoded in source code: everything in category B. (D) Stored in Supabase but effectively orphaned: the `content` table's six fields. (E) Configuration/environment-variable-driven content: none — no public-facing text is sourced from environment variables (env vars are used only for credentials and rate-limit numbers, see §12). (F) Looks editable conceptually but currently is not: **the entire Content admin page**, and (see §7) **the entire Settings admin page**.

---

## 7. Settings — What `/admin/settings` Actually Controls

**Fields in the form** (`pages/admin/settings.js`): contact email, Telegram channel, Telegram contact, Instagram URL.

**Where they are stored:** `pages/api/admin/settings/index.js` keeps them in a plain JavaScript variable declared at the top of the file:

```js
let settingsStore = {
  contact_email: 'info@didar.de',
  telegram_channel: '@didar_channel',
  telegram_contact: '@didar_contact',
  instagram_url: 'https://instagram.com/didar',
};
```

This is **not a database** — it is server memory. Two consequences:

1. **It does not persist reliably in production.** Vercel runs API routes as serverless functions; the module-level variable only survives for as long as one particular function instance stays "warm," and is wiped on every cold start, redeploy, or when Vercel spins up a separate instance to handle concurrent traffic. A saved setting can appear to work in one request and silently revert to the hardcoded defaults shown above on the next.
2. **Even if it persisted perfectly, nothing on the public site reads it.** As shown by the grep in §6's methodology (repeated here for these exact field names — `contact_email`, `telegram_channel`, `telegram_contact`, `instagram_url`, `SOCIAL_LINKS` — searched across every `pages/` and `components/` file except the admin settings files themselves), the only files that reference `SOCIAL_LINKS` are `components/Header.js`, `components/Footer.js`, and `pages/kontakt.js`, and all three import it from `components/SocialIcons.js`'s **hardcoded** constant, not from the settings API. The contact email shown on the site is a separate hardcoded literal, repeated in four files, and does not reference `settingsStore.contact_email` at all.

| Setting | Controls (in theory) | Stored | Affects public users? | Affects admin only? | Requires redeployment to change? | Functional? |
|---|---|---|---|---|---|---|
| Contact email | The email shown to visitors | In-memory variable, not a database | Would, if wired up | — | No (if it worked) | **NO — UI only, not connected to any page, and not durably stored** |
| Telegram channel | Presumably the channel link shown site-wide | Same | Would, if wired up | — | No (if it worked) | **NO** |
| Telegram contact | A second, separate Telegram link (per `00_MASTER_CONTEXT.md` §19, channel and personal contact can be different) | Same | Would, if wired up | — | No (if it worked) | **NO** |
| Instagram URL | The Instagram link shown site-wide | Same | Would, if wired up | — | No (if it worked) | **NO** |

**Important website settings that currently cannot be changed from Admin at all** (no form field exists for these anywhere): site name/branding text, default OG/social-share image, SEO meta description per page, the number of events shown on the homepage (hardcoded to 3 in `pages/index.js`, see §3), the ISR revalidation interval (hardcoded to `3600` seconds in three files), language switcher default, footer copyright text (uses the current year automatically, cannot be overridden), and any privacy/retention-period text inside Datenschutz (that page's entire body is hardcoded prose, not settings-driven).

---

## 8. Homepage Control

| Homepage element | Admin editable? | How? | Where stored? | If not editable, where is it hardcoded? |
|---|---|---|---|---|
| Hero background image | NO | — | — | `pages/index.js`, `<img src="/images/hero-banner.jpg">` |
| Hero title ("دیدار اشتوتگارت" / "DIDAR Stuttgart") | NO (despite a matching-looking field existing in `/admin/content`, see §6) | — | — | `pages/index.js`, inline JSX conditional |
| Hero tagline & description | NO | — | — | `lib/i18n.js` (`home.hero_tagline`, `home.hero_description`) |
| Hero CTA button labels/links | NO | — | — | `pages/index.js` (labels from `lib/i18n.js`; links hardcoded to `/veranstaltungen` and `/ueber-uns`) |
| Upcoming events section (which events, how many, order) | Indirectly — the *events themselves* are editable (§3), but *not* how many appear (always 3) or which ones are chosen (always the 3 soonest published) | Edit/publish an event | Supabase `events` | Count and selection logic: `pages/index.js` (`featuredEvents.slice(0, 3)`) |
| "About DIDAR" teaser card (image, heading, text, button) | NO | — | — | `pages/index.js`, image path + `lib/i18n.js` text keys, all inline |
| "Join DIDAR" / membership teaser card | NO | — | — | Same as above |
| Footer content (org description, social links, contact link, legal links, copyright) | NO | — | — | `components/Footer.js`, all inline; social links via `components/SocialIcons.js` |
| Header/navigation labels | NO | — | — | `lib/i18n.js` nav.* keys |
| Header logo | NO | — | — | `components/Header.js`, `/images/logo-header.png` / `.webp` |
| Language switcher (FA/DE labels, default language) | NO | — | — | `lib/i18n.js` (`languages` object), `next.config.js` (`defaultLocale: 'fa'`) |
| Images (any homepage image) | NO — no upload/replace mechanism exists anywhere in admin | — | — | Static files in `public/images/`, referenced by path in the relevant component |

None of the homepage's non-event content is admin-editable today, despite the Content admin page's form fields suggesting two of these rows (hero title/subtitle) should be.

---

## 9. Public Pages vs. Admin Control — Full Matrix

**PAGE: Homepage (`/`)**

| Element | Admin | Code | Database | Env | Notes |
|---|---|---|---|---|---|
| Hero image/title/tagline/CTAs | | ✕ | | | Hardcoded (§8) |
| Upcoming events shown | (partial) | ✕ (count/selection) | ✕ (event data) | | Events editable; count/selection rule is not |
| About/Membership teaser cards | | ✕ | | | Hardcoded |
| Footer, header, nav | | ✕ | | | Hardcoded |

**PAGE: `/veranstaltungen`**

| Element | Admin | Code | Database | Env | Notes |
|---|---|---|---|---|---|
| Event list content (all fields in §3) | ✕ | | ✕ | | Fully editable via `/admin/events` |
| Sort order (upcoming soonest-first, past most-recent-first) | | ✕ | | | Fixed logic, not configurable |
| Page headings/labels | | ✕ | | | `lib/i18n.js` |

**PAGE: `/veranstaltungen/[slug]`**

| Element | Admin | Code | Database | Env | Notes |
|---|---|---|---|---|---|
| Event fields, registration status | ✕ | | ✕ | | Editable via `/admin/events` |
| Registration form fields/labels/validation messages | | ✕ | | | Hardcoded (`lib/i18n.js`, `lib/validation.js`) |
| Privacy notice text | | ✕ | | | Hardcoded JSX |

**PAGE: `/ueber-uns`**

| Element | Admin | Code | Database | Env | Notes |
|---|---|---|---|---|---|
| All body text and images | (looks like it should be, via `/admin/content`) | ✕ | (orphaned `content` row exists but is unused) | | See §6 — this is the clearest case of "looks editable, isn't" |

**PAGE: `/mitglied-werden`**

| Element | Admin | Code | Database | Env | Notes |
|---|---|---|---|---|---|
| Intro/body text | | ✕ | | | Hardcoded |
| Form fields/labels/validation | | ✕ | | | Hardcoded |
| Submitted applications | ✕ (view/status only) | | ✕ | | `/admin/memberships` |

**PAGE: `/kontakt`**

| Element | Admin | Code | Database | Env | Notes |
|---|---|---|---|---|---|
| Intro text, form labels | | ✕ | | | Hardcoded |
| Contact email shown | (looks like it should be, via `/admin/settings`) | ✕ | | | See §7 — disconnected |
| Social links shown | (looks like it should be, via `/admin/settings`) | ✕ | | | See §7 — disconnected |
| Submitted messages | **NOT viewable anywhere in admin** | | ✕ (Supabase `contact_submissions`) | | See §15 — a real limitation |

**PAGE: `/impressum`**

| Element | Admin | Code | Database | Env | Notes |
|---|---|---|---|---|---|
| Entire page (legal text, address, names, phone) | | ✕ | | | 100% hardcoded, both languages |

**PAGE: `/datenschutz`**

| Element | Admin | Code | Database | Env | Notes |
|---|---|---|---|---|---|
| Entire page (legal text) | | ✕ | | | 100% hardcoded, both languages |

---

## 10. Images / Media

- **Where images are stored:** two places, never mixed. (1) Static site assets (logo, favicons, hero banner, generic event fallback photos, about/membership/contact photos) live in `public/images/` and are part of the git repository — they ship with every deployment. (2) A per-event photo can be set via the `events.image_url` text column in Supabase, which is expected to be a URL to an image hosted *somewhere else* (there is no evidence of Supabase Storage being used anywhere in the codebase — no `@supabase/storage-js` calls, no `storage.from(...)` calls found anywhere).
- **Can Admin upload images?** **NO.** There is no file input, no drag-and-drop area, and no upload API route anywhere in the codebase.
- **Can Admin replace an image?** Only for events, and only by pasting a different URL into the `image_url` text field. For every other image on the site (logo, hero banner, about/membership/contact photos), replacing it means replacing the actual file in `public/images/` in the git repository and redeploying — there is no admin-side path at all.
- **Can Admin delete an image?** No delete function exists for any image, anywhere.
- **Is there any image validation?** No — the `image_url` field is a plain `<input type="url">` with only the browser's native URL-format check; there is no check that the URL resolves, that it's actually an image, or any size/dimension constraint. If the URL is broken, `components/EventCard.js` has an `onError` fallback that swaps in one of the five generic stock photos — but only on the event card, not on the event detail page's hero image.
- **Is there a media library?** No.
- **Does changing an image require redeployment?** For an event photo (URL-based): no, it's an immediate Supabase update, subject to the same up-to-1-hour ISR cache as other event fields (§3). For every other site image: yes, replacing the file and redeploying is the only path.
- **Current limitations, summarized:** no upload capability at all; event images depend on the admin having somewhere else to host the file and get a direct URL for it; no way to manage, browse, or reuse previously-used images; no automatic optimization/resizing (images are used with plain `<img>` tags, not Next.js's `<Image>` component, so no built-in responsive-image handling is applied to any image on the site, admin-controlled or not).

---

## 11. Bilingual Content

- **Which content is bilingual:** all Event fields (`title_fa`/`title_de`, `description_fa`/`description_de`, `location_fa`/`location_de`) and all UI strings (everything sourced through `lib/i18n.js`'s `t()` function — navigation, buttons, form labels, status messages, validation messages).
- **Can Admin edit both languages?** For Events: **YES**, both language fields sit side by side in the same edit form and both are required for title (description/location are optional in both). For everything else (UI labels, all static page text): **NO admin control over either language** — both FA and DE text for pages/labels are hardcoded in source files (`lib/i18n.js` for shared strings, individual `pages/*.js` files for page-specific prose).
- **Where are translations stored?** Two different places, and this is itself worth flagging: event content lives in Supabase, two parallel columns per field. Everything else lives in one JavaScript object (`translations` in `lib/i18n.js`) with a `{ fa: '...', de: '...' }` shape per key, hardcoded in the repository.
- **Is the Admin Panel itself bilingual?** **NO — the entire admin UI is Persian-only.** Every label in every admin page (`پنل مدیریت`, `رویدادها`, `ثبت‌نام‌ها`, etc.) is a literal Persian string; there is no language switcher inside `/admin/*`, and no German admin UI exists at all. (Field labels for entering the German half of bilingual content are in German — e.g., "Titel (Deutsch)" — but the surrounding chrome, buttons, and navigation are Persian-only.)
- **Does changing Persian content affect German content?** No — they are fully independent fields/keys; changing one never touches the other.
- **Are missing translations possible?** Yes, in two different ways: (1) for events, `title_de`/`title_fa` are required by the form and the database's `NOT NULL` constraint, but `description_de`/`description_fa` and `location_de`/`location_fa` are optional — an event can legitimately have a Persian description and no German one, or vice versa; (2) for UI strings, `lib/i18n.js`'s `t()` function falls back from the requested language to the default language (`fa`) and finally to the raw key name if neither exists — so a missing translation shows Persian text on a German page rather than breaking, or (in the worst case) shows a raw key like `home.title` if even the Persian fallback is missing.

---

## 12. Authentication & Security

**Login mechanism:** a single password, no username. The password itself is never stored — only its hash, in the `ADMIN_PASSWORD_HASH` environment variable, generated ahead of time by running `scripts/setup-admin.js` locally.

**Password hashing:** PBKDF2-SHA256, 10,000 iterations, 64-byte output, random 16-byte salt per hash (`lib/admin-auth.js`, `hashPassword()`/`verifyPassword()`). The code's own comment notes this is "acceptable for a single admin account setup where the password is set once," not a general-purpose user-auth scheme.

**Password strength requirement (enforced only by `scripts/setup-admin.js`, at hash-generation time — not enforced anywhere at login time, since login just compares against whatever hash was set):** minimum 12 characters, at least one lowercase, one uppercase, one digit, and one symbol from `!@#$%^&*`.

**Session mechanism:** on successful login, `pages/api/auth/login.js` generates a 32-byte random hex token (`generateSessionToken()` in `lib/admin-auth.js`) and calls `createSession(token)` in `lib/session-store.js`, which stores it in a plain in-memory JavaScript `Map`, keyed by the token, with a 24-hour expiry timestamp. It is then set as a cookie.

**Cookie behavior:** `Set-Cookie: session_token=<token>; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax` (from `pages/api/auth/login.js`). `HttpOnly` means client-side JavaScript cannot read it (mitigates XSS token theft); `SameSite=Lax` gives baseline CSRF protection. **No `Secure` flag is set**, meaning the cookie is technically not restricted to being sent only over HTTPS at the cookie-attribute level — in practice Vercel serves everything over HTTPS, so this has limited real-world impact for this deployment, but it means the cookie's own attributes don't enforce it.

**Session expiration:** 24 hours from creation, checked on every request to `validateSession()`. There is no "remember me" or extended-session option, and no idle-timeout separate from the fixed 24-hour window.

**Protected routes:** enforced in two independent places that must agree — this is where the historical bug lived (see below). Every `pages/api/admin/*` route calls `requireAdminSession(req, res)` from `lib/api-middleware.js` at the very top of its handler, before doing anything else, and returns `401 Unauthorized` if it fails. The admin *pages* themselves (`pages/admin/*.js`) are ordinary React pages with no server-side gate at all — they render a loading state, then call `POST /api/auth/verify` client-side in a `useEffect`, and redirect to `/admin/login` if that fails. This means the page's HTML/JS shell is not actually protected from being downloaded by an unauthenticated visitor (there's nothing secret in it), but no admin *data* can be fetched without a valid session, since every data-bearing API call is separately guarded.

**Unauthorized behavior:** admin pages redirect to `/admin/login`; admin API routes return HTTP 401 with a JSON error body.

**Logout behavior:** `POST /api/auth/logout` deletes the token from the session store and clears the cookie (`Max-Age=0`).

**A previously-documented bug, now fixed in the code as read:** `ARCHITECTURE.md` and `PROJECT_STATE.md` (Phase 12) describe a real bug that existed at one point — `lib/session-store.js` and `lib/admin-auth.js` each used to keep their *own separate* in-memory session list, both confusingly named `activeSessions`. Login wrote to one; every admin data API route checked the other; so logging in appeared to succeed but every subsequent admin data request returned 401. **As the code exists today, this has been fixed**: `lib/admin-auth.js` no longer contains any session-tracking code at all (confirmed by reading the file — only password-hashing functions remain, with a comment documenting the removal), and `lib/api-middleware.js` imports `validateSession` from `lib/session-store.js`, the same store used by login/logout/verify. `lib/middleware.js`'s `requireAdmin()` was also updated to point at the correct store, but remains unused by any route (dead code).

**Server-side vs. client-side protection:** all real protection (password check, session validation) happens server-side, inside API routes. Client-side checks (the `useEffect` calling `/api/auth/verify`) exist only to redirect the browser to the login screen for UX purposes — they provide no security on their own.

**Supabase credentials involved:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (both meant to be public, limited by Row Level Security — see §13), and `SUPABASE_SECRET_KEY` (must stay server-side only; used exclusively inside `createAdminClient()`, which every admin API route calls after its session check passes). No secret values were read or are reproduced in this report.

**Environment variables involved (names only, no values read):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD_HASH`, `RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW_MS`, `NODE_ENV`, `VERCEL_ENV`. `.gitignore` correctly excludes `.env`, `.env.local`, and related files; `git log` shows no evidence of `.env.local` or the secret key ever being committed.

**A structural point worth naming plainly:** because sessions live only in server memory, they do not survive a serverless cold start, a redeploy, or (in principle) being routed to a different concurrent instance of the function under load. In practice, for a single low-traffic admin, this mostly shows up as "I have to log in again after a while," which the project's own documentation treats as an accepted, deliberate trade-off rather than a bug — but a reviewer should know this is a genuine architectural property, not an edge case: **it's the same class of problem, in miniature, as the Settings page's in-memory storage in §7.**

---

## 13. Database / Supabase Mapping

**Tables actually defined in the repository's schema** (`data/schema.sql`): `events`, `event_registrations`, `membership_applications`, `contact_submissions`. A fifth table, `content`, is defined separately in `Claude outputs/content-table.sql`.

**⚠️ Critical finding — table name mismatch.** The admin API routes for registrations, memberships, and dashboard stats query tables by these names:

| File | Table name used in code | Table name actually created by the schema |
|---|---|---|
| `pages/api/admin/registrations/index.js`, `[id].js`, `export.js` | `registrations` | `event_registrations` |
| `pages/api/admin/memberships/index.js`, `[id].js`, `export.js` | `memberships` | `membership_applications` |
| `pages/api/admin/stats.js` | `registrations`, `memberships` | (same as above) |

By contrast, the two public submission endpoints use the **correct** names that match the schema: `pages/api/registrations/submit.js` inserts into `event_registrations`, and `pages/api/memberships/submit.js` inserts into `membership_applications`. So the write path (public forms → Supabase) and the read/manage path (admin panel → Supabase) are pointed at **different table names** for these two features. I searched every `.sql` file in the repository (`data/schema.sql` and everything in `Claude outputs/`) for a table or view named `registrations` or `memberships`, and found none.

**What this means in practice:** if the live Supabase project's schema matches what's committed to the repository (the normal expectation, but not something I could check directly — **please verify by opening the Supabase Table Editor and confirming the exact table names**), then `/admin/registrations`, `/admin/memberships`, and the three dashboard stat counters would each fail against the database (a "relation does not exist" error from Postgres, surfaced as a 500 response) rather than showing real data. It's also possible the live database has extra tables or views named exactly `registrations`/`memberships` that were created by hand outside of any committed SQL file — this audit cannot rule that out without direct database access, which is why it's flagged rather than stated as a certainty. Either way, this is the single most important thing to check before doing anything else with this Admin Panel, since it directly affects whether two of its five sections work at all.

**Full table mapping** (as defined in `data/schema.sql` and `Claude outputs/content-table.sql`):

| Table | Written by | Read by | Key fields | Public impact |
|---|---|---|---|---|
| `events` | `/admin/events` (create/edit/delete) | Homepage, `/veranstaltungen`, event detail, `/admin/events`, `/admin/stats` (upcoming count) | `title_fa/de`, `description_fa/de`, `slug`, `event_date`, `event_time`, `location_fa/de`, `status`, `registration_status`, `registration_open` (deprecated), `image_url`, `admin_notes` (unused) | Direct — this is the one fully-working admin-to-public pipeline |
| `event_registrations` | Public registration form (`/api/registrations/submit`) | **Intended to be** `/admin/registrations`, but that code queries `registrations` instead — see critical finding above | `event_id`, `first_name`, `last_name`, `email`, `phone`, `telegram_id`, `comment`, `status`, `admin_notes` | None (admin/internal data only) |
| `membership_applications` | Public membership form (`/api/memberships/submit`) | **Intended to be** `/admin/memberships`, but that code queries `memberships` instead — see critical finding above | `first_name`, `last_name`, `email` (unique), `phone`, `telegram_id`, `additional_info`, `status`, `admin_notes` | None |
| `contact_submissions` | Public contact form (`/api/contact/submit`) | **Nothing** — no admin page or API route reads this table at all (see §15) | `name`, `email`, `message`, `read` (boolean, never set to true by any code) | None; messages can currently only be viewed directly in the Supabase dashboard, outside this website's admin panel entirely |
| `content` | `/admin/content` | Nothing on the public site (see §6) | `homepage_hero_title_fa/de`, `homepage_hero_subtitle_fa/de`, `about_intro_fa/de` | None |

**Row Level Security (RLS), as defined in `data/schema.sql`:** `events` allows public `SELECT` only where `status = 'published'`. `event_registrations`, `membership_applications`, and `contact_submissions` each allow public `INSERT` only — no public `SELECT`/`UPDATE`/`DELETE` at all, enforced at the database level regardless of application code. All admin operations bypass RLS entirely by using the secret-key client (`createAdminClient()`), which is only ever invoked after `requireAdminSession()` passes.

**Relationships:** `event_registrations.event_id` is a foreign key to `events.id` with `ON DELETE CASCADE` — **deleting an event in the admin panel permanently deletes every registration for that event as well**, with no warning about this in the delete confirmation dialog (`pages/admin/events/index.js`'s `confirm('آیا از حذف این رویداد اطمینان دارید؟')` only asks about the event itself). `membership_applications` and `contact_submissions` have no foreign-key relationships to any other table.

---

## 14. API Inventory

| Endpoint | Method | Purpose | Auth required? | Reads? | Creates? | Updates? | Deletes? | Table/storage | Public impact |
|---|---|---|---|---|---|---|---|---|---|
| `/api/auth/login` | POST | Password → session cookie | No (it *is* the login) | — | Session (in-memory) | — | — | `lib/session-store.js` | None |
| `/api/auth/logout` | POST | Clear session | No (reads its own cookie) | — | — | — | Session | `lib/session-store.js` | None |
| `/api/auth/verify` | POST | Check session validity | Reads cookie | Session | — | — | — | `lib/session-store.js` | None |
| `/api/admin/stats` | GET | Dashboard counters | YES | events, `registrations`*, `memberships`* | — | — | — | Supabase | None (*see §13 critical finding) |
| `/api/admin/events` | GET | List all events | YES | events | — | — | — | Supabase | None |
| `/api/admin/events` | POST | Create event | YES | — | events | — | — | Supabase | YES, once published |
| `/api/admin/events/[slug]` | GET | Get one event | YES | events | — | — | — | Supabase | None |
| `/api/admin/events/[slug]` | PATCH | Update event | YES | — | — | events | — | Supabase | YES |
| `/api/admin/events/[slug]` | DELETE | Delete event | YES | — | — | — | events (+ cascades to `event_registrations`) | Supabase | YES |
| `/api/admin/registrations` | GET | List registrations | YES | `registrations`* | — | — | — | Supabase | None (*see §13) |
| `/api/admin/registrations/[id]` | PATCH | Update status/notes | YES | — | — | `registrations`* | — | Supabase | None (*see §13) |
| `/api/admin/registrations/export` | GET | CSV export | YES | `registrations`* | — | — | — | Supabase | None (*see §13) |
| `/api/admin/memberships` | GET | List applications | YES | `memberships`* | — | — | — | Supabase | None (*see §13) |
| `/api/admin/memberships/[id]` | PATCH | Update status/notes | YES | — | — | `memberships`* | — | Supabase | None (*see §13) |
| `/api/admin/memberships/export` | GET | CSV export | YES | `memberships`* | — | — | — | Supabase | None (*see §13) |
| `/api/admin/content` | GET | Load content row | YES | `content` | — | — | — | Supabase | None |
| `/api/admin/content` | POST | Save content row | YES | — | `content` (first save) | `content` (later saves) | — | Supabase | **None — see §6** |
| `/api/admin/settings` | GET | Load settings | YES | in-memory object | — | — | — | Server memory | None |
| `/api/admin/settings` | POST | Save settings | YES | — | — | in-memory object | — | Server memory | **None — see §7** |
| `/api/events` | GET | Public event list (unused by any current page — see below) | No | events (published only) | — | — | — | Supabase | Read-only, public |
| `/api/health` | GET | Deployment/Supabase connectivity check | No | events (count only) | — | — | — | Supabase | None |
| `/api/registrations/submit` | POST | Public event registration | No (rate-limited) | events (to check it's published & open) | event_registrations | — | — | Supabase | Creates a registration |
| `/api/memberships/submit` | POST | Public membership application | No (rate-limited) | — | membership_applications | — | — | Supabase | Creates an application |
| `/api/contact/submit` | POST | Public contact message | No (rate-limited) | — | contact_submissions | — | — | Supabase | Creates a message |

**APIs that exist but are currently unused:** `GET /api/events` is a fully-built public endpoint (with its own `status=upcoming|past|all` query parameter and 5-minute cache header) that no current page actually calls — the public pages fetch event data directly inside `getStaticProps` via `createServerClient()` instead, bypassing this API entirely. It may have been used in an earlier phase and left in place.

---

## 15. What The Admin Cannot Do — Current Limitations

Everything below was verified against the actual implementation, not assumed:

- **View or respond to contact form messages.** `contact_submissions` is written to by `/api/contact/submit` but there is no admin page, no API route, and no CSV export for this table anywhere in the codebase. The only way to see a contact message today is to open the Supabase dashboard directly.
- **Edit homepage text, hero image, or About page text**, despite a Content admin page that looks like it should do exactly this (§6).
- **Edit the contact email or social links shown on the site**, despite a Settings admin page that looks like it should do exactly this (§7).
- **Upload, replace, or manage images** for anything other than pasting a raw URL into an event's `image_url` field (§10).
- **Set an event's category/type**, even though the display components (`EventCard.js`, the event detail page) already contain code to show one if it existed.
- **Reorder events, feature specific events, or control how many events show on the homepage** (fixed at 3, soonest-first).
- **Archive an event** through the UI (the database supports a third status, `archived`, but the dropdown only offers two).
- **Delete a registration or a membership application** — only status changes are possible.
- **Edit a registrant's or applicant's submitted information** (name, email, phone, etc.) if they made a typo.
- **Filter or search** registrations or memberships by event, status, name, or date.
- **See a slug field** for an event, or set/change it after creation.
- **Send any kind of email** from within the admin panel — confirmation, rejection, or otherwise (by design, per the project's own documented scope).
- **See or manage admin users, roles, or permissions** — there is exactly one password for one implicit admin identity; nothing else exists.
- **See an audit log** of who changed what and when (moot today since there's only one admin, but worth naming).
- **Force an immediate content refresh** on the public site — the closest thing is waiting for the 1-hour ISR window or triggering a redeploy.

---

## 16. Hardcoded Content Inventory (by page)

**Homepage (`pages/index.js`):**
- Hero title (both languages) — inline JSX conditional, near the top of the `Home` component.
- Hero tagline/description — `lib/i18n.js`, keys `home.hero_tagline`, `home.hero_description`.
- "About DIDAR" and "Join DIDAR" card headings/body text — `lib/i18n.js`, keys `home.about_section`, `home.about_text`, `home.membership_section`, `home.membership_text`.
- Should logically be admin-editable? Yes — this is exactly what the existing (but disconnected) Content admin page's fields were clearly meant to control. Current limitation: no data path from that table to this page (§6).

**About page (`pages/ueber-uns.js`):**
- Every heading and paragraph, both languages, written directly as JSX — including the section conceptually equivalent to "about_intro." No `getStaticProps` at all.
- Should logically be admin-editable? Yes (again, the Content page's `about_intro_fa/de` fields exist for this purpose). Current limitation: same disconnect as above.

**Membership page (`pages/mitglied-werden.js`):**
- Intro paragraph (both languages) — inline JSX.
- Form field labels — `lib/i18n.js`.
- Response-time note ("۱۴ روز" / "14 Tage") — `lib/i18n.js`, key `membership.response_time`.
- Should logically be admin-editable? The response-time figure, at minimum, since `00_MASTER_CONTEXT.md` explicitly flags this as something the owner should be able to confirm/change. Current limitation: no admin field exists for it at all.

**Contact page (`pages/kontakt.js`):**
- Intro text — `lib/i18n.js`.
- Contact email — hardcoded literal, `info@didar-stuttgart.com`.
- Social links — `components/SocialIcons.js`.
- Should logically be admin-editable? Yes — this is precisely what the Settings page's fields were meant to control. Current limitation: disconnect described in §7.

**Impressum (`pages/impressum.js`) and Datenschutz (`pages/datenschutz.js`):**
- Entire body text, both languages, fully hardcoded, including the organization's legal name, address, phone number, and the names of the two responsible people (Danial Haghgoo, Sayedali Yarahmadian).
- Should logically be admin-editable? These are legally sensitive texts that the project's own rules say must never be auto-generated or guessed (`00_MASTER_CONTEXT.md` §25) — keeping them as reviewed, hardcoded source text is arguably the *right* call, not a gap, though it does mean any future correction requires a code change.

**Header/Footer (`components/Header.js`, `components/Footer.js`):**
- All navigation labels, social links, logo, contact email, copyright line — all hardcoded or sourced from `lib/i18n.js`/`SocialIcons.js`.
- Should logically be admin-editable? At minimum the social links and contact email (again, this is what Settings was meant to cover).

---

## 17. Current Admin UX/UI Structure

**Navigation:** no persistent sidebar — each admin page has a simple header bar with a "← بازگشت" (back) link to the previous level and, on the dashboard only, a logout button. Moving between sections happens through the dashboard's 5 navigation cards (`pages/admin/index.js`), each with an emoji icon (📅 👥 🎫 ✏️ ⚙️), a title, and a one-line description.

**Dashboard:** three stat cards (upcoming events, new registrations this week, new memberships this week — subject to the §13 critical finding for the latter two) above the 5 navigation cards.

**Tables/lists:** Events uses an actual HTML `<table>` (columns: title, date, status, registration status, actions). Registrations and Memberships instead use a stacked-card layout, one card per entry, with all fields already visible (no expand/collapse).

**Forms:** plain, single-column, one field per row, native HTML inputs throughout (`text`, `email`, `date`, `time`, `url`, `<select>`, `<textarea>`) — no rich text editor, no custom date-range pickers, no drag-and-drop, no autosave.

**Buttons:** three visual button styles reused throughout (`.primaryButton`, `.editButton`, `.deleteButton` in `styles/admin.module.css`), plus plain unstyled `<button>` elements for CSV downloads.

**Status indicators:** color-coded pill/badge classes exist for event status (`.statusPublished` / `.statusDraft`) and registration status (`.statusOpen` / `.statusClosed`) — text + background color, not icon-based.

**Modals/confirmations:** there is exactly one confirmation dialog anywhere in the admin panel — a plain browser-native `confirm()` popup, used only for deleting an event. Every other destructive-adjacent action (changing a registration/membership status, saving content/settings) has no confirmation step at all.

**Error/success messages:** no toast or banner system — every success or failure is shown via a native browser `alert()` popup (e.g., "رویداد با موفقیت ذخیره شد" / "خطا در ذخیره رویداد"), except the login page, which does show an inline error message div, and the dashboard/list pages, which fail silently to `console.error` if a background fetch fails (the user just sees stale or empty data with no visible error).

**Loading states:** a single plain text string, "درحال بارگذاری..." (loading...), shown full-page while data loads — no skeleton screens or spinners.

**Empty states:** implemented only on the Events list ("هیچ رویدادی وجود ندارد" + a link to create the first one) and Registrations/Memberships lists ("هیچ ثبت‌نامی/درخواست عضویتی وجود ندارد", no further guidance).

**Mobile responsiveness:** `styles/admin.module.css` has exactly one `@media` breakpoint, at 768px, versus the public site's more extensive responsive rules across five separate stylesheets — the admin panel received noticeably less responsive-design attention than the public site.

**Persian/German handling in the admin UI itself:** Persian-only chrome throughout, as detailed in §11; only the bilingual data-entry field *labels* (e.g., "Titel (Deutsch)") appear in German.

**Accessibility:** a direct grep for `aria-` and `role=` attributes anywhere under `pages/admin/` returned **zero matches** — none of the accessibility work visible on the public site (aria-labels, `aria-current`, `aria-expanded`, focus management on the mobile menu, etc., all present in `components/Header.js`) was carried into the admin panel.

**Consistency between pages:** broadly consistent in visual style (same CSS module, same header pattern, same button classes), but inconsistent in interaction pattern — Events uses a table, Registrations/Memberships use cards; Registrations has a sort control that Memberships lacks; only Events has an empty-state call-to-action link.

---

## 18. Admin Workflows (Step by Step, as Implemented)

**A) Create an event**
1. Log in at `/admin/login`.
2. From the dashboard, click "رویدادها" (Events).
3. Click "+ رویداد جدید" (new event) → navigates to `/admin/events/new`.
4. Fill in: Persian title (required), German title (required), date (required), time (optional), location FA/DE (optional), description FA/DE (optional), image URL (optional), registration status (defaults to "not yet open"), status (defaults to "draft").
5. Click "ذخیره رویداد" (save event) → `POST /api/admin/events` → a slug is auto-generated from the Persian title → row inserted into Supabase → redirected back to the events list.
6. If `status` was left as "draft," nothing appears on the public site yet; switch it to "published" (either now or in a later edit) for it to appear, subject to the up-to-1-hour ISR delay (§3) unless a redeploy is triggered.

**B) Edit an event**
1. From `/admin/events`, click "ویرایش" (edit) on the desired row → `/admin/events/[slug]`.
2. The form loads the existing values via `GET /api/admin/events/[slug]`.
3. Change any field, click "ذخیره رویداد" → `PATCH /api/admin/events/[slug]` → redirected back to the list.

**C) View registrations**
1. From the dashboard, click "ثبت‌نام‌ها" (Registrations).
2. The full list loads at once (subject to §13's table-name concern).
3. Optionally re-sort by date/name/status (client-side only, does not refetch).

**D) Export registrations**
1. From `/admin/registrations`, click "⬇️ دانلود CSV".
2. `GET /api/admin/registrations/export` returns a UTF-8 CSV (with a byte-order mark for Excel compatibility) of every registration, regardless of any on-screen sort — the export always contains everything, there is no "export only what's currently filtered/sorted."

**E) Process a membership application**
1. From the dashboard, click "عضویت" (Membership).
2. Read the applicant's details on their card.
3. Change their status via the dropdown (`new` → `contacted`/`accepted`/`declined`) → saved immediately via `PATCH`.
4. Separately, and manually, outside this website entirely: the admin emails the applicant using the official DIDAR email account, since no automated email exists (§5).

**F) Change content**
1. From the dashboard, click "محتوا" (Content).
2. Edit any of the 6 text fields.
3. Click "ذخیره تغییرات" → saved to the Supabase `content` table.
4. **Nothing changes on the public website** (§6) — this step currently has no visible outcome for a site visitor.

**G) Change settings**
1. From the dashboard, click "تنظیمات" (Settings).
2. Edit contact email / Telegram channel / Telegram contact / Instagram URL.
3. Click "ذخیره تغییرات" → saved to a server-memory variable.
4. **Nothing changes on the public website** (§7), and the saved value may not even still be there the next time the page is loaded, depending on server restarts.

---

## 19. Technical Limitations / Risks

**HIGH**
- **Registrations/Memberships/Stats query the wrong table names** (`registrations`/`memberships` in code vs. `event_registrations`/`membership_applications` in the schema) — if the live database matches the committed schema, three admin features are broken outright. **Verify in Supabase before relying on any of these three features.** (§13, §14)
- **Content and Settings admin pages are fully disconnected from the public site** — an admin can spend time editing these, believe they've updated the live site, and be wrong, with no error or warning anywhere in the UI to indicate the save had no visible effect. (§6, §7)
- **Deleting an event permanently deletes all of its registrations**, via a database-level cascade, with a delete-confirmation dialog that only mentions the event, not the registrations that will be lost with it. There is no way to recover a deleted event or its registrations short of a database backup. (§13)
- **No page can view contact form submissions.** `contact_submissions` rows are write-only from this admin panel's perspective; the admin's only recourse is opening Supabase directly, outside the website. (§15)
- **Settings storage is a plain in-memory variable in a serverless function**, meaning saved values are not durable in production and can silently reset. (§7, §12)

**MEDIUM**
- **No delete function for registrations or membership applications** — data described in the project's own privacy documentation as having defined retention periods (e.g., "3 months after the event") has no admin-facing way to actually delete it once that period passes; deletion would have to happen directly in Supabase.
- **No confirmation dialogs anywhere except event deletion** — changing a registration/membership status or overwriting content/settings happens instantly on click, with no undo.
- **All admin operational feedback is native browser `alert()`/`confirm()` popups** — easy to miss, blocks the whole page, and provides no detail beyond a generic success/failure message.
- **No filter or search on Registrations or Memberships**, and no pagination anywhere — as the number of events/registrations/applications grows, every admin list page loads and renders its entire dataset in one request with no way to narrow it down.
- **The event slug is auto-generated from the Persian title with no transliteration and cannot be edited**, risking non-Latin, non-URL-friendly slugs (e.g., Persian characters directly in the URL) with no admin visibility into what the resulting URL actually is until they check the public page.
- **No image upload** — every image on the site (including per-event photos) requires either a code change and redeploy, or having the image already hosted somewhere else with a stable direct URL.
- **Event `category` field is displayed by the front-end components but has no schema column and no admin input**, so it can only ever render as blank today — a partially-built feature.
- **The homepage always shows exactly 3 upcoming events**, which does not match the "2 nearest upcoming events" described in the project's own `00_MASTER_CONTEXT.md` (§8) — worth confirming with the owner which behavior is actually intended, since it's a discrepancy between documentation and code rather than a bug per se.

**LOW**
- **The admin panel has zero accessibility attributes** (no `aria-*`, no `role=`), unlike the notably more accessible public site.
- **The admin panel has minimal mobile responsiveness** (a single breakpoint) compared to the public site's more thorough responsive design.
- **The entire admin UI chrome is Persian-only**, with no language toggle, which may or may not matter depending on who else needs to use this panel.
- **`GET /api/events` is a fully built, unused public API** — not a risk exactly, but dead surface area that a future maintainer might assume is in active use.
- **The `admin_notes` field exists in the database for both events and registrations/memberships but has no UI field anywhere to read or write it** — a partially-wired feature.
- **No audit log of admin actions** — low priority today with a single admin, but worth naming for completeness.

---

## 20. Final Master Table

| Feature | Current Admin Capability | Editable? | Data Source | Public Impact | Main Limitation |
|---|---|---|---|---|---|
| Events | Full CRUD, publish/draft, registration status | YES | Supabase `events` | Direct (subject to ISR cache) | No slug/category field, no ordering/featuring, no "archived" option in UI |
| Event registrations | View, change status, CSV export | Status only | Supabase (queried as `registrations` — verify table name) | None | Possible table-name bug (§13); no delete, filter, or search |
| Membership applications | View, change status, CSV export | Status only | Supabase (queried as `memberships` — verify table name) | None | Same as above; no sort at all |
| Contact messages | **None** | No admin view exists | Supabase `contact_submissions` | None | Entirely inaccessible from this admin panel |
| Homepage/About content | Form exists, saves to DB | Form: YES / Effective: **NO** | Supabase `content` (orphaned) | **None** | Not read by any public page (§6) |
| Contact email & social links | Form exists, saves to memory | Form: YES / Effective: **NO** | In-memory variable (not durable) | **None** | Not read by any public page, and not persisted (§7) |
| Homepage layout/hero/images | None | NO | Source code | — | Fully hardcoded |
| Legal pages (Impressum/Datenschutz) | None | NO | Source code | — | Hardcoded by design (legally sensitive text) |
| Images/media | Per-event URL only | Partial | URL field / static files | Direct for event photos only | No upload, no library, no validation |
| Authentication | Single password, session cookie | — | Env var (hash) + in-memory sessions | — | Sessions not durable across restarts (by design) |

---

## 21. Final Summary

**A. What the current Admin Panel can do:** create, edit, publish/unpublish, and delete events with bilingual titles/descriptions/locations, a date/time, an image URL, and a 3-state registration status; view and CSV-export event registrations and membership applications, and change their status; log in and out with a single password behind a 24-hour session cookie.

**B. What it cannot do:** show contact form messages; actually change any homepage, About, Membership, or Contact page text, or the site's displayed email/social links (despite having forms that appear to do exactly this); upload or manage any image; delete a registration or application; edit a submitted registrant's/applicant's details; search or filter any list; set an event's category, slug, or "featured/archived" state; send any email.

**C. What is hardcoded:** all page copy outside of Events (Home, About, Membership, Contact, Impressum, Datenschutz), all navigation/UI/status labels, the contact email, the social media links, the logo, the hero banner, and every non-event image.

**D. What is database-driven:** Events (fully, and this is the one part of the admin panel that works end-to-end); event registrations, membership applications, and contact submissions (written by the public site, but only the first two are even *intended* to be admin-manageable, and that depends on the table-name question in §13); the Content table (written by admin, read by nothing).

**E. What is configuration-driven:** only credentials and two rate-limiting numbers (`RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW_MS`) — no visible site content is environment-variable-driven.

**F. What a future improved Admin Panel would need to control, based on what already exists on the live site today** (not a redesign — just naming the gaps this audit found): a working, actually-connected way to edit homepage hero text, About text, Membership intro text, and Contact intro text; a working, actually-connected way to edit the contact email and social links; a way to view and act on contact form messages; an image upload mechanism (or, at minimum, clearer guidance in the admin UI that the image field expects an already-hosted URL); an event category field with a matching schema column; a slug field that's visible and editable, or a proper transliteration step; a way to mark an event "archived"; a way to delete a registration or membership application in line with the retention periods described in the project's own privacy documentation; and a resolution, one way or the other, of the `registrations`/`memberships` vs. `event_registrations`/`membership_applications` table-name question, since nothing else about those two features can be trusted until that's settled.

---

## 22. File-by-File Evidence Index

This mirrors the file paths cited throughout the report, grouped by area, all relative to the repository root (`didar-website/`):

- **Admin pages:** `pages/admin/login.js`, `pages/admin/index.js`, `pages/admin/events/index.js`, `pages/admin/events/[slug].js`, `pages/admin/registrations.js`, `pages/admin/memberships.js`, `pages/admin/content.js`, `pages/admin/settings.js`
- **Admin/auth API routes:** `pages/api/auth/login.js`, `pages/api/auth/logout.js`, `pages/api/auth/verify.js`, `pages/api/admin/stats.js`, `pages/api/admin/events/index.js`, `pages/api/admin/events/[slug].js`, `pages/api/admin/registrations/index.js`, `pages/api/admin/registrations/[id].js`, `pages/api/admin/registrations/export.js`, `pages/api/admin/memberships/index.js`, `pages/api/admin/memberships/[id].js`, `pages/api/admin/memberships/export.js`, `pages/api/admin/content/index.js`, `pages/api/admin/settings/index.js`
- **Public API routes:** `pages/api/events/index.js`, `pages/api/health.js`, `pages/api/contact/submit.js`, `pages/api/memberships/submit.js`, `pages/api/registrations/submit.js`
- **Shared/support code:** `lib/session-store.js`, `lib/api-middleware.js`, `lib/admin-auth.js`, `lib/middleware.js`, `lib/supabase.js`, `lib/i18n.js`, `lib/validation.js`, `lib/rate-limit.js`
- **Public pages:** `pages/_app.js`, `pages/index.js`, `pages/veranstaltungen/index.js`, `pages/veranstaltungen/[slug].js`, `pages/ueber-uns.js`, `pages/mitglied-werden.js`, `pages/kontakt.js`, `pages/impressum.js`, `pages/datenschutz.js`
- **Shared components:** `components/Header.js`, `components/Footer.js`, `components/EventCard.js`, `components/SocialIcons.js`
- **Database:** `data/schema.sql`, `Claude outputs/content-table.sql`, `Claude outputs/didar-new-events.sql`, `Claude outputs/migration-registration-status.sql`
- **Config:** `next.config.js`, `package.json`, `.env.example` (template only — `.env.local` was not opened, to avoid exposing secrets), `.gitignore`
- **Styling:** `styles/admin.module.css` (admin only), `styles/globals.css`, `styles/layout.css`, `styles/components.css`, `styles/rtl.css`, `styles/enhancements.css` (public only)
- **Setup tooling:** `scripts/setup-admin.js`
- **Project's own documentation, used for cross-checking intent vs. implementation:** `00_MASTER_CONTEXT.md`, `01_OWNER_CHECKLIST.md`, `PROJECT_STATE.md`, `ARCHITECTURE.md`, `SUPABASE_ARCHITECTURE.md`, `claude/06_PHASE_6_PRIVACY_LEGAL_SECURITY_AUDIT.md` (this last one is a superseded historical audit — its Datenschutz/Impressum findings are outdated, since both pages now contain complete text, as confirmed by directly reading `pages/impressum.js` and `pages/datenschutz.js` above)
- **Verified but not reproduced:** `.env.local` (contains real secrets — existence and variable names confirmed via `.env.example`'s template only; `git log` confirms it has never been committed)

---

**AUDIT COMPLETE — NO CODE CHANGES MADE.**
