# ADMIN GUIDE

This guide walks you through the DIDAR admin dashboard features and how to manage events, registrations, memberships, and website content.

---

## Accessing the Admin Dashboard

### Login

1. Visit `https://didar-stuttgart.de/admin/login` (or local `http://localhost:3000/admin/login`)
2. Enter your admin password
3. Click "Login"
4. You are logged in for 24 hours
5. Bookmark `/admin` for quick access

### Session Duration

- **Login duration:** 24 hours from login
- **If session expires:** You'll be redirected to login page
- **For security:** Always log out on public computers

---

## Dashboard Overview

**URL:** `/admin`

The dashboard shows:
- Pending counts (new registrations, memberships, contact messages)
- Recent activity
- Quick links to management pages

### Key Metrics

- New event registrations (count)
- New membership applications (count)
- New contact messages (count)
- Upcoming events (next 7 days)
- Recent submissions (by type)

---

## Event Management

### Viewing Events

**URL:** `/admin/events`

Shows all events (published and unpublished) in a sortable list.

**Columns:**
- Event date
- Title (German)
- Title (Persian)
- Registration status
- Published status
- Actions

### Creating an Event

**Click:** "Create Event" button

**Form fields:**

| Field | Required | Notes |
|-------|----------|-------|
| Title (German) | Yes | Event name in German |
| Title (Persian) | Yes | Event name in Persian |
| Description (German) | No | Event description in German |
| Description (Persian) | No | Event description in Persian |
| Date | Yes | When the event occurs |
| Time | No | Event time (optional) |
| Location (German) | No | Venue in German |
| Location (Persian) | No | Venue in Persian |
| Capacity | No | Number of attendees (informational) |
| Image URL | No | Full URL to event image |
| Registration Status | Yes | not_open / open / closed |
| Publish | No | Checkbox to publish event |

**Steps:**
1. Fill in all required fields
2. Set registration status to "not_open" (unless opening immediately)
3. Uncheck "Publish" if you want to preview first
4. Click "Create Event"
5. Event appears in event list
6. Edit later to publish when ready

### Editing an Event

**Click:** Event row in list

**Allowed changes:**
- Title, description, location (all languages)
- Date, time
- Capacity
- Image URL
- Registration status
- Published status

**Steps:**
1. Click event title to edit
2. Update fields as needed
3. Click "Save Changes"
4. Changes take effect immediately

### Publishing an Event

**From event edit page:**
1. Check "Publish" checkbox
2. Click "Save Changes"
3. Event now appears in public `/veranstaltungen` listing
4. Users can see event and register

### Unpublishing an Event

1. Uncheck "Publish" checkbox
2. Click "Save Changes"
3. Event hidden from public (existing registrations remain)

### Changing Registration Status

**During event creation or editing:**

- **not_open** — Registration not yet available (event created but not yet accepting signups)
- **open** — Registration currently open (users can register)
- **closed** — Registration closed (event happened, or signup window passed)

**Steps:**
1. Click event to edit
2. Change "Registration Status" dropdown
3. Click "Save Changes"
4. Status updates immediately

### Deleting an Event

**Click:** "Delete" button on event

**Warning:** This cascades to delete all registrations for that event.

---

## Registration Management

### Viewing Registrations

**URL:** `/admin/registrations`

Shows all event registrations in a list.

**Columns:**
- User name
- Email
- Event
- Submission date
- Status
- Actions

**Filtering:**
- Filter by event (dropdown)
- Filter by status (new, contacted, confirmed, declined)

**Sorting:**
- Click column header to sort by that column

### Reviewing a Registration

**Click:** Registration row to view details

**What you see:**
- First name, last name
- Email address
- Phone (if provided)
- Telegram ID (if provided)
- Comments (if provided)
- Event details
- Status
- Submission timestamp

### Updating Registration Status

**From registration detail page:**

1. Click "Status" dropdown (shows: new, contacted, confirmed, declined)
2. Select new status
3. Click "Save"
4. Status updates immediately

**Status meanings:**
- **new** — Just received, not yet reviewed
- **contacted** — Admin has reached out to user
- **confirmed** — User confirmed attendance
- **declined** — User declined or will not attend

### Contacting Users

**Outside the admin dashboard:**

Users' contact info available:
- Email (always)
- Phone (if provided)
- Telegram (if provided)

**Steps:**
1. Note user's contact info
2. Send email via your email client (not in admin dashboard)
3. Or message via Telegram
4. Or call if phone provided
5. Update registration status to "contacted" when done

### Exporting Registrations

**Click:** "Export to CSV" button

**What you get:**
- CSV file with all registrations (or filtered set)
- Columns: name, email, phone, telegram, event, date, status, comments
- Open in Excel or Google Sheets

**Uses:**
- Create mail-merge for emails
- Import into CRM or contact management
- Share registrations with co-organizers
- Backup for records

---

## Membership Application Management

### Viewing Applications

**URL:** `/admin/memberships`

Shows all membership applications.

