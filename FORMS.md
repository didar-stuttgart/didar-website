# FORMS

This document describes all public-facing forms in the DIDAR website.

## Overview

The website has three public forms for user submissions:

1. **Event Registration** — Users register for upcoming events
2. **Membership Application** — Users apply to become members
3. **Contact Form** — Visitors send messages to DIDAR

All forms are server-side validated, rate-limited to prevent spam, and saved to the database. No automated emails are sent; the admin reviews submissions manually and responds.

---

## Event Registration Form

**Page:** `/veranstaltungen/[slug]` (event detail page)

**Purpose:** Allows users to register for upcoming events.

### Form Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| First Name | Text | Yes | 1–100 characters | Person's given name |
| Last Name | Text | Yes | 1–100 characters | Person's surname |
| Email | Email | Yes | Valid email format, ≤254 chars | Used for admin contact |
| Phone | Text | No | 5–20 characters if provided | International format accepted |
| Telegram ID | Text | No | @ handle or numeric ID if provided | For Telegram-based communication |
| Comment | Text | No | ≤1000 characters if provided | Optional participant notes |

### Validation Rules

- **First Name:** Required, 1–100 characters, trimmed
- **Last Name:** Required, 1–100 characters, trimmed
- **Email:** Required, must be valid email format, max 254 characters, converted to lowercase
- **Phone:** Optional, if provided must be 5–20 characters
- **Telegram ID:** Optional, if provided must start with @ (and be 2–32 characters) or be a numeric user ID
- **Comment:** Optional, max 1000 characters

### API Endpoint

**POST** `/api/registrations/submit`

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string (optional)",
  "telegramId": "string (optional)",
  "comment": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Event registration submitted successfully",
  "id": 123
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    "First name is required (1-100 characters)",
    "A valid email address is required"
  ]
}
```

### Workflow

1. User visits event page (`/veranstaltungen/[slug]`)
2. User fills out registration form
3. Frontend validates (required fields, email format)
4. Frontend sends POST to `/api/registrations/submit`
5. Backend validates all fields (server-side validation is authoritative)
6. If valid: Data saved to `event_registrations` table with `status='new'`
7. User sees confirmation message
8. **Admin notification email sent automatically** (non-blocking; see "Admin Notification Emails" below) — registration is saved to the database regardless of whether the email succeeds
9. Admin reviews submission in `/admin/registrations` dashboard
10. Admin updates status manually (new → contacted → confirmed/declined)
11. Admin contacts user via email/Telegram/phone using official DIDAR account

### Database Storage

**Table:** `event_registrations`

**Stored Columns:**
- id (auto-generated)
- event_id (foreign key to events table)
- first_name (text)
- last_name (text)
- email (text)
- phone (text, nullable)
- telegram_id (text, nullable)
- comment (text, nullable)
- status (enum: 'new', 'contacted', 'confirmed', 'declined')
- created_at (timestamp)
- updated_at (timestamp)

**Duplicate Prevention:**
- One registration per user per event (based on email + event_id)
- Attempting to register twice for same event returns error

### Email Verification (Disabled)

The endpoint `/api/registrations/verify` (email verification link) is **disabled and returns HTTP 404**.

Email verification is not part of the current registration workflow. Registrations are reviewed and confirmed manually by admins, who then contact users directly.

---

## Membership Application Form

**Page:** `/mitglied-werden` (membership page)

**Purpose:** Allows interested people to apply for DIDAR membership.

### Form Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| First Name | Text | Yes | 1–100 characters | Person's given name |
| Last Name | Text | Yes | 1–100 characters | Person's surname |
| Email | Email | Yes | Valid email format, ≤254 chars | Used for admin contact |
| Phone | Text | No | 5–20 characters if provided | International format accepted |
| Telegram ID | Text | No | @ handle or numeric ID if provided | For Telegram-based communication |
| Additional Info | Text | No | ≤1000 characters if provided | Why interested in membership, background, etc. |
| Privacy Agreed | Checkbox | Yes | Must be checked | Consent to privacy policy |

### Validation Rules

- **First Name:** Required, 1–100 characters, trimmed
- **Last Name:** Required, 1–100 characters, trimmed
- **Email:** Required, must be valid email format, max 254 characters, converted to lowercase
- **Phone:** Optional, if provided must be 5–20 characters
- **Telegram ID:** Optional, if provided must start with @ (and be 2–32 characters) or be numeric
- **Additional Info:** Optional, max 1000 characters
- **Privacy Agreed:** Must be checked (required)

### API Endpoint

**POST** `/api/memberships/submit`

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string (optional)",
  "telegramId": "string (optional)",
  "additionalInfo": "string (optional)",
  "privacyAgreed": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Membership application submitted successfully",
  "id": 456
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    "First name is required (1-100 characters)",
    "You must agree to the privacy policy"
  ]
}
```

