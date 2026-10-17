# FORMS

The three public forms, from the browser to the database to email. Verified against the code on 2026-10-17. Common rules first, then one section per form.

Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [DATABASE.md](DATABASE.md) · [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md) · [SECURITY.md](SECURITY.md)

## 1. Summary

| | Event registration | Membership application | Contact |
|---|---|---|---|
| Page | `/veranstaltungen/[slug]` | `/mitglied-werden` | `/kontakt` |
| API | `POST /api/registrations/submit` | `POST /api/memberships/submit` | `POST /api/contact/submit` |
| Database write | RPC `insert_event_registration_manual` → `event_registrations` | RPC `insert_membership_application_manual` → `membership_applications` | RPC `insert_contact_submission_manual` → `contact_submissions` |
| Admin notification email | yes | yes | yes |
| Email to the submitter | **yes: a receipt** (not a confirmation) + cancellation link | **no** | **no** |
| Duplicate rule | one per `(event_id, email)` → 409 | one per `email` → 409 | none |
| Success text key | `event.registration_success_message` | `form.success_message` | `form.success_message` |
| Admin UI | `/admin/registrations` | `/admin/memberships` | none (database only) |

All three follow the **manual-review model**: the submission is stored first; an administrator reads the notification (or the admin page), contacts the person manually, and updates the status. There is no verification token, no automatic approval/confirmation of attendance or membership, and no capacity enforcement. The DIDAR admin is notified by email at `DIDAR_NOTIFICATION_EMAIL` (see §6).

## 2. Common behaviour

- **Repeat-email field.** Every form has `E-Mail-Adresse wiederholen` / `تکرار ایمیل` (`id`/`name` `emailConfirm`), required, placed directly after the email field. On submit the browser compares both values (trimmed, case-insensitive). If they differ, no request is sent and a localized error (`form.validation_email_mismatch`) appears under the field with `aria-invalid`/`aria-describedby` and `role="alert"`; the error clears when either field is edited. The confirmation value is **client-side only**: it is not sent to the API, stored, or emailed (the contact page builds its request body explicitly from `name`, `email`, `message`). An empty field is stopped by the native `required` attribute.
- **Server validation is authoritative** (`lib/validation.js`): required strings are trimmed; email must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` and be ≤ 254 characters; email is stored lower-cased and trimmed. Validation failures return `400 { error: 'Validation failed', details: [...] }` with English messages; the pages map those to localized field errors.
- **Rate limiting.** All three APIs (and the cancel API) are wrapped with `withRateLimit` (`lib/middleware.js` → `lib/rate-limit.js`): one in-memory limiter keyed by client IP (`x-forwarded-for` first entry), shared by all of these endpoints, default **10 requests per 60 s**, configurable with `RATE_LIMIT_REQUESTS` / `RATE_LIMIT_WINDOW_MS`. Exceeding it returns `429` with `Retry-After`. The counter lives in each server instance's memory (not shared between instances/cold starts).
- **Privacy notice.** Each form shows a notice linking to `/datenschutz`. Only the membership form has a required checkbox (`privacyAgreed`), enforced in the browser only and not sent to the API.
- **Success UI.** After a successful submission a modal stays on the same page: `components/SuccessModal.js` for contact and membership (title `form.success_title`, text `form.success_message`), and an inline modal in `[slug].js` for registrations. The `message` returned by the API is not displayed.
- **Wording rule.** A success message may only tell people to check Spam/Junk for an email they will really receive. Only event registration sends the submitter an email, so only its message says a receipt is coming; the other two say that no automatic email is sent and mention Spam/Junk only for a possible reply.

## 3. Event registration

**Fields** (UI limits in parentheses; server limits authoritative)

| Field | Required | Server rule |
|---|---|---|
| First name | yes | 1–100 chars |
| Last name | yes | 1–100 chars |
| Email (+ repeat) | yes | valid, ≤ 254 |
| Phone | no | 5–20 chars if given (UI `maxLength` 20) |
| Telegram ID | no | `@handle` of 2–32 chars, or digits only (UI `maxLength` 32) |
| Comment | no | ≤ 1000 chars |
| `eventId` (hidden) | yes | must be a **number**; event must exist with `status='published'` |
| `language` (hidden) | no | `'fa'` or anything else = German; chooses the event title language and the receipt language |

**Server flow** (`pages/api/registrations/submit.js`)
1. `405` unless POST; `400` if `eventId` is missing/not a number.
2. Load the event via the publishable key (`published` only) → `404` if absent.
3. `409 { errorType: 'registration_closed' }` if `registration_status !== 'open'`. (Capacity is **not** checked.)
4. Validate the fields → `400`.
5. Generate a cancellation token (`randomBytes(32)`, base64url, 43 chars); only its SHA-256 hash goes to the database.
6. RPC `insert_event_registration_manual` → status `'new'`. Error containing `duplicate` → `409 { errorType: 'duplicate_email' }`; other errors or a null id → `500`.
7. `await sendRegistrationNotification(...)` (admin) and `await sendRegistrationReceipt(...)` (registrant). Neither throws.
8. `201 { success, message, registrationId }`.

**Browser** (`pages/veranstaltungen/[slug].js`): the form only renders when the event is open and not externally registered; closed/not-yet-open/past events show a status message instead; an `external_registration_url`, if the column ever exists, replaces the form with a link. The page also polls `/api/events/[id]/capacity-status` every 10 s, which in practice never reports "full" (see [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md)). Errors: any 409 other than `capacity_full` (so both `duplicate_email` **and** `registration_closed`) shows the `event.duplicate_registration` text — a closed-registration 409 therefore displays the "already registered" message (known quirk); field errors come from `details`; anything else shows `form.error`.

**Receipt email** — see §6. **Cancellation** — see [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md#6-receipt-email-and-self-cancellation).

**Success message (FA/DE)** — states the request was received, a receipt email will be sent, to check Spam/Junk if it is missing, and that this is not a final confirmation (`event.registration_success_message` in `lib/i18n.js`).

## 4. Membership application

**Fields:** first name (1–100), last name (1–100), email (+ repeat), phone (optional, 5–20), Telegram ID (optional), additional information (optional, ≤ 1000), privacy checkbox (browser-only).

**Flow** (`pages/api/memberships/submit.js`): `405` unless POST → validate (`validateMembershipApplication`) → RPC `insert_membership_application_manual` → on error code `23505` return `409` ("This email address has already been used to apply for membership"; the page shows the server text), other errors `500` → `await sendMembershipNotification` → `201 { success, message, id }`. Status starts at `new`; the admin moves it through `contacted → accepted | declined` in `/admin/memberships`.

**Submitter email:** none. **Success message:** `form.success_message` (request received; no automatic email; Didar replies by email if needed; check Spam/Junk if a reply is expected).

## 5. Contact form

**Fields:** name (1–100), email (+ repeat), message (10–2000). **Flow** (`pages/api/contact/submit.js`): validate (`validateContactForm`) → RPC `insert_contact_submission_manual` → `await sendContactNotification` → `201 { success, message, id }`. RPC failure → `500`.

**Admin handling:** rows are stored in `contact_submissions`; there is no admin page, so the admin works from the notification email or the Supabase table. **Submitter email:** none. **Success message:** same `form.success_message`.

## 6. Emails

Provider: **Resend** via its REST API (`fetch`), sender `DIDAR_EMAIL_FROM` (default `DIDAR Stuttgart <noreply@didar-stuttgart.com>`). Variables: `RESEND_API_KEY`, `DIDAR_NOTIFICATION_EMAIL`, `DIDAR_EMAIL_FROM`, optional `NEXT_PUBLIC_APP_URL` (base URL for the cancellation link, default `https://www.didar-stuttgart.com`). No secret values belong in this repository.

