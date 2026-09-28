# Database and Authentication

## Supabase Architecture

The DIDAR backend uses **Supabase** (PostgreSQL + managed API layer) hosted on Supabase.com.

- **Database:** PostgreSQL
- **Auth Model:** Row-Level Security (RLS) policies restrict data access by role
- **Public forms:** Use SECURITY DEFINER RPC functions to bypass RLS and insert data
- **Admin access:** Requires database-backed session token stored in `admin_sessions` table

**Important:** Three different Supabase clients are used depending on context:
- **Public client** (publishable key): Used on client-side; subject to RLS
- **Server client** (publishable key): Used in API routes for public form submissions; subject to RLS
- **Admin client** (secret key): Used in admin API routes ONLY after verifying session; bypasses RLS

## Database Tables

### Core Tables

#### `events`
Stores event definitions with bilingual content.

**Key Columns:**
- `id` (BIGSERIAL PRIMARY KEY)
- `title_fa`, `title_de` (event names in Persian/German)
- `description_fa`, `description_de`
- `slug` (URL-friendly identifier; UNIQUE)
- `event_date` (DATE)
- `event_time` (TIME, optional)
- `location_fa`, `location_de`
- `capacity` (INT; informational only, NOT enforced)
- `registration_status` (TEXT) - values: 'not_open', 'open', 'closed'
- `published` (BOOLEAN) - if false, event doesn't appear on public website
- `image_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

**RLS Policy:** Public can SELECT published events only. Admin has full CRUD.

**Important Note on Capacity:** The `capacity` field is displayed on the event page as informational text only. Users can register even if registrations exceed capacity. Capacity is NOT automatically enforced by the system.

---

#### `event_registrations`
Stores user event registration form submissions.

**Key Columns:**
- `id` (BIGSERIAL PRIMARY KEY)
- `event_id` (BIGINT, foreign key to events.id)
- `first_name`, `last_name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT, optional)
- `telegram_id` (TEXT, optional)
- `comment` (TEXT, optional)
- `status` (TEXT) - values: 'new', 'contacted', 'confirmed', 'declined'
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

**RLS Policy:** Public cannot read or write directly. All access via `insert_event_registration_manual()` RPC function.

**Status Field:**
- `new` — Registration just submitted, admin has not yet contacted user
- `contacted` — Admin has reached out to user
- `confirmed` — User confirmed attendance
- `declined` — User declined or did not respond

---

#### `membership_applications`
Stores membership application form submissions.