### Workflow

1. User visits membership page (`/mitglied-werden`)
2. User reads membership information and requirements
3. User fills out application form
4. User checks privacy consent checkbox
5. Frontend validates
6. Frontend sends POST to `/api/memberships/submit`
7. Backend validates all fields
8. If valid: Data saved to `membership_applications` table with `status='new'`
9. User sees confirmation message
10. **Admin notification email sent automatically** (non-blocking; see "Admin Notification Emails" below) — application is saved to the database regardless of whether the email succeeds
11. Admin reviews application in `/admin/memberships` dashboard
12. Admin updates status manually (new → contacted → accepted/declined)
13. Admin contacts applicant via email using official DIDAR account

### Database Storage

**Table:** `membership_applications`

**Stored Columns:**
- id (auto-generated)
- first_name (text)
- last_name (text)
- email (text, unique)
- phone (text, nullable)
- telegram_id (text, nullable)
- additional_info (text, nullable)
- status (enum: 'new', 'contacted', 'accepted', 'declined')
- created_at (timestamp)
- updated_at (timestamp)

**Duplicate Prevention:**
- One application per email address
- Attempting to apply with same email returns error

### Privacy Consent

The privacy checkbox is required. Before submitting, users see a link to the privacy policy (`/datenschutz`) and must explicitly agree.

---

## Contact Form

**Page:** `/kontakt` (contact page)

**Purpose:** Allows visitors to send messages directly to DIDAR.

### Form Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| Name | Text | Yes | 1–100 characters | Sender's name |
| Email | Email | Yes | Valid email format, ≤254 chars | For admin reply |
| Message | Text | Yes | 10–2000 characters | Message content |

### Validation Rules

- **Name:** Required, 1–100 characters, trimmed
- **Email:** Required, must be valid email format, max 254 characters, converted to lowercase
- **Message:** Required, 10–2000 characters, trimmed

### API Endpoint

**POST** `/api/contact/submit`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "message": "string"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Contact message submitted successfully",
  "id": 789
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    "Name is required (1-100 characters)",
    "Message is required (10-2000 characters)"
  ]
}
```

### Workflow

1. User visits contact page (`/kontakt`)
2. User fills out contact form
3. Frontend validates
4. Frontend sends POST to `/api/contact/submit`
5. Backend validates all fields
6. If valid: Data saved to `contact_submissions` table
7. User sees confirmation message
8. **Admin notification email sent automatically** (non-blocking; see "Admin Notification Emails" below); no automated reply is sent to the person who submitted the form
9. Admin can view submissions in database (note: contact submissions are not exposed in admin UI yet)
10. Admin manually sends reply via official email or other channel

### Database Storage

**Table:** `contact_submissions`

**Stored Columns:**
- id (auto-generated)
- name (text)
- email (text)
- message (text)
- read (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)

**Note:** Unlike event registrations and membership applications, contact submissions do **not enforce unique email addresses**. Multiple messages from the same sender are allowed.

## Admin Notification Emails

All three public forms (Event Registration, Membership Application, Contact) send an
**automatic admin notification email** to the DIDAR admin inbox via Resend immediately
after a successful database insert.

**Key behavior:**
- The database insert happens first and determines the HTTP response (`201` success).
  The notification email is sent **non-blocking** (fire-and-forget with `.catch()`):
  if the email fails to send, the form submission still succeeds for the user and the
  data is still saved — only the email delivery step is skipped, and the failure is
  logged server-side.
- Sender: `noreply@didar-stuttgart.com` (verified domain in Resend, routed through
  `rsend.didar-stuttgart.com`).
- Recipient: the DIDAR admin inbox (configured via environment variable, not a form field).
- Each email includes: form type identification, all submitted fields, the new row's
  database ID (`submissionId`/`registrationId`), and an ISO 8601 timestamp.
- No automated confirmation/reply email is sent to the person who submitted the form —
  the notification email goes only to the DIDAR admin. The admin then contacts the
  person manually, as described in each form's workflow above.
- A rejected duplicate submission (HTTP 409) does **not** trigger a notification email,
  since no new database row is created.
- A submission rejected by validation (HTTP 400) does **not** trigger a notification
  email, for the same reason.

This behavior was verified end-to-end (database row + Resend delivery + Gmail receipt,
including sender, subject, all fields, and matching submission ID/timestamp) for all
three forms during Phase 5 QA.

---

## Rate Limiting

All public forms are protected by rate limiting to prevent spam and abuse.

### Implementation

All three forms (event registration, membership, contact) share a **single global rate limiter per IP address**.

**Default Limits:**
- 10 requests per 60 seconds per IP address

**Configurable via Environment Variables:**
- `RATE_LIMIT_REQUESTS` — Maximum number of requests in the window (default: 10)
- `RATE_LIMIT_WINDOW_MS` — Time window in milliseconds (default: 60000)

**Example .env configuration:**
```env
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
```

### Rate Limit Errors

When a user exceeds the rate limit, the API returns:

**HTTP 429 (Too Many Requests):**
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

The `retryAfter` header (in seconds) indicates how long to wait before retrying.

### How It Works

1. Each request to a form endpoint is identified by the user's IP address
2. The server tracks request timestamps per IP
3. If the IP exceeds RATE_LIMIT_REQUESTS within RATE_LIMIT_WINDOW_MS, subsequent requests are rejected with 429
4. Users receive a Retry-After header telling them when to retry
5. Rate limit counters are cleaned up periodically to prevent memory leaks

### For Deployment

When deploying to production (Vercel, etc.):

- **Single instance:** In-memory rate limiting works fine
- **Multiple instances:** Each instance has its own memory, so rate limits don't coordinate across instances
  - For production with multiple instances, consider deploying a shared rate limiting service (Redis, etc.)
  - OR configure each instance with a high enough limit to accommodate expected traffic

---

## Validation Details

### Email Validation

All forms validate email addresses using a basic regex pattern:
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return emailRegex.test(email) && email.length <= 254;
```

