# EVENTS AND REGISTRATION

This document describes the event lifecycle and manual event registration workflow.

## Overview

Events are created and managed by admins. Users can register for events through a public form. The entire workflow is manual: no automated emails, no verification links, no waitlists. Admins review registrations and contact users directly.

---

## Event Lifecycle

### 1. Create Event

**Admin action:** `/admin/events` → Create Event

**Form fields:**
- Title (German & Persian)
- Description (German & Persian)
- Date
- Time (optional)
- Location (German & Persian)
- Capacity (informational only, not enforced)
- Registration status (not_open / open / closed)
- Image URL
- Publish (checkbox)

**Database result:** New row in `events` table with `published=false`, `registration_status='not_open'`

### 2. Configure Registration

**Admin action:** Edit event details

**Registration status options:**
- **not_open** — Event created, registration not yet available
- **open** — Registration currently open
- **closed** — Registration was open but is now closed

**Capacity:** Displayed on event page but not enforced. Users can register even if capacity is reached.

### 3. Publish Event

**Admin action:** Check "Publish" checkbox, save

**Database result:** `published=true`

**Effect:** Event appears in `/veranstaltungen` listing and has its own detail page at `/veranstaltungen/[slug]`

### 4. User Registration Period

**Users can register:** Click event → Fill registration form → Submit

**Workflow:**
1. User visits `/veranstaltungen/[slug]`
2. User fills event registration form
3. User clicks submit
4. Form data POST to `/api/registrations/submit`
5. Backend validates, saves to database with `status='new'`
6. **No automated email sent**
7. User sees confirmation message
8. Registration appears in admin dashboard

### 5. Admin Review

**Admin action:** `/admin/registrations` → View registrations for event

**What admin sees:**
- User name, email, phone, Telegram
- Any optional comments
- Status (new, contacted, confirmed, declined)
- Submission date
- Download CSV export

**Admin actions:**
- Click registration to view details
- Update status (new → contacted → confirmed/declined)
- Export registrations to CSV

### 6. Admin Contacts User

**Outside the website:** Admin uses email/Telegram/phone to contact registrant

**Admin message might say:**
- Event details confirmed
- Location, date, time
- What to bring
- Questions or special requests

**Registration status updated manually:**
- "contacted" — Admin has reached out
- "confirmed" — User confirmed attendance
- "declined" — User declined or no response

### 7. Event Occurs

Event happens on scheduled date/time.

### 8. Archive Event

**Admin action (optional):** Edit event → Toggle "archived" (if implemented)

**Effect:** Event no longer appears in public listing but remains in database for historical records

---

## Registration Form

### Fields

| Field | Required | Validation |
|-------|----------|-----------|
| First Name | Yes | 1–100 characters |
| Last Name | Yes | 1–100 characters |
| Email | Yes | Valid email format |
| Phone | No | 5–20 characters if provided |
| Telegram ID | No | @ handle or numeric if provided |
| Comment | No | ≤1000 characters |

### Duplicate Prevention

- Users cannot register twice for the same event with the same email
- Attempting duplicate returns validation error
- User must use different email or clear previous registration (admin action)

### API Endpoint

**POST** `/api/registrations/submit`

**Validation:**
- Required fields: firstName, lastName, email
- Email format validation
- Phone length: 5–20 if provided
- Telegram: @ prefix or numeric if provided
- Comment: ≤1000 chars if provided

**Database:**
- Stored in `event_registrations` table
- Marked with `status='new'`
- Associated with correct event via `event_id`

**Response:**
- 201 (success) with registration ID
- 400 (validation error) with error details
- 429 (rate limit exceeded) with Retry-After

---

## Registration Status Workflow

### Status Transitions

```
new
  ↓ (admin action: "I've contacted this person")
contacted
  ├─→ confirmed (user confirmed attendance)
  └─→ declined (user declined or no response)
```

### Status Meanings

- **new** — Registration received, not yet reviewed
- **contacted** — Admin has reached out to user
- **confirmed** — User confirmed attendance
- **declined** — User declined or no longer attending

---

## Event Registration Status vs. User Registration Status

**Two different status fields:**

### Event Registration Status (event.registration_status)

Refers to the event itself:
- **not_open** — Event created, signup window not yet open
- **open** — Signup is currently open
- **closed** — Signup window has closed

### User Registration Status (event_registrations.status)

Refers to individual user registrations:
- **new** — Submitted but not reviewed
- **contacted** — Admin has been in touch
- **confirmed** — Attendance confirmed
- **declined** — Not attending or no response

---

## Capacity & Overflow

### Current Implementation

- Capacity field is **informational only**
- No automatic capacity enforcement
- Users can register even if event is full
- No waitlist system

### Admin Handling

If event reaches capacity:
1. Admin manually stops processing new registrations
2. Admin contacts subsequent registrants to offer alternatives
3. Admin manually marks overflow registrations as "declined"

### Future Enhancement

A future version could:
- Automatically enforce capacity limits
- Implement automatic waitlist
- Send acknowledgment emails
- Auto-confirm registrations up to capacity

---

## Email Verification (Disabled)

### Current Status

The endpoint `/api/registrations/verify` is **disabled and returns HTTP 404**.

### Why Disabled

Email verification links:
- Require transactional email service
- Complicate user workflow
- Unnecessary for manual contact model

### Current Workflow

No verification needed:
1. User submits form with email
2. Admin reviews registration
3. Admin contacts user directly via email/Telegram/phone
4. Admin confirms details and attendee status

---

## Admin Dashboard Features

### Registration List

- View all registrations for all events
- Filter by event
- Filter by status (new, contacted, confirmed, declined)
- Sort by submission date, name
- Search by name or email

### Individual Registration

- Click to view full details
- All submitted fields displayed
- Update status with dropdown
- Add notes or comments (if implemented)

### Bulk Operations

- Export to CSV (all registrations, or filtered subset)
- Useful for:
  - External communication tools (mail merge, etc.)
  - Personal records
  - Sharing with co-organizers

---

## Data Privacy

### What's Collected

- Name, email, phone (optional), Telegram (optional), comment (optional)
- Associated event
- Submission timestamp

### How It's Used

- Admin contacts registrant about event details
- No email list sold or shared externally
- Retained per owner's data retention policy

### User Rights

- No built-in data export or deletion (future enhancement)
- Currently: Contact admin to request data deletion

---

## Troubleshooting

### User Gets "Already Registered" Error

- User already registered for this event with same email
- User must:
  - Use different email, OR
  - Contact admin to remove old registration

### Admin Can't See Registration

- Ensure event is published (unpublished events can't receive registrations)
- Check event registration status is "open"
- Verify registration status is not "new" — filter might be hiding it

### Capacity Shows as Full

- Capacity is informational; users can still register
- If actual capacity reached, admin must manually:
  - Stop offering the event
  - Contact overflow registrants
  - Mark as "declined" with explanation

---

## Best Practices

### For Admins

1. Check registrations daily during signup period
2. Contact registrants within 48 hours of signup
3. Confirm attendance 1 week before event
4. Export registrations for event-day reference
5. Archive or document registrations after event
6. Respond to special requests (dietary needs, accessibility, etc.)

### For Users

1. Register with correct email and name
2. Include relevant information in comment (special needs, etc.)
3. Respond promptly when admin contacts
4. Confirm attendance by deadline

---

## Related Documentation

- **FORMS.md** — Registration form validation and API details
- **ARCHITECTURE.md** — Database schema for event_registrations
- **ADMIN_GUIDE.md** — Admin dashboard walkthrough
- **DATABASE.md** — event_registrations table schema
