# DATABASE

This document describes the DIDAR website database schema, tables, and data flow.

## Overview

The database is a Supabase PostgreSQL instance with 9 migrations applied in sequence. All tables have Row-Level Security (RLS) policies to ensure data privacy. Public form submissions use SECURITY DEFINER stored procedures to bypass RLS restrictions.

---

## Migration Sequence

Apply migrations in order (they build on each other):

| # | File | Purpose |
|---|------|---------|
| 1 | migration_001_registration_verification.sql | Base schema: events, event_registrations, admin_sessions |
| 2 | migration_002_admin_sessions_rls.sql | Add RLS to admin_sessions, secure admin access |
| 3 | migration_003_supabase_explicit_grants.sql | Grant Supabase service role permissions |
| 4 | migration_004_cms_foundation.sql | Add cms_content table for dynamic content |
| 5 | migration_005_manual_registration_rpc.sql | Create RPC for event registration |
| 6 | migration_006_fix_rpc_error_propagation.sql | Improve RPC error handling |
| 7 | migration_007_membership_application_rpc.sql | Create RPC for membership applications |
| 8 | migration_008_contact_submission_rpc.sql | Create RPC for contact submissions |
| 9 | migration_009_service_role_grants.sql | Final service role permissions |

---

## Database Tables

### 1. events

Stores event definitions with bilingual content and registration settings.

**Columns:**
```sql
id BIGSERIAL PRIMARY KEY
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Bilingual content
title_fa TEXT NOT NULL
title_de TEXT NOT NULL
slug TEXT NOT NULL UNIQUE
description_fa TEXT
description_de TEXT

-- Event metadata
event_date DATE NOT NULL
event_time TIME
location_fa TEXT
location_de TEXT
capacity INT
registration_deadline DATE

-- Status management
registration_open BOOLEAN DEFAULT FALSE (deprecated)
registration_status TEXT DEFAULT 'not_open' CHECK (registration_status IN ('not_open', 'open', 'closed'))
published BOOLEAN DEFAULT FALSE

-- Media
image_url TEXT
```

**Indexes:**
- `id` (primary key)
- `slug` (unique, for URL routing)
- `published` (for listings)
- `event_date` (for sorting)

**RLS Policies:**
- Public: SELECT published events only
- Admin: Full CRUD access

**Status Field Meanings:**
- `not_open` — Event created but registration not yet opened
- `open` — Registration currently open
- `closed` — Registration was open but is now closed

---

### 2. event_registrations

Stores user event registrations (form submissions).

**Columns:**
```sql
id BIGSERIAL PRIMARY KEY
event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE
first_name TEXT NOT NULL
last_name TEXT NOT NULL
email TEXT NOT NULL
phone TEXT
telegram_id TEXT
comment TEXT
status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'declined'))
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Constraints:**
- UNIQUE (event_id, email) — One registration per user per event

**Indexes:**
- `id` (primary key)
- `event_id` (for filtering by event)
- `email` (for duplicate checking)
- `status` (for admin filtering)
- `created_at` (for sorting)

**RLS Policies:**
- Public: INSERT only (via RPC)
- Admin: SELECT, UPDATE

---

### 3. membership_applications

Stores membership application form submissions.

**Columns:**
```sql
id BIGSERIAL PRIMARY KEY
first_name TEXT NOT NULL
last_name TEXT NOT NULL
email TEXT NOT NULL UNIQUE
phone TEXT
telegram_id TEXT
additional_info TEXT
status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'accepted', 'declined'))
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Constraints:**
- UNIQUE (email) — One application per email

**Indexes:**
- `id` (primary key)
- `email` (unique, for duplicate checking)
- `status` (for admin filtering)
- `created_at` (for sorting)

**RLS Policies:**
- Public: INSERT only (via RPC)
- Admin: SELECT, UPDATE

---

### 4. contact_submissions

Stores contact form submissions.

**Columns:**
```sql
id BIGSERIAL PRIMARY KEY
name TEXT NOT NULL
email TEXT NOT NULL
message TEXT NOT NULL
read BOOLEAN DEFAULT FALSE
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Notes:**
- No uniqueness constraint on email (multiple messages from same sender allowed)
- `read` flag tracks if admin has reviewed

**Indexes:**
- `id` (primary key)
- `created_at` (for sorting)
- `read` (for filtering unread submissions)

**RLS Policies:**
- Public: INSERT only (via RPC)
- Admin: SELECT, UPDATE

---

### 5. admin_sessions

Stores active admin session tokens for authentication.

**Columns:**
```sql
id BIGSERIAL PRIMARY KEY
token_hash TEXT NOT NULL UNIQUE
user_id TEXT NOT NULL (fixed value, e.g., "admin")
expires_at TIMESTAMP WITH TIME ZONE NOT NULL
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Indexes:**
- `id` (primary key)
- `token_hash` (unique, for session lookup)
- `expires_at` (for expiration checks)
- `user_id` (for filtering user sessions)

**RLS Policies:**
- Public: Deny all access
- Admin: Full CRUD via authenticated role

**Notes:**
- Session TTL: 24 hours from creation
- Expired sessions not auto-deleted; application should clean up
- Token stored as hash to prevent reading raw tokens from database

---

### 6. cms_content

Stores dynamically editable content for pages.