This accepts most valid email addresses. For stricter validation, consider adding a confirmation email step (future enhancement).

### Text Field Trimming

All text fields are trimmed of leading/trailing whitespace before storage:
```javascript
firstName.trim()
```

### Lowercase Email

All email addresses are converted to lowercase before storage:
```javascript
email.toLowerCase()
```

This prevents duplicate entries due to case differences.

---

## Error Handling

### Frontend

Frontend validation provides immediate user feedback:
- Required field indicators
- Real-time validation messages
- Disabled submit button until form is valid

### Backend

Backend validation is **authoritative** and performs the same checks:
- Type checking
- Length validation
- Format validation
- Duplicate prevention

Frontend validation is for UX only; backend validation enforces data integrity.

### User Messages

On validation failure, users see a friendly error message listing which fields have issues.

On success, users see a confirmation message.

---

## Privacy & Data Handling

### Data Minimization

Forms collect only the minimum data needed:
- **Event registration:** Name, email, contact info (phone/Telegram optional)
- **Membership:** Name, email, contact info, interest statement
- **Contact:** Name, email, message

### Transparency

Users see privacy notices on each form explaining:
- What data is collected
- How it will be used
- How long it's kept
- Link to privacy policy

### Manual Contact

No automated emails mean:
- No need for email service providers (Brevo, SendGrid, etc.)
- Admin maintains direct, personal contact with users
- Simpler infrastructure and lower operational complexity

---

## Future Enhancements

Possible improvements (not implemented in current phase):

- Email verification for event registrations
- Automated acknowledgment emails
- File attachment support for contact form
- Category/priority system for contact messages
- Export/archive workflow for old submissions
- Search and filter in admin submission views

---

## Testing

### Manual Testing Checklist

- [ ] Fill out each form with valid data → Should submit and show success
- [ ] Leave required fields blank → Should show validation error
- [ ] Enter invalid email → Should show validation error
- [ ] Enter text longer than allowed → Should show validation error
- [ ] Submit multiple times from same IP within rate limit window → All succeed
- [ ] Submit beyond rate limit → Should get 429 error with Retry-After
- [ ] Test both English and Persian/German versions → Both languages work
- [ ] Mobile & desktop rendering → Forms look good on all sizes

### Load Testing

For rate limiting verification:
```bash
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/contact/submit \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","message":"Test message"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.1
done
```

Should see first ~10 succeed (201), remainder get 429.

---

## API Reference Summary

| Form | Endpoint | Method | Fields | Rate Limit |
|------|----------|--------|--------|------------|
| Event Registration | `/api/registrations/submit` | POST | firstName, lastName, email, phone, telegramId, comment | 10/60s |
| Membership | `/api/memberships/submit` | POST | firstName, lastName, email, phone, telegramId, additionalInfo, privacyAgreed | 10/60s |
| Contact | `/api/contact/submit` | POST | name, email, message | 10/60s |

---

## Related Documentation

- **DATABASE.md** — Schema details for event_registrations, membership_applications, contact_submissions tables
- **SECURITY.md** — Authentication, data privacy, RLS policies
- **ADMIN_GUIDE.md** — How admins review and manage form submissions
- **DEPLOYMENT.md** — Environment variable configuration
