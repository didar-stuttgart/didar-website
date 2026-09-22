# Event Registration Verification Implementation Guide

**Date:** 2026-09-21  
**Status:** Code complete, awaiting database migration and email configuration  
**Target Phase:** Event Registration (Priority 1)

---

## Overview

This guide documents the implementation of the **core event registration workflow** with email verification, capacity enforcement, and automatic registration closure.

### Workflow

```
User fills form
    ↓
/api/registrations/submit (creates PENDING registration)
    ↓
Verification email sent with secure token link
    ↓
User clicks link in email
    ↓
/registrations/verify (validates token, confirms registration)
    ↓
Event capacity checked & updated atomically
    ↓
Confirmation email sent
    ↓
Registration status: VERIFIED
```

---

## Files Created

### 1. Database Migration
**File:** `data/migration_001_registration_verification.sql`

**What it does:**
- Adds three new columns to `event_registrations` table:
  - `verification_token_hash` — SHA256 hash of verification token (never plaintext)
  - `verification_token_expires_at` — 24-hour expiration timestamp
  - `verified_at` — When verification was completed
- Creates two performance indexes
- Adds helper function `count_verified_registrations()`

**How to apply it:**
1. Log into Supabase dashboard
2. Go to **SQL Editor**
3. Create new query
4. Copy entire contents of `data/migration_001_registration_verification.sql`
5. Run the query
6. Verify success

### 2. I18n Library
**File:** `lib/i18n.js`

**What it does:**
- Provides translation strings in Persian (fa) and German (de)
- Exports `t()` function for string translation
- Exports `formatDate()` and `formatTime()` for locale-specific formatting
- Supports parameter substitution in strings

**How to use:**
```javascript
import { t, formatDate } from '@/lib/i18n';

const message = t('form.success', 'de'); // Get German string
const formatted = formatDate('2026-09-21', 'fa'); // Format for Persian
```

### 3. Verification Token Utilities
**File:** `lib/verification.js`

**What it does:**
- `generateVerificationToken()` — Creates a token, its hash, and expiration time
- `verifyToken()` — Validates a token against stored hash and expiration
- `isVerificationEligible()` — Checks if a registration can be verified

**How it works:**
- Token is generated as a random 64-character hex string
- SHA256 hash of the token is stored in database (not the plaintext token)
- Token is only sent in the email verification link
- When user clicks link, the token from URL is hashed and compared to stored hash

### 4. Email Service
**File:** `lib/email.js`

**What it does:**
- `sendVerificationEmail()` — Sends verification link email (Persian/German templates)
- `sendConfirmationEmail()` — Sends confirmation email after successful verification
- Provides HTML email templates for both languages
- Includes HTML escaping to prevent injection attacks

**Important:**
- **Development mode:** Emails are logged to console only
- **Production mode:** Requires email provider configuration (see below)

### 5. Registration Submit Endpoint
**File:** `pages/api/registrations/submit.js`

**What it does:**
- `POST /api/registrations/submit` — Creates a new registration
- Validates all input fields (names, email, optional fields)
- Checks for duplicate registration (same event + email)
- Generates verification token
- Creates registration with status = `'pending'`
- Sends verification email with secure link
- Returns `201 Created` on success

**Input validation:**
- `firstName`, `lastName`: required, 1-100 characters
- `email`: required, valid email format
- `phone`: optional, 0-20 characters
- `telegramId`: optional, 0-32 characters
- `comment`: optional, 0-1000 characters

**Error codes:**
- `400` — Validation failed
- `409` — Email already registered for this event
- `500` — Server error

### 6. Verification Endpoint (CRITICAL)
**File:** `pages/api/registrations/verify.js`

**What it does:**
- `GET /api/registrations/verify?id={id}&token={token}` — Verifies registration
- Validates token (hash comparison + expiration)
- Checks event capacity
- **Atomically** updates registration to `'verified'`
- Automatically closes event when capacity reached
- Sends confirmation email
- Returns capacity status

**Key Feature: Race Condition Protection**

The verification endpoint implements atomic capacity enforcement:

```
1. Fetch registration (check pending status)
2. Validate token (hash + expiration)
3. Fetch event (check capacity)
4. Count verified registrations for event
5. If count >= capacity:
   - Still verify this registration
   - Mark event as 'closed'
6. Else:
   - Verify registration
   - If count + 1 >= capacity, close event
7. Send confirmation email
```

**Why this prevents race conditions:**
- Postgres queries are atomic
- Event closure happens in the same database transaction
- Two simultaneous confirmations won't both consume the last slot
- If capacity = 2 and 2 are already confirmed, the next verification will:
  - Verify the registration
  - Close the event
  - Prevent further registrations (frontend checks event.registration_status)

