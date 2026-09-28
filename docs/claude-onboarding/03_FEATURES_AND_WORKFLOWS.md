# Features and Workflows

## Core Principle: Manual Review Model

**CRITICAL:** The DIDAR website uses an intentionally MANUAL registration model. There is NO automation:
- NO verification emails
- NO verification tokens / links
- NO automatic confirmations
- NO automatic capacity enforcement
- NO automatic status updates

All user interactions are stored, and admins manually review and respond.

---

## 1. Event System

### Event Listing (`/veranstaltungen`)

**Page:** `pages/veranstaltungen/index.js`

**Data Source:** Fetches published events from Supabase `events` table where `published=true`

**Display:**
- Title (German or Persian depending on language)
- Description excerpt
- Event date
- Image (if available)
- "Register" or "View Details" link

**Filtering:**
- Only shows events with `published=true`
- Events are sorted by date (earliest first or configurable)

---

### Event Detail Page (`/veranstaltungen/[slug]`)

**Page:** `pages/veranstaltungen/[slug].js`

**URL Parameter:** `slug` (e.g., `/veranstaltungen/autumn-gathering`)

**Data Source:** Single event from Supabase where `slug=[slug]` and `published=true`

**Display:**
- Full title (German and Persian)
- Full description (German and Persian)
- Event date and time (if available)
- Location (German and Persian)
- Capacity (displayed as informational text; NOT enforced)
- Registration status indicator (if `registration_status='open'`, show form; otherwise show "Registration not open" message)
- Event image (if available)

**Conditional Content:**
- **If `registration_status='open'`:** Show registration form
- **If `registration_status='not_open'` or `'closed'`:** Show message "Registration not yet open" or "Registration has closed"

---

### Event Registration Form

**Location:** Embedded on event detail page (`/veranstaltungen/[slug]`)

**Visible Only When:** `event.registration_status='open'`

**Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| First Name | Text | Yes | 1–100 characters |
| Last Name | Text | Yes | 1–100 characters |
| Email | Email | Yes | Valid email, ≤254 chars |
| Phone | Text | No | 5–20 characters if provided |
| Telegram ID | Text | No | @ handle or numeric if provided |
| Comment | Text | No | ≤1000 characters |

**Submission Flow:**

1. User fills form on event detail page
2. Frontend validates (required fields, email format, character limits)
3. User clicks "Register" button
4. POST request to `/api/registrations/submit` with form data
5. Backend validates server-side (validation is authoritative; frontend validation is UX-only)
6. Backend calls `insert_event_registration_manual()` RPC with event_id and form fields
7. RPC inserts new row in `event_registrations` with:
   - `event_id` (from page context)
   - `first_name`, `last_name`, `email`, `phone`, `telegram_id`, `comment`
   - `status='new'` (always starts as new)
   - `created_at=NOW()`