| Email | Function | To | Subject | Idempotency-Key |
|---|---|---|---|---|
| Registration notification | `sendRegistrationNotification` (`lib/admin-email.js`) | `DIDAR_NOTIFICATION_EMAIL` | `[DIDAR] New Event Registration — <event>` | `registration-<id>` |
| Membership notification | `sendMembershipNotification` | same | `[DIDAR] New Membership Application` | `membership-<id>` |
| Contact notification | `sendContactNotification` | same | `[DIDAR] New Contact Message` | `contact-<id>` |
| Cancellation notification | `sendRegistrationCancellationNotification` | same | `[DIDAR] Event Registration Cancelled — <event>` | `registration-cancellation-<id>` |
| **Registrant receipt** | `sendRegistrationReceipt` (`lib/registration-receipt-email.js`) | the registrant | FA «ثبت‌نام شما دریافت شد — دیدار» / DE `Ihre Anmeldung wurde erhalten — Didar` | `registration-receipt-<id>` |

Admin notifications contain all submitted fields, the new row id and an ISO timestamp. The receipt (HTML + plain-text alternative, FA RTL / DE LTR, built from `COPY` in `lib/registration-receipt-email.js`) greets the registrant, shows the event, says the request was received, states that it is only an acknowledgment of the registration request and that the registration is confirmed only after DIDAR reviews it (not a final acceptance), asks to check Spam/Junk, and contains a cancel button/link plus contact details and official links. It contains the raw cancellation token only inside that link; the token is not logged or sent to admins.

**Failure behaviour (all emails):** each helper catches its own errors and returns without throwing; a failed or skipped email never changes the HTTP result or rolls back the saved row. If `RESEND_API_KEY` is missing the receipt is skipped; if `RESEND_API_KEY` or `DIDAR_NOTIFICATION_EMAIL` is missing the admin helpers log the submitted data to the server console instead of sending (note: that fallback writes personal data to logs). There is no retry queue: a failed send is lost (visible only in the function logs; Resend's dashboard shows delivery for sends that reached Resend). The helpers are awaited because serverless functions can be frozen once the response is sent.

Delivery notes: inbox placement is not guaranteed; the sender domain passes SPF, DKIM and DMARC (`p=none`) as observed in Gmail "Show original" on 2026-10-17. There is no `Reply-To` header; `noreply@` is the sender.

## 7. Testing checklist

1. Both email fields empty / only the first filled / different → blocked, with the localized error for the mismatch.
2. Matching emails → request sent; success modal visible on the same page.
3. Server validation: send invalid JSON bodies directly with `curl` to the three endpoints; expect 400 with `details`.
4. Duplicate: submit the same registration/membership twice → 409.
5. Check the row in Supabase and the admin notification email. For registrations also check the receipt, the Spam note, and that the cancel link opens `/registrations/cancel?token=…` (GET never cancels).
6. Use only addresses you own for tests; every registration/membership row is permanent (no delete UI, unique constraints block re-use of the same address).
7. After any email change, verify real delivery (HTTP 201 from the API does not prove an email arrived).
