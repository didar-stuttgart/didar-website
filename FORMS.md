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

## 7A. Field-level validation reference

Server validation is implemented in ``lib/validation.js``:

| Form | Field | Rule |
|---|---|---|
| Event | first/last name | required, 1–100 characters |
| Event | email | required, regex-valid, <=254 characters |
| Event | phone | optional, 5–20 characters |
| Event | Telegram | optional; ``@handle`` length 2–32 or digits |
| Event | comment | optional, <=1000 characters |
| Membership | first/last name | required, 1–100 characters |
| Membership | email | required, regex-valid, <=254 characters |
| Membership | phone | optional, 5–20 characters |
| Membership | Telegram | optional; ``@handle`` length 2–32 or digits |
| Membership | additional info | optional, <=1000 characters |
| Contact | name | required, 1–100 characters |
| Contact | email | required, regex-valid, <=254 characters |
| Contact | message | required, 10–2000 characters |

The hidden event-registration ``eventId`` must be a JavaScript number. The hidden ``language`` value is used to select FA/DE receipt and event-title wording.

## 7B. Error and duplicate semantics

- Validation failures return HTTP 400 with ``details: [...]``.
- Event not found/unpublished returns 404.
- Closed event registration returns 409 with ``errorType: registration_closed``.
- Active duplicate registration returns 409 with ``errorType: duplicate_email``.
- Membership duplicate email returns 409.
- Email failure after a successful database write does not alter the HTTP success response.

## 7C. Email operations

Resend is called directly over HTTPS. Admin notification messages use ``DIDAR_EMAIL_FROM`` (defaulting in code to ``Didar Stuttgart <noreply@didar-stuttgart.com>``) and ``DIDAR_NOTIFICATION_EMAIL`` as the recipient.

Notification helpers use stable idempotency keys such as ``registration-<id>``, ``membership-<id>``, ``contact-<id>`` and ``registration-cancellation-<id>``.

The registrant receipt has its own ``registration-receipt-<id>`` idempotency key. It is an acknowledgment only, includes the cancellation link, and never represents final attendance confirmation.

There is no retry queue in the repository. A failed send is observable through logs/Resend only; the database record remains the source of truth.

When required email configuration is missing, the current admin-email helpers fall back to logging submitted personal data to server logs. Treat this as a privacy/security risk and do not print those values in support messages.

## 7D. Safe form test procedure

Use addresses you control.

1. Submit a valid event registration and confirm HTTP 201.
2. Confirm the row exists with status ```new``.
3. Check admin notification and registrant receipt in the actual inbox/Resend evidence.
4. Open the cancellation link without confirming: GET must not cancel.
5. Use the confirmation action and verify status becomes ```cancelled``.
6. Re-register the same email only after confirming migration 013 is present in the target database.
7. For membership/contact, verify the row and admin notification; there is no submitter confirmation email.