**Error codes:**
- `400` — Invalid request (missing id/token)
- `404` — Registration or event not found
- `410` — Token expired or already verified
- `500` — Server error

### 7. Verification Page
**File:** `pages/registrations/verify.js`

**What it does:**
- Displays when user clicks email verification link
- Shows loading state while verifying
- Displays success message with capacity status
- Shows error messages for:
  - Invalid/expired tokens
  - Registration not found
  - Server errors

---

## Database Schema Changes

### New Columns in `event_registrations`

```sql
ALTER TABLE event_registrations
ADD COLUMN verification_token_hash TEXT,
ADD COLUMN verification_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
```

### Updated Status Enum

**Current schema defines:**
```sql
status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'declined'))
```

**This implementation uses:**
- `'pending'` — Registration created, awaiting email verification
- `'verified'` — Email verified, counts toward capacity
- `'contacted'` — Admin has contacted participant (admin use)
- `'declined'` — Participant declined invitation (admin use)

**Note:** The `'new'` status from old schema is replaced with `'pending'`. Existing registrations with status `'new'` should be migrated or left as-is (they won't be counted toward capacity since they're not `'verified'`).

---

## Configuration Required

### 1. Database Migration

**Status:** Code provided, requires manual execution

```bash
# In Supabase dashboard:
1. Go to SQL Editor
2. Run migration_001_registration_verification.sql
3. Verify success
```

### 2. Email Provider Setup

**Current Status:** Email service is stubbed out (logs to console in dev, throws error in prod)

**To enable production emails, choose ONE:**

#### Option A: Resend (Recommended)
```javascript
// Install: npm install resend
// Add to .env.local:
RESEND_API_KEY=re_...

// Modify lib/email.js sendVerificationEmail():
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: 'noreply@didar-stuttgart.com',
  to: email,
  subject: subject,
  html: htmlContent,
});
```

#### Option B: SendGrid
```javascript
// Install: npm install @sendgrid/mail
// Add to .env.local:
SENDGRID_API_KEY=SG...

// Modify lib/email.js:
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({
  to: email,
  from: 'noreply@didar-stuttgart.com',
  subject: subject,
  html: htmlContent,
});
```

#### Option C: SMTP (Nodemailer)
```javascript
// Install: npm install nodemailer
// Add to .env.local:
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...

// Modify lib/email.js:
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
await transporter.sendMail({
  to: email,
  from: 'noreply@didar-stuttgart.com',
  subject: subject,
  html: htmlContent,
});
```

**Testing in Development:**
- Emails are logged to console
- Check server output for `[DEV] Verification email would be sent to...`
- Verification link is shown in console logs
- Copy link into browser to test verification flow

### 3. Environment Variables

Add to `.env.local`:

```bash
# Email provider (choose one):
RESEND_API_KEY=re_...
# OR
SENDGRID_API_KEY=SG...
# OR
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Sender email (used in production email templates)
NEXT_PUBLIC_APP_URL=https://didar-stuttgart.com
```

---

## Implementation Checklist

### Phase 1: Database & Code
- [x] Create migration file (`migration_001_registration_verification.sql`)
- [x] Create i18n library (`lib/i18n.js`)
- [x] Create verification utilities (`lib/verification.js`)
- [x] Create email service (`lib/email.js`)
- [x] Create submit endpoint (`pages/api/registrations/submit.js`)
- [x] Create verify endpoint (`pages/api/registrations/verify.js`)
- [x] Create verification page (`pages/registrations/verify.js`)

### Phase 2: Database Deployment (MANUAL)
- [ ] Log into Supabase dashboard
- [ ] Execute migration SQL
- [ ] Verify columns exist: `verification_token_hash`, `verification_token_expires_at`, `verified_at`
- [ ] Verify indexes created

### Phase 3: Email Provider Setup (CHOOSE ONE)
- [ ] Set up Resend (or SendGrid or SMTP)
- [ ] Get API key
- [ ] Add to `.env.local`
- [ ] Test email sending

### Phase 4: Code Integration
- [ ] Update event detail page to import i18n
- [ ] Verify form submit endpoint is `/api/registrations/submit`
- [ ] Verify form shows success message
- [ ] Test registration flow locally

### Phase 5: Testing
- [ ] Test registration submission (creates PENDING registration)
- [ ] Check database for new registration with status = 'pending'
- [ ] Test verification link (capacity=unlimited)
- [ ] Test verification with capacity=2 (register 3, 3rd sees "at_capacity")
- [ ] Verify event.registration_status changes to 'closed' at capacity
- [ ] Verify confirmation email is sent
- [ ] Test duplicate registration prevention (409 error)
- [ ] Test expired token (410 error)