8. RPC returns registration ID
9. Backend sends email notification to DIDAR admin (async; errors don't affect registration storage)
10. User sees success message: "Registration submitted successfully. We will contact you soon."
11. Registration data is now in database and waiting for admin review

**Important:** Even if the email notification fails, the registration is saved to the database. The user never needs to retry or re-submit.

---

### Admin Event Management

**Location:** `/admin/events`

**Permissions:** Admin only (session required)

**Operations:**

#### Create Event
- Form: Title (DE/FA), Description (DE/FA), Date, Time, Location (DE/FA), Capacity, Status, Image URL, Publish checkbox
- Stores new row in `events` table with `published=false` and `registration_status='not_open'`

#### Edit Event
- Update all fields above
- Change `registration_status` to control when users can register

#### Delete Event
- Removes event and cascades to delete all related registrations

#### Publish/Unpublish
- Setting `published=true` makes event visible on `/veranstaltungen`
- Setting `published=false` hides event from public (but registrations remain)

---

## 2. Event Registration Admin Workflow

**Admin Dashboard:** `/admin/registrations`

**Permissions:** Admin only (session required)

**View:** Table of all registrations for all events

**Columns Displayed:**
- Submission date
- First name, Last name
- Email, Phone, Telegram
- Event name
- Comment (if any)
- Status (new / contacted / confirmed / declined)

**Admin Actions:**

#### View Registration Details
- Click on registration row
- See full form data including optional comment
- See submission timestamp

#### Update Status
- Change status manually: new → contacted → confirmed/declined
- Status has no automatic transitions; admin must explicitly update

#### Export to CSV
- Download all registrations (or filtered subset) as CSV file

#### Contact User
- No automated email sent from DIDAR
- Admin manually composes email/Telegram/calls user using official DIDAR contact methods
- Status must be manually updated when contact occurs

**Workflow Example:**

1. User submits registration at 2 PM Tuesday → `status='new'` in database
2. Admin sees notification email (separate from registration email)
3. Admin logs into `/admin/registrations`
4. Admin clicks registration, reviews details
5. Admin sends email to user with event logistics
6. Admin updates status to `contacted`
7. User replies confirming attendance
8. Admin updates status to `confirmed` (or to `declined` if user cancels)
9. Event occurs
10. (Optional) Admin archives or marks event complete

---

## 3. Membership System

### Membership Application Form (`/mitglied-werden`)

**Page:** `pages/mitglied-werden.js` (German) or equivalent Persian route

**Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| First Name | Text | Yes | 1–100 characters |
| Last Name | Text | Yes | 1–100 characters |
| Email | Email | Yes | Valid email, ≤254 chars |
| Phone | Text | No | 5–20 characters if provided |
| Telegram ID | Text | No | @ handle or numeric if provided |
| Motivation | Text | Yes | 10–1000 characters (why they want to join) |

**Submission Flow:**

1. User fills form
2. Frontend validates
3. POST to `/api/memberships/submit`
4. Backend calls `insert_membership_application()` RPC
5. RPC inserts row in `membership_applications` table with `status='new'`
6. Admin notification email sent (async, non-blocking)
7. User sees success message
8. Admin sees application in `/admin/memberships`

### Admin Membership Dashboard

**Location:** `/admin/memberships`

**Permissions:** Admin only

**View:** Table of all membership applications

**Columns:**
- Submission date
- First name, Last name
- Email, Phone, Telegram
- Motivation excerpt
- Status (new / reviewed / approved / rejected)

**Admin Actions:**

#### Review Application
- Click to view full motivation
- Decide to approve or reject
- (Optional) Add internal notes

#### Update Status
- Change from `new` → `reviewed` → `approved` or `rejected`

#### Contact User
- Admin manually emails user with decision

#### Export
- Download applications as CSV

---

## 4. Contact Form System

### Public Contact Form (`/kontakt`)

**Page:** `pages/kontakt.js`

**Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Name | Text | Yes | 1–100 characters |
| Email | Email | Yes | Valid email, ≤254 chars |
| Subject | Text | Yes | 1–100 characters |
| Message | Text | Yes | 10–5000 characters |

**Submission Flow:**

1. User fills form
2. Frontend validates
3. POST to `/api/contact/submit`
4. Backend calls `insert_contact_submission()` RPC
5. RPC inserts row in `contact_submissions` table with `status='new'`
6. Admin notification email sent (async)
7. User sees success message: "Message sent. Thank you for contacting us."

### Admin Contact Inbox

**Location:** `/admin/index` (or part of main admin dashboard)

**Permissions:** Admin only

**View:** Recent contact submissions

**Columns:**
- Submission date
- Name, Email
- Subject
- Status (new / read)

**Admin Actions:**

#### View Message
- Click to see full message content

#### Update Status
- Mark as `read` (no automatic marking)

#### Respond
- Admin manually emails user
- No built-in reply system; admin uses their own email

---

## 5. Email Notification System

**Service:** Resend (third-party email API)

**Configuration:** `RESEND_API_KEY` environment variable (server-side)

### Emails Sent

All emails are sent to DIDAR admin, NOT to users (no automated user emails).

#### Event Registration Notification

**Trigger:** User submits event registration form

**Recipient:** Admin email address (set in environment or database)

**Subject:** "New Event Registration: [Event Title]"

**Content:**
- Event name
- Registrant name, email, phone, Telegram
- Any optional comment
- Link to admin dashboard

**Important:** Email is non-blocking. If Resend fails, registration is still saved to database. User doesn't retry or re-submit.

#### Membership Application Notification

**Trigger:** User submits membership application

**Recipient:** Admin email

**Subject:** "New Membership Application: [Applicant Name]"

**Content:**
- Applicant name, email, phone, Telegram
- Motivation text
- Link to admin dashboard

#### Contact Submission Notification

**Trigger:** User submits contact form

**Recipient:** Admin email

**Subject:** "New Contact: [Subject]"

**Content:**
- Sender name, email
- Subject and full message
- Link to admin dashboard

---

## 6. Language and Localization

### Supported Languages
- **Persian (Farsi)** - RTL (right-to-left)
- **German (Deutsch)** - LTR (left-to-right)

### Language Switcher

**Location:** Header on all pages

**Appearance:** Compact pill-shaped toggle with "FA" and "DE" buttons

**Behavior:**
- Clicking button switches language on current page
- Page content updates (Persian or German)
- RTL/LTR layout automatically adjusts
- Language preference stored in URL query param (e.g., `?lang=fa`)

### Content Localization

- All user-facing content stored in `lib/i18n.js` (for static text)
- Dynamic content (events, cms_content) stored bilingually in database
- Components render appropriate language based on `currentLang` hook/context

### RTL/LTR Handling

**Persian (RTL):**
- Text direction: right-to-left
- Layout: right-aligned content
- Flexbox: `flex-direction` may reverse
- Margins/padding: careful about left/right

**German (LTR):**
- Text direction: left-to-right (default)
- Layout: left-aligned content
- Standard CSS applies

### Database Schema for Bilingual Content

Events and CMS content use paired columns:
- `title_fa`, `title_de`
- `description_fa`, `description_de`
- `content_fa`, `content_de`

Frontend fetches data and selects correct language field based on `currentLang`.

---

## 7. Admin Notification Emails (Automatic)

**Important distinction:** DIDAR sends admin notification emails automatically when forms are submitted. These are NOT user-facing automated responses.

**What DIDAR does NOT send:**
- Verification emails
- Verification links / tokens
- Automatic confirmations to users
- Automated capacity reached notices
- Automated status update emails

**What DIDAR DOES send:**
- Admin notification: "New event registration submitted"
- Admin notification: "New membership application"
- Admin notification: "New contact message"

**Admin then manually:**
- Reviews the submission
- Decides action (approve/contact/decline)
- Sends own email response to user
- Updates status in admin dashboard

---

## 8. Key Implementation Files

**Pages:**
- `pages/veranstaltungen/index.js` — Event listing
- `pages/veranstaltungen/[slug].js` — Event detail + registration form
- `pages/mitglied-werden.js` — Membership application form
- `pages/kontakt.js` — Contact form
- `pages/admin/registrations.js` — Admin registration dashboard
- `pages/admin/memberships.js` — Admin membership dashboard

**API Routes:**
- `pages/api/registrations/submit.js` — Event registration submission
- `pages/api/memberships/submit.js` — Membership submission
- `pages/api/contact/submit.js` — Contact submission
- `pages/api/admin/registrations/index.js` — Fetch registrations (admin)
- `pages/api/admin/memberships/index.js` — Fetch memberships (admin)
- `pages/api/admin/registrations/export.js` — Export registrations CSV

**Libraries:**
- `lib/email.js` — Resend email helper
- `lib/admin-email.js` — Notification email templates
- `lib/validation.js` — Form field validation
- `lib/i18n.js` — Bilingual content and language switching

