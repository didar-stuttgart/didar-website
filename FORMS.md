# FORMS

Current public form flows. The three forms persist the submission first, then notify the admin. Email failures never roll back a successful database write.

Related: [ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE.md](DATABASE.md), [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md), [SECURITY.md](SECURITY.md).

## 1. Summary

| Form | Page | API | Database RPC | Submitter email |
|---|---|---|---|---|
| Event registration | `/veranstaltungen/[slug]` | `POST /api/registrations/submit` | `insert_event_registration_manual` | Receipt + cancellation link |
| Membership | `/mitglied-werden` | `POST /api/memberships/submit` | `insert_membership_application_manual` | None |
| Contact | `/kontakt` | `POST /api/contact/submit` | `insert_contact_submission_manual` | None |

All three are manual-review workflows. There is no public user account system, verification token flow, automatic approval, or automatic capacity enforcement.

## 2. Common validation and abuse controls

- Server-side validation is authoritative.
- Email addresses are trimmed and lower-cased.
- The repeated-email field is client-side only and is never sent or stored.
- The public form APIs and cancellation API use the same in-memory per-IP limiter; default is 10 requests per 60 seconds.
- The limiter is per server instance and therefore is not a global Vercel rate limit.
- Membership requires the privacy checkbox in the browser.
- Success UI stays on the same page.

## 3. Event registration

The server requires a numeric event id and a published event with `registration_status='open'`.

Flow:

```text
POST
 -> rate limit
 -> load published event
 -> require registration_status='open'
 -> validate fields
 -> generate random cancellation token
 -> store SHA-256 token hash through RPC
 -> status='new'
 -> send admin notification
 -> send registrant receipt
 -> HTTP 201
```

The receipt states that the request was received and is **not** a final confirmation.

### Duplicate behavior

Migration 013 changes the uniqueness rule:

- one active/non-cancelled registration per event/email;
- cancelled registrations remain in history;
- the same email can register again after cancellation;
- the new registration receives a new row and a new cancellation token;
- simultaneous duplicate active submissions are still rejected with HTTP 409.

### Cancellation

The receipt contains a tokenized link to `/registrations/cancel`.

- GET only displays the confirmation page.
- POST to `/api/registrations/cancel` performs the cancellation through `cancel_event_registration_manual`.
- Only the token hash is stored.
- Cancellation changes the row to `cancelled`; it does not delete the row.
- First cancellation triggers an admin notification. Repeating the cancellation is harmless.

## 4. Membership

Validated fields are first name, last name, email, optional phone/Telegram/additional information, plus the browser-only privacy agreement.

Successful applications start at status `new`. The admin later uses `contacted`, `accepted` or `declined`.

There is no automatic applicant email.

## 5. Contact

Validated fields are name, email and message.

The row is saved in `contact_submissions` and the admin receives an email. There is no submitter email.

## 6. Email behavior

Provider: Resend REST API.

Configuration names:

- `RESEND_API_KEY`
- `DIDAR_NOTIFICATION_EMAIL`
- `DIDAR_EMAIL_FROM`
- optional `NEXT_PUBLIC_APP_URL`

Admin notifications are sent for registration, membership, contact and registration cancellation. Event registrants additionally receive the receipt email.

Each helper catches its own failures. A send failure does not change the successful database response.

If required email variables are missing, current helpers have console fallback behavior; this can place submitted personal data into server logs and is therefore a security/privacy risk.

## 7. Testing and evidence

For email-related changes, real delivery must be checked. HTTP 201 only proves the application accepted the submission; it does not prove inbox delivery.

Use only addresses you control for permanent form tests.