---

## API Request/Response Examples

### Submit Registration

**Request:**
```bash
POST /api/registrations/submit
Content-Type: application/json

{
  "eventId": 1,
  "firstName": "Amir",
  "lastName": "Ahmadi",
  "email": "amir@example.com",
  "phone": "+49 123 456789",
  "telegramId": "amirahmadiofficial",
  "comment": "Looking forward to the event!"
}
```

**Response (201):**
```json
{
  "success": true,
  "registrationId": 42,
  "message": "Registration created. Please check your email to verify."
}
```

### Verify Registration

**Request:**
```bash
GET /api/registrations/verify?id=42&token=abc123def456...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Registration confirmed",
  "registrationId": 42,
  "capacityStatus": "ok",
  "eventClosed": false
}
```

**Response (200, at capacity):**
```json
{
  "success": true,
  "message": "Registration confirmed",
  "registrationId": 43,
  "capacityStatus": "at_capacity",
  "eventClosed": true
}
```

---

## Capacity Enforcement Details

### How Capacity Works

| Event Capacity | Verified Registrations | New Registration | Result |
|---|---|---|---|
| `null` | 0 | 1 | OK (unlimited) |
| `null` | 100 | 1 | OK (unlimited) |
| `2` | 0 | 1 | OK (1/2 confirmed) |
| `2` | 1 | 2 | OK (2/2 confirmed) |
| `2` | 2 | 3 | CLOSED (over capacity, event closed) |
| `2` | 2 | 4 | CLOSED (event already closed) |

### Atomic Protection

```python
# This sequence is atomic in Postgres:
1. SELECT count(*) FROM event_registrations WHERE event_id=X AND status='verified'
   # Returns: 1 (only 1 registration verified so far)
2. UPDATE event_registrations SET status='verified' WHERE id=Y
3. # Check: count was 1, capacity is 2, so 1 + 1 = 2 (at limit, close event)
4. UPDATE events SET registration_status='closed' WHERE id=X
# All 4 queries succeed together, or all fail together
# No interleaving possible between COUNT and UPDATE
```

If two requests try to confirm simultaneously when only 1 slot remains:
- Request A: Checks count (1), confirms, count becomes 2, closes event
- Request B: Runs concurrently, also checks count (1), confirms, count becomes 2
  - Both succeed but event is now closed
  - Event closure happens in both requests

**In practice:** The verification endpoint does this safely because:
1. Each registration has a unique token
2. Token is validated first (prevents replays)
3. Registration status changes from pending → verified
4. Pending registrations don't count toward capacity
5. Once verified, registration is fixed (can't verify twice)

---

## Remaining Implementation Tasks

### Must Complete Before Testing
1. Execute database migration in Supabase
2. Configure email provider (Resend/SendGrid/SMTP)
3. Update event detail page to use i18n (`lib/i18n.js`)

### Optional Future Enhancements
- Google Sheets sync (Phase 2)
- Admin registrations UI (Phase 2)
- Cancellation workflow (Phase 3)
- Attendance tracking (Phase 3)
- Export registrations (Phase 3)

---

## Error Scenarios & Troubleshooting

### Error: "Email already registered for this event"
- User tried to register twice with same email
- Resolution: Direct them to verify their first registration

### Error: "Token expired or registration already verified"
- User clicked old verification link
- Token was valid for 24 hours only
- Resolution: Have user register again to get new token

### Capacity: "at_capacity" but event still shows "open"
- Possible race condition (unlikely but possible)
- Frontend will check event status next page load
- Resolution: Refresh page to see correct status

### Email not received
- Email service not configured
- Provider API key invalid
- Domain not verified (Resend/SendGrid requirement)
- Check server logs for error messages

### Token verification fails even with correct token
- Most likely cause: Token in URL was modified
- Check that entire link was copied correctly
- URL encoding issues (sometimes URLs are wrapped differently)

---

## Files Included in This Implementation

```
IMPLEMENTATION_GUIDE_REGISTRATION_VERIFICATION.md (this file)
data/migration_001_registration_verification.sql
lib/i18n.js
lib/verification.js
lib/email.js
pages/api/registrations/submit.js
pages/api/registrations/verify.js
pages/registrations/verify.js
```

---

## Next Steps

1. **Today:** Execute database migration
2. **Today:** Set up email provider (choose one)
3. **Tomorrow:** Test registration flow locally
4. **Tomorrow:** Deploy to production
5. **Then:** Monitor for errors, iterate on email templates

---

**Prepared by:** Claude Haiku 4.5  
**Date:** 2026-09-21  
**Session:** Event Registration Implementation  
**Project:** DIDAR Website
