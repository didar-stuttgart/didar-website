# ADMIN GUIDE

What the admin panel actually does today (checked against `pages/admin/*` and `pages/api/admin/*` on 2026-10-17), including its limits. The panel UI is in Persian. For the underlying APIs see [ARCHITECTURE.md](ARCHITECTURE.md#5-api-routes); for the review workflow see [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md).

## 1. Signing in

- URL: `/admin/login` (production: `https://www.didar-stuttgart.com/admin/login`). There is a **single shared admin password**; no usernames, no password-reset or change feature.
- The password is verified against the `ADMIN_PASSWORD_HASH` environment variable (format `salt:hash`, PBKDF2-SHA256, 10,000 iterations, produced by `node scripts/setup-admin.js`). Changing the password means generating a new hash and updating the environment variable, then redeploying/restarting.
- A successful login stores a hashed session token in the `admin_sessions` table and sets the cookie `session_token` (HttpOnly, `SameSite=Lax`, `Path=/`, 24 h). Logout (`/admin` → logout button) deletes the session row.
- Every admin page checks the session with `POST /api/auth/verify` and redirects to the login if invalid; every admin API route re-checks it.
- Never share the password in chat/email and never paste it into tools or documents. If it may have leaked, generate a new hash and delete all rows in `admin_sessions` (see [SECURITY.md](SECURITY.md#8-incident-steps)).

## 2. Dashboard (`/admin`)

Shows three numbers from `GET /api/admin/stats`: upcoming published events (date ≥ today), registrations created in the last 7 days, membership applications created in the last 7 days, plus cards linking to events, registrations, memberships, content and settings. (There is no contact-message count.)

## 3. Events (`/admin/events`, `/admin/events/[slug]`)

- **List:** all events, a status filter (draft / published / archived) and registration-status badges; edit and "delete" actions.
- **Create/Edit** fields: titles FA/DE (both required), descriptions, event type (dated / recurring), date (hidden for recurring), time, locations FA/DE, capacity (empty or integer ≥ 1), remaining capacity (empty or integer ≥ 0), registration deadline, image URL (any URL or `/images/…` path from `public/images`; there is no upload), registration status (`not_open` / `open` / `closed`), event status (`draft` / `published` / …), admin notes.
- **"Delete"** only archives the event (`status='archived'`); it disappears from the public site, and registrations are kept.
- New events: if `registration_status` is not supplied it defaults to `open` when the event is published, otherwise `not_open`.
- **Important:** the public event page tries to flip `not_open` to `open` on view (known issue in [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md#8-known-issues-documented-not-fixed)). Set `closed` (not `not_open`) when you want to stop registrations, and check the public page afterwards.
- The slug is generated once from the Persian title and cannot be changed in the editor.
- Public pages refresh via ISR: allow up to a minute for the event page and up to an hour for the home/list pages.
- `admin_notes` are never shown on the event page or list, but see the known leak on the home page in [SECURITY.md](SECURITY.md#2-admin-authentication-and-sessions): **do not put sensitive text into event `admin_notes`**.

## 4. Registrations (`/admin/registrations`)

- Lists all registrations (newest first) with the event title, applicant details, status, comment, timestamps; sorting by date / name / status. There is **no event or status filter and no search** (use the browser's find, or the CSV).
- Change status via the dropdown (`new`, `contacted`, `confirmed`, `declined`, `cancelled`); this saves immediately. Existing `admin_notes` are displayed, but the page has no field to edit them (the API supports it).
- `cancelled` normally appears on its own when a registrant uses the link in the receipt email (you also receive "[DIDAR] Event Registration Cancelled — …").
- **Export:** "CSV" downloads `registrations.csv` (all rows). Columns: name, email, phone, Telegram, event, status, date, notes. Known defect: the event column is expected to be empty (it reads a field that does not exist). Cells are quoted but not protected against spreadsheet formulas.
- The cancellation token hash is removed from every admin response.
- Workflow: read the notification email → open the list → contact the person by email/Telegram/phone from DIDAR's official accounts → set `contacted` → later `confirmed` or `declined`. Confirmation of attendance is always your decision; the automatic receipt does not confirm anything.

## 5. Memberships (`/admin/memberships`)

Same pattern: list, status dropdown (`new`, `contacted`, `accepted`, `declined`), displayed notes, CSV export (`/api/admin/memberships/export`). Applications are unique per email. Membership is free of charge according to the privacy text; terms, benefits and decisions are handled manually by the team.

## 6. Contact messages

There is **no admin page**. Messages arrive as `[DIDAR] New Contact Message` emails and are stored in `contact_submissions` (view them in Supabase → Table Editor). The `read` flag is not used by any code.

## 7. Content (`/admin/content`)

Edits rows of `cms_content` (filter by page, grouped by section, FA and DE text per row, save per row). Only three keys affect the public site: `homepage.hero.title` (FA and DE), `homepage.hero.subtitle` (FA), `homepage.about.description` (FA, DE) — and the seed rows still contain `[TEST]` placeholders unless production differs (NOT VERIFIED). Text starting with `[` is ignored by the home page. Everything else on the site (About, Impressum, Datenschutz, footer, contact details) is hard-coded in the repository and can only be changed in code. Because the German hero title comes from this table, e.g. changing the wording of the German title is done here.

## 8. Settings (`/admin/settings`)

Edits `organization_settings` rows (including a managers list). **No public page reads these values**, so changes do not alter the website. Treat this page as non-functional until the owner decides what it should drive. (`/api/admin/settings` is an unused in-memory leftover.)

## 9. Daily/weekly routine (suggested)

1. Check the notification inbox (`DIDAR_NOTIFICATION_EMAIL`); also check Spam for `noreply@didar-stuttgart.com`.
2. Open registrations/memberships, process `new` rows, update statuses.
3. For full events: set `remaining_capacity` to 0 and set `registration_status = closed`.
4. Export CSVs only when needed; keep exports out of Git and cloud-sync folders you do not control (they contain personal data).

## 10. Troubleshooting

| Problem | Likely cause |
|---|---|
| Login fails with "Admin password not configured" | `ADMIN_PASSWORD_HASH` unset or still the placeholder |
| Login succeeds but pages redirect back | session row not created (check `SUPABASE_SECRET_KEY`, `admin_sessions`), cookie blocked |
| Changes not visible publicly | ISR delay; CMS key not one of the three used |
| Event shows "open" though set to "not open" | the auto-open behaviour described above |
| Can't find a contact message | no admin UI; use Supabase |