**Key Columns:**
- `id` (BIGSERIAL PRIMARY KEY)
- `first_name`, `last_name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT, optional)
- `telegram_id` (TEXT, optional)
- `motivation` (TEXT; why they want to join)
- `status` (TEXT) - values: 'new', 'reviewed', 'approved', 'rejected'
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

**RLS Policy:** Public cannot read or write directly. All access via `insert_membership_application()` RPC function.

---

#### `contact_submissions`
Stores public contact form submissions.

**Key Columns:**
- `id` (BIGSERIAL PRIMARY KEY)
- `name` (TEXT)
- `email` (TEXT)
- `subject` (TEXT)
- `message` (TEXT)
- `status` (TEXT) - values: 'new', 'read'
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

**RLS Policy:** Public cannot read or write directly. All access via `insert_contact_submission()` RPC function.

---

#### `admin_sessions`
Stores active admin session tokens (database-backed sessions).

**Key Columns:**
- `id` (BIGSERIAL PRIMARY KEY)
- `admin_id` (BIGINT, foreign key to admins.id)
- `token_hash` (TEXT, UNIQUE) - SHA256 hash of the session token (NOT the plaintext token)
- `expires_at` (TIMESTAMP WITH TIME ZONE)
- `created_at` (TIMESTAMP WITH TIME ZONE)

**RLS Policy:** Admin-only. Users cannot access.

**Important:** Only token HASHES are stored, never plaintext tokens. When validating a session, the server hashes the incoming token and compares against stored hashes.

---

#### `admins`
Stores admin user accounts.

**Key Columns:**
- `id` (BIGSERIAL PRIMARY KEY)
- `username` (TEXT, UNIQUE)
- `password_hash` (TEXT) - PBKDF2-SHA256 with salt prefix (format: "salt:hash")
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

**RLS Policy:** Admin-only. Users cannot access.

---

#### `cms_content`
Stores dynamic content blocks used throughout the website (About page text, etc.)

**Key Columns:**
- `id` (BIGSERIAL PRIMARY KEY)
- `key` (TEXT, UNIQUE) - identifier for the content block
- `content_de` (TEXT) - German version
- `content_fa` (TEXT) - Persian version
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

**RLS Policy:** Public can SELECT. Admin can INSERT/UPDATE/DELETE.

---

### Other Tables (Not Currently Used)

- `membership_applications_archived` - backup table for old memberships
- `contact_submissions_archived` - backup table for old contacts
- Any other tables present are legacy/deprecated

---

## RPC Functions (Stored Procedures)

All public form submissions go through SECURITY DEFINER RPC functions. These execute with elevated database privileges, allowing public users to insert data even though the base tables have restrictive RLS policies.

### `insert_event_registration_manual()`

**Purpose:** Public users submit event registrations.

**Parameters:**
```sql
p_event_id BIGINT
p_first_name TEXT
p_last_name TEXT
p_email TEXT
p_phone TEXT (nullable)
p_telegram_id TEXT (nullable)
p_comment TEXT (nullable)
```

**Returns:** BIGINT (registration id)

**Called By:** `POST /api/registrations/submit`

**Behavior:**
- Inserts new row into `event_registrations` with `status='new'`
- Returns the registration ID
- Errors are returned to caller (see `migration_006_fix_rpc_error_propagation.sql`)

---

### `insert_membership_application()`

**Purpose:** Public users submit membership applications.

**Parameters:**
```sql
p_first_name TEXT
p_last_name TEXT
p_email TEXT
p_phone TEXT (nullable)
p_telegram_id TEXT (nullable)
p_motivation TEXT
```

**Returns:** BIGINT (application id)

**Called By:** `POST /api/memberships/submit`

**Behavior:**
- Inserts new row into `membership_applications` with `status='new'`
- Returns the application ID

---

### `insert_contact_submission()`

**Purpose:** Public users submit contact form messages.

**Parameters:**
```sql
p_name TEXT
p_email TEXT
p_subject TEXT
p_message TEXT
```

**Returns:** BIGINT (submission id)

**Called By:** `POST /api/contact/submit`

**Behavior:**
- Inserts new row into `contact_submissions` with `status='new'`
- Returns the submission ID

---

## Admin Authentication

### Session Flow

1. **Login:** Admin visits `/admin/login` and enters username + password
2. **Verify:** Server checks credentials against `admins` table:
   - Fetch admin by username
   - Use `verifyPassword()` from `lib/admin-auth.js` to PBKDF2-compare password
   - If no match, reject
3. **Create Session:** Server generates 64-character random token and stores hash in `admin_sessions`:
   ```javascript
   const token = generateSessionToken(); // 64-char hex from crypto.randomBytes(32)
   const tokenHash = hashSessionToken(token); // SHA256 hash
   // Store tokenHash + 24-hour expiry in admin_sessions table
   // Return plaintext token to client as HTTP-only secure cookie
   ```
4. **Client Storage:** Token stored as HTTP-only, Secure, SameSite=Strict cookie (`session_token`)
5. **Authenticated Requests:** Client sends cookie with each admin API request
6. **Validation:** Server middleware checks each admin request:
   - Extract token from cookie
   - Hash the token
   - Query `admin_sessions` for matching token hash
   - If found and not expired, request is authenticated
   - If not found or expired, return 401
7. **Logout:** Admin visits `/admin/logout` → clears cookie + deletes session from `admin_sessions` table

### Password Requirements

Passwords must meet these criteria (validated in `lib/admin-auth.js`):
- Minimum 12 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character (!@#$%^&*)

### Session Duration

Default: 24 hours

Configured via `ADMIN_SESSION_DURATION_MS` environment variable (milliseconds).

---

## Supabase Security Model

### Public Clients
- Use publishable key (safe to expose in frontend code)
- Requests subject to RLS policies
- Can SELECT published events and CMS content
- Cannot access registrations, memberships, contacts, admin data

### Server Client (Public Forms)
- Used in API routes for form submissions
- Uses publishable key (no privilege escalation)
- Requests subject to RLS policies
- Can only call SECURITY DEFINER RPC functions (which insert data by proxy)
- Cannot directly INSERT/UPDATE/DELETE data tables

### Admin Client
- Used ONLY in admin API routes AFTER verifying session
- Uses secret key (`SUPABASE_SECRET_KEY`)
- Bypasses RLS policies entirely
- Full CRUD access to all tables
- **CRITICAL:** Must NEVER be instantiated without prior session verification

---

## Environment Variables (Names Only)

These must be set in `.env.local` (never committed to git):

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server-side only)

**Admin Session:**
- `ADMIN_SESSION_DURATION_MS` (default: 86400000, i.e., 24 hours)

**Email Service (Resend):**
- `RESEND_API_KEY` (server-side only)

**Other:**
- `NODE_ENV` (development, production)

---

## Schema Migrations

9 migration files are applied in order (`data/migration_*.sql`):

1. **migration_001_registration_verification.sql** — Base schema (events, event_registrations, admin_sessions)
2. **migration_002_admin_sessions_rls.sql** — RLS policies for admin_sessions
3. **migration_003_supabase_explicit_grants.sql** — Grant permissions to Supabase roles
4. **migration_004_cms_foundation.sql** — CMS content table
5. **migration_005_manual_registration_rpc.sql** — RPC for event registrations
6. **migration_006_fix_rpc_error_propagation.sql** — Improve RPC error handling
7. **migration_007_membership_application_rpc.sql** — RPC for memberships
8. **migration_008_contact_submission_rpc.sql** — RPC for contact submissions
9. **migration_009_service_role_grants.sql** — Final service role permissions

---

## Key Implementation Files

- `lib/supabase.js` — Supabase client instantiation
- `lib/admin-auth.js` — Password hashing, session token generation, password validation
- `lib/session-store-db.js` — Session storage and validation against `admin_sessions` table
- `pages/api/auth/login.js` — Admin login endpoint
- `pages/api/auth/verify.js` — Session validation endpoint
- `pages/api/registrations/submit.js` — Event registration form submission