**Columns:**
- Applicant name
- Email
- Application date
- Status
- Actions

### Reviewing an Application

**Click:** Application row to view details

**What you see:**
- First name, last name
- Email address
- Phone (if provided)
- Telegram ID (if provided)
- Additional info (if provided)
- Application timestamp
- Status

### Updating Application Status

**From application detail page:**

1. Click "Status" dropdown (shows: new, contacted, accepted, declined)
2. Select new status
3. Click "Save"

**Status meanings:**
- **new** — Application received, not yet reviewed
- **contacted** — Admin has reached out to applicant
- **accepted** — Applicant accepted for membership
- **declined** — Applicant not accepted

### Contacting Applicants

**Outside the admin dashboard:**

1. Note applicant's contact info (email, phone, Telegram)
2. Send email or message to confirm their interest
3. Explain membership benefits, costs, requirements
4. Update status to "contacted" when done
5. Update to "accepted" or "declined" when decision made

### Exporting Applications

**Click:** "Export to CSV" button

**CSV contents:**
- Name, email, phone, telegram, additional info
- Application date, status

---

## Content Management (CMS)

### Accessing CMS

**URL:** `/admin/content`

Edit website content without touching HTML.

**Currently editable sections:**
- Homepage hero text
- About page content
- Membership page intro
- Contact info
- Social media links

### Editing Content

**Steps:**

1. Go to `/admin/content`
2. Select page from dropdown (Homepage, About, Membership, etc.)
3. Select section (Hero, Story, Contact, etc.)
4. Enter content in text editor
5. Click "Save"

**Languages:**
- Content can be edited in German and Persian separately
- Each language has its own text field

**Important:**
- Changes take effect immediately on public website
- Preview before publishing (by visiting public page)

---

## Settings

### Accessing Settings

**URL:** `/admin/settings`

Configure organization info visible on website.

### Available Settings

| Setting | Default | Notes |
|---------|---------|-------|
| Organization Name | DIDAR | Shown in footer and headers |
| Contact Email | info@didar-stuttgart.com | Displayed on contact page |
| Phone | [configured] | Shown in footer |
| Telegram Handle | [configured] | Link in header |
| Instagram URL | [configured] | Link in header |
| Address | [configured] | Shown in footer |

### Updating Settings

**Steps:**

1. Go to `/admin/settings`
2. Edit fields as needed
3. Click "Save Settings"
4. Changes appear on website within minutes

---

## Contact Messages

**Note:** Contact form submissions are saved to the database but not yet exposed in the admin UI. To view contact messages:

1. Contact the developer or project owner
2. Or access Supabase dashboard directly
3. Query `contact_submissions` table

**Future enhancement:** Admin UI page for contact message review.

---

## Dashboard Statistics

The admin dashboard shows quick metrics:

- **New Registrations** — Count of registrations with status='new'
- **New Memberships** — Count of applications with status='new'
- **New Contacts** — Count of submissions (if accessible)
- **Upcoming Events** — Events with event_date in next 7 days
- **Recent Activity** — Latest submissions by type and date

---

## Best Practices

### Daily Workflow

1. **Morning:** Check dashboard for pending counts
2. **Review:** Click on "new" registrations/memberships
3. **Contact:** Send emails/messages to new applicants
4. **Update:** Mark as "contacted" when done
5. **Decide:** Update to "confirmed" or "declined" after response

### Weekly Workflow

1. **Events:** Create upcoming events
2. **Publish:** Turn on registration for events opening next week
3. **Archive:** Unpublish or archive past events
4. **Export:** Back up registrations as CSV
5. **Report:** Review stats and activity

### Before Events

1. **1 week before:** Confirm attendance with all registrants
2. **3 days before:** Final headcount check
3. **1 day before:** Prepare registration list for on-site use
4. **Export:** CSV with names for check-in

### After Events

1. **Next day:** Update status of no-shows to "declined"
2. **Thank yous:** Send thank-you message to attendees
3. **Archive:** Unpublish event from public listing
4. **Keep:** Maintain record in database for history

---

## Troubleshooting

### Can't Log In

- **Forgot password?** Contact project owner to reset
- **Browser cookies?** Clear cache and try again
- **Session expired?** Happens after 24 hours; log in again

### Changes Don't Appear on Website

- **Give it a minute:** Dynamic pages cache content
- **Clear browser cache:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- **Check publish status:** Make sure event/content is published

### Can't Find a Registration

- **Check filters:** Filter might be hiding it
- **Search by name:** Use browser find (Ctrl+F) in registration list
- **Check date range:** Registration might be from past event

### User Registered Twice

- **Same email for same event?** System prevents this
- **Different email?** User used different email each time
- **Solution:** Contact user to confirm which registration is correct

---

## Related Documentation

- **EVENTS_AND_REGISTRATION.md** — Event lifecycle, registration workflow
- **FORMS.md** — Form validation rules, API details
- **DEPLOYMENT.md** — Deployment and environment setup
