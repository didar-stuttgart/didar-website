# EVENTS AND REGISTRATION

How events are stored, published and displayed, and how the **manual registration model** works. Verified against the code on 2026-10-17; "NOT VERIFIED" marks things the repository cannot prove.

Related: [FORMS.md](FORMS.md) · [DATABASE.md](DATABASE.md) · [ADMIN_GUIDE.md](ADMIN_GUIDE.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

## 1. The manual registration model (do not change without owner approval)

```
Visitor submits the form
  → the registration is saved immediately (status "new")
  → the admin is notified by email
  → the registrant gets a receipt email ("received", NOT a confirmation)
  → an admin reviews it and contacts the person manually
```

There is **no** email-verification token (the endpoint `/api/registrations/verify` always returns 404 and `pages/registrations/verify.js` only shows a thank-you message for old links), **no** automatic approval or confirmation of attendance, and **no** automatic capacity enforcement or closing. A failed email never rolls back a saved registration.

## 2. Event data

Table `events` (see [DATABASE.md](DATABASE.md#events)). Fields an admin edits in `/admin/events/[slug]`: titles (FA, DE — both required), descriptions, date (optional) and time, locations, `capacity`, `remaining_capacity`, `registration_deadline`, `image_url`, `status`, `registration_status`, `admin_notes`, and the event type (dated vs. recurring).

| Field | Meaning in the code |
|---|---|
| `status` | `draft` (hidden), `published` (public), `archived` (hidden; this is what the admin "delete" does) |
| `registration_status` | `not_open` → "coming soon"; `open` → form shown; `closed` → "registration closed" |
| `capacity` | number stored/validated (positive integer or empty); **not enforced** |
| `remaining_capacity` | non-negative integer the admin sets by hand; shown publicly as "ظرفیت باقیمانده / Verbleibende Plätze" when it is a number; purely informational |
| `registration_deadline` | stored and editable; **no code reads it** (nothing closes registration at the deadline) |
| `is_recurring` | see categorisation below |
| `image_url` | `lib/event-image.js` uses it, else a deterministic fallback from `public/images/event-1…5.jpg` |
| `slug` | created from `title_fa` (lower-cased, spaces → `-`) when the event is **created**; the admin update does not change it. Slugs may be Persian |

Dates are stored as `DATE`; display uses `formatDate`/`formatTime` in `lib/i18n.js` (Gregorian calendar for both languages; Persian digits/month names for `fa`; German time as `19:15 Uhr`).

## 3. Listing and categorisation

`lib/events-categorizer.js` splits published events (evaluated at request/ISR time using today's UTC date):

1. no `event_date` → **upcoming** (even if flagged recurring; date-less events sort last)
2. else `is_recurring` → **recurring**
3. else `event_date >= today` → **upcoming**
4. else → **past**

Upcoming events are sorted ascending by date. Practical consequence: the admin editor hides the date field for the "recurring" type, so a recurring event saved without a date is shown in the **upcoming** group, not in "recurring" (migration 010's comment describes a different intent). Treat this as a known quirk until the owner decides.

Where it is used: home page (`/`, up to 6 per group), `/veranstaltungen` (carousels per group), `GET /api/events?category=…`. Pages are ISR (see [ARCHITECTURE.md](ARCHITECTURE.md#4-rendering-and-caching)), so a change can take up to the revalidation time to appear (home/list: up to 1 h normally; detail page: 60 s).

## 4. Event detail page and registration form

`/veranstaltungen/[slug]` shows the event and, depending on state:

1. event has `external_registration_url` (column does not exist in production today) → link instead of form;
2. `registration_status = open` and not "full" → the registration form;
3. past event → "event has passed"; 4. `closed` → closed notice; 5. otherwise "not yet open". Because rule 2 is evaluated first, an event whose date has passed still shows the form while its `registration_status` is `open`; closing it is the admin's job.

The form and its server rules are documented in [FORMS.md](FORMS.md#3-event-registration). The server independently requires `registration_status = 'open'` and a published event, so a stale page cannot register someone for a closed event (HTTP 409).

## 5. Registration status workflow

`event_registrations.status`:

| Status | Set by | Meaning |
|---|---|---|
| `new` | system (RPC) | received, not reviewed |
| `contacted` | admin | admin reached out |
| `confirmed` | admin | admin confirmed participation (a manual decision) |
| `declined` | admin | declined / no longer attending |
| `cancelled` | system (self-cancellation) or admin dropdown | registration withdrawn; row kept with `cancelled_at` |
| `pending`, `verified` | nobody | legacy values still allowed by the CHECK constraint |

Admin changes status and notes in `/admin/registrations` (`PATCH /api/admin/registrations/[id]`, which writes whatever `status` it is sent — there is no server-side allow-list).

Duplicates: unique `(event_id, email)`. The same email cannot register twice for the same event, and a **cancelled registration still blocks re-registration** with that email (owner decision pending; releasing it today requires deleting the row in SQL).

## 6. Receipt email and self-cancellation

**Receipt.** After a successful registration the registrant receives one email (FA or DE according to the page language). It states that the registration *request was received* and is *not a final confirmation* (the registration is confirmed after DIDAR's review), asks to check Spam/Junk, includes a "cancel registration" button, contact details and official links. Wording lives in `COPY` in `lib/registration-receipt-email.js`.

**Cancellation.**
1. The email link is `{NEXT_PUBLIC_APP_URL or https://www.didar-stuttgart.com}[/de]/registrations/cancel?token=<43-char token>`.
2. `pages/registrations/cancel.js` only shows a confirmation button — opening the link (GET) never changes data.
3. The button sends `POST /api/registrations/cancel {token}` (rate-limited). A malformed token → `404 {status:'invalid'}`; otherwise the RPC `cancel_event_registration_manual` looks up the SHA-256 hash and returns `cancelled`, `already_cancelled` or `invalid`.
4. First cancellation sets `status='cancelled'`, `cancelled_at`, and the admin receives `[DIDAR] Event Registration Cancelled — <event>`; repeating it is harmless and sends no second email.
5. Only the hash of the token is stored; the raw token exists only in the emailed link. The token is not an authentication credential for anything else.

If the receipt cannot be sent (missing `RESEND_API_KEY`, Resend error) the registration still exists but the person has no cancellation link; the admin must handle cancellations manually.

## 7. Capacity

Capacity is informational. `GET /api/events/[eventId]/capacity-status` counts rows with status `verified`, which the manual model never writes, so on production it returns `verified_count: 0`, `is_full: false` (checked for event 1 on 2026-10-17: `capacity: 0`). The event page still contains code that would disable the form when `is_full` were true — that branch is effectively dead. If an event is full, an admin sets `remaining_capacity` to 0 and/or closes registration by hand, and contacts the extra registrants.

## 8. Known issues (documented, not fixed)

1. **Event page may "auto-open" registration.** In `getStaticProps` of `pages/veranstaltungen/[slug].js`, if a published event has `registration_status = 'not_open'` the code tries to `UPDATE events SET registration_status='open'` (with the publishable key) and sets the prop to `open` regardless of whether the update persisted. Effects: (a) the page can show an open form while the database still says `not_open` — on 2026-09-28 QA observed exactly this (page open; API answered 409); (b) if the update does persist, an admin's `not_open` is silently overridden. Only `not_open` is affected, not `closed` (per the code). Whether the write ever succeeds for the `anon` role is NOT VERIFIED (migration 003 grants `anon` only SELECT on `events`). Owner decision required; do not change without an explicit request.
2. `registration_closed` 409 from the API is shown to the user as the "already registered" message.
3. `capacity-status` never reports full (see §7).
4. Recurring events without a date appear under "upcoming" (see §3).
5. `registration_deadline` is not used anywhere.
6. The admin registrations CSV has an "event" column that reads a non-existent field (`reg.event`), so it is expected to be empty for every row (code inspection; not executed).
7. `/api/admin/fix-event-status` exists to force `registration_status='open'`; it has no UI in the repository.

## 9. Troubleshooting

| Problem | Check |
|---|---|
| Form missing on a published event | `registration_status` must be `open`; wait up to 60 s for ISR; check `external_registration_url`/past date |
| "Already registered" | same email already has an active (not cancelled) registration for that event; a cancelled one does not block (migration 013) |
| Registrant says no email arrived | check Spam; check Resend logs and the function logs for `[Receipt Email]`; the registration itself is unaffected |
| Event changes not visible | ISR delay; list pages can take up to an hour |