**Columns:**
```sql
id BIGSERIAL PRIMARY KEY
key TEXT NOT NULL UNIQUE (e.g., "homepage.hero.title")
page TEXT NOT NULL (e.g., "homepage", "about", "membership")
section TEXT NOT NULL (e.g., "hero", "story", "contact_info")
item_type TEXT NOT NULL (e.g., "title", "description", "content")
content_type TEXT NOT NULL (e.g., "text", "long_text", "json")
value TEXT NOT NULL
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Indexes:**
- `id` (primary key)
- `key` (unique, for content lookup)
- `page` (for filtering by page)

**RLS Policies:**
- Public: SELECT only (read content)
- Admin: SELECT, INSERT, UPDATE, DELETE (manage content)

**Example Keys:**
- `homepage.hero.title_de` — Homepage hero title in German
- `homepage.hero.title_fa` — Homepage hero title in Persian
- `about.story.content_de` — About section content in German
- `membership.intro.description_fa` — Membership intro in Persian

---

## Row-Level Security (RLS)

All tables have RLS enabled. Policies are organized by role:

### Public Role (Unauthenticated Users)

- **events:** SELECT only (published events)
- **event_registrations:** INSERT only (via RPC)
- **membership_applications:** INSERT only (via RPC)
- **contact_submissions:** INSERT only (via RPC)
- **admin_sessions:** DENY all
- **cms_content:** SELECT only (read content)

### Admin Role (Authenticated Users)

- **events:** Full CRUD (create, edit, publish, delete)
- **event_registrations:** SELECT, UPDATE (view and update status)
- **membership_applications:** SELECT, UPDATE (view and update status)
- **contact_submissions:** SELECT, UPDATE (view and mark read)
- **admin_sessions:** Full CRUD (manage sessions)
- **cms_content:** Full CRUD (edit content)

### Service Role (Supabase Internal)

- All tables: Full CRUD
- Used by SECURITY DEFINER RPCs to bypass RLS

---

## SECURITY DEFINER Stored Procedures (RPCs)

Public form submissions use RPCs that run with service role permissions:

### insert_event_registration(event_id, first_name, last_name, email, phone, telegram_id, comment)

```sql
-- Validates input
-- Checks for duplicate (event_id + email)
-- Inserts into event_registrations with status='new'
-- Returns registration ID
```

### insert_membership_application(first_name, last_name, email, phone, telegram_id, additional_info)

```sql
-- Validates input
-- Checks for duplicate email
-- Inserts into membership_applications with status='new'
-- Returns application ID
```

### insert_contact_submission_manual(name, email, message)

```sql
-- Validates input
-- Inserts into contact_submissions
-- Returns submission ID
```

---

## Data Relationships

```
events (1) ──── (N) event_registrations
  │
  └─ Bilingual content (title_fa, title_de, etc.)

membership_applications
  └─ Standalone (no foreign keys)

contact_submissions
  └─ Standalone (no foreign keys)

admin_sessions
  └─ Tracks active admin logins

cms_content
  └─ Keyed by page/section/item_type
```

---

## Indexing Strategy

All tables indexed on:
- Primary key (automatic)
- Frequently filtered columns (status, page, section)
- Sort columns (created_at, event_date)
- Unique constraints (email, slug)

---

## Data Retention & Cleanup

### Current Implementation

- No automatic deletion of old submissions
- Admin manually deletes or archives as needed
- Contact submissions stored indefinitely

### Recommended Retention Periods

| Data | Duration | Rationale |
|------|----------|-----------|
| Event registrations | Until event + 30 days | Allow follow-up, then cleanup |
| Membership applications | Until response + 30 days | Allow recontact period |
| Contact submissions | Until response + 14 days | Response period + housekeeping |
| Admin sessions | Auto-expire 24 hours | Security best practice |

**Note:** These are recommendations; actual retention policy should be decided by owner.

---

## Backup & Restore

### Supabase Backups

Supabase automatically backs up the database daily. To restore:
1. Go to Supabase dashboard → Settings → Backups
2. Select a backup date
3. Restore to a new project or overwrite current

### Manual Export

To export data for analysis or archival:
```bash
pg_dump [supabase-connection-string] > backup.sql
```

---

## Migration Example

To add a new column to the events table:

1. Create a migration file: `migration_010_add_category_to_events.sql`
2. Write the ALTER TABLE statement
3. Deploy to Supabase SQL editor
4. Update `data/schema.sql` to reflect new schema

---

## Troubleshooting

### RLS Permission Denied

- Check that user is authenticated (for admin operations)
- Verify session token is valid and not expired
- For public submissions, ensure RPC is used (not direct INSERT)

### Duplicate Key Violation

- For event registrations: Email already registered for this event
- For memberships: Email already has application
- For contact: Only an issue if UNIQUE constraint added

### Foreign Key Constraint Violation

- Deleting event cascades to delete registrations
- Check cascade settings match intended behavior

---

## Performance Notes

- In-memory rate limiter used for form submissions
- No pagination implemented; all queries return full result sets
- Consider adding pagination for large result sets (1000+ rows)
- Database-backed rate limiting (vs. in-memory) recommended for multi-instance deployments

---

## Related Documentation

- **FORMS.md** — Form validation rules, API endpoints
- **SECURITY.md** — RLS policies, data privacy
- **ARCHITECTURE.md** — Database layer design, API integration
