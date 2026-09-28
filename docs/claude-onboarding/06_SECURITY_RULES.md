# Security Rules

## Authentication Architecture

### Admin Authentication

**Flow:**
1. Admin enters username + password at `/admin/login`
2. Server looks up admin in `admins` table by username
3. Server uses PBKDF2 to verify password hash (100,000 iterations)
4. If valid, generate random 64-character session token
5. Hash token with SHA256
6. Store token hash in `admin_sessions` table with 24-hour expiry
7. Return plaintext token to client as HTTP-only, Secure, SameSite=Strict cookie
8. Client sends cookie with every admin API request
9. Server middleware validates token by hashing and comparing against `admin_sessions`
10. Session automatically expires after 24 hours

**Security Properties:**
- Passwords never stored plaintext
- Tokens stored as hashes only (server doesn't keep plaintext tokens)
- Cookies HTTP-only (JavaScript cannot access)
- Cookies Secure (HTTPS only)
- Automatic session expiration (24 hours)
- Logout clears cookie + deletes session from database

### Public Users

No authentication required for public form submissions. Public forms are submitted to SECURITY DEFINER RPC functions that execute with elevated privileges.

---

## Row-Level Security (RLS)

All data tables implement RLS policies:

### Public Tables (Readable by Anyone)

- `events` — Users can SELECT published events
- `cms_content` — Users can SELECT all CMS content

### Protected Tables (Public Cannot Access Directly)

- `event_registrations` — Public cannot SELECT/INSERT/UPDATE/DELETE directly; only via RPC
- `membership_applications` — Public cannot access directly; only via RPC
- `contact_submissions` — Public cannot access directly; only via RPC
- `admin_sessions` — Admin-only; public cannot access
- `admins` — Admin-only; public cannot access

### Admin Override

When admin is authenticated (via middleware verification):
- Admin client instantiated with `SUPABASE_SECRET_KEY`
- Secret key bypasses RLS entirely
- Admin has full CRUD access to all tables
- **CRITICAL:** Secret key must NEVER be used without prior session verification

---

## SECURITY DEFINER Procedures

All public form submissions are handled by PostgreSQL SECURITY DEFINER functions:

### What SECURITY DEFINER Does

- Function executes with OWNER privileges (bypasses RLS)
- Allows public users to insert data into protected tables
- Prevents public users from directly accessing or modifying other data

### Example: Event Registration

**Function:** `insert_event_registration_manual(...)`

**Privileges:**
- Any user (authenticated or anonymous) can EXECUTE this function
- Function inserts into `event_registrations` table (which is RLS-protected)
- Function cannot select from other tables unless explicitly allowed
- Errors in function are returned to caller (fixed in migration_006)

**Calling:**
```javascript
// From public API route (using server client with publishable key)
const result = await supabaseClient.rpc('insert_event_registration_manual', {
  p_event_id: eventId,
  p_first_name: firstName,
  // ... other params
});
```

**Benefits:**
- Users can submit forms (RPC is allowed)
- Users cannot read registrations from other events (table access blocked)
- Users cannot modify existing registrations (RPC only allows INSERT, not UPDATE)

---

## Secrets Management

### Never Committed to Git

These MUST NOT appear in `.git/` history:

- `.env.local` (development secrets)
- Plaintext Supabase secret key
- Plaintext Resend API key
- Plaintext ADMIN_SESSION_DURATION_MS if it contains actual session timeout
- Any test credentials or temporary passwords
- Database connection strings with credentials

### Safely Storing Secrets

**Development:**
- Store in `.env.local` (git-ignored)
- Never commit `.env.local`
- Use `.env.example` as template (committed, with placeholder values)

**Production:**
- Store in Vercel Environment Variables
- Access via `process.env.VARIABLE_NAME`
- Never log or expose values

**Local Admin Password:**
- Hash with PBKDF2 before inserting into `admins` table
- Never store plaintext
- Only the hash is stored in database

### Checking for Leaked Secrets

```bash
# Search git history for common secret patterns
git log -p | grep -i "SUPABASE_SECRET_KEY\|RESEND_API_KEY\|password"

# Search local repo for secrets
grep -r "SUPABASE_SECRET_KEY" . --include="*.js" --include="*.json"
```

If secrets found in git:
1. Revoke the key immediately (Supabase/Resend dashboard)
2. Generate new key
3. Use `git filter-branch` to remove from history (if leaked to public repo)
4. Push new history: `git push origin --force-with-lease`

---

## Environment Variables

### Public Variables (Safe to Expose)

These start with `NEXT_PUBLIC_` and are baked into client-side code:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Server-Side Only (Must Not Leak)

These are used ONLY on server (in API routes, not client code):

- `SUPABASE_SECRET_KEY` — Server-side only; NEVER expose to client
- `RESEND_API_KEY` — Server-side only; NEVER expose to client
- `ADMIN_SESSION_DURATION_MS` — Server-side configuration

### When Set in Production

- Set in Vercel project settings (Environment Variables)
- Not set in `.env.local` (that's local development)
- Automatically available to all functions via `process.env`

### Accessing in Code

**Frontend (Next.js Pages/Components):**
```javascript
// Safe (public)
const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// DANGER: This does NOT work (secret not available)
const secret = process.env.SUPABASE_SECRET_KEY; // undefined in browser
```

**API Routes & Server Functions:**
```javascript
// Safe (only server-side)
if (!process.env.SUPABASE_SECRET_KEY) {
  throw new Error('SUPABASE_SECRET_KEY not set');
}
const adminClient = createAdminClient();
```

---

## Public API Exposure

### Public Endpoints (No Auth Required)

- `GET /api/events` — List published events
- `POST /api/registrations/submit` — Submit registration
- `POST /api/memberships/submit` — Submit membership application
- `POST /api/contact/submit` — Submit contact message
- `GET /api/health` — Health check

### Admin-Only Endpoints (Session Required)

All `/api/admin/*` routes:
- `GET /api/admin/registrations` — Fetch registrations (requires session)
- `POST /api/admin/registrations/[id]` — Update registration status
- `GET /api/admin/events` — Fetch events (admin view)
- `POST /api/admin/events` — Create event
- `PUT /api/admin/events/[slug]` — Update event
- `DELETE /api/admin/events/[slug]` — Delete event
- ... and others

### Validation in Admin Routes

Every admin API route MUST:
1. Extract session token from cookie
2. Validate token against `admin_sessions` table
3. Check expiry
4. If invalid, return 401 Unauthorized
5. Only if valid, proceed with database operations

**Example:**
```javascript
export default async function handler(req, res) {
  // Validate session middleware
  const session = await validateSession(req.cookies.session_token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Proceed with operation (now safe to use admin client)
  const adminClient = createAdminClient();
  // ... admin operations
}
```

---

## What Must NEVER Be Changed Casually

### Database Schema

Do NOT modify without understanding implications:
- Table structure changes can break existing data
- RLS policy changes can expose data or break form submissions
- Foreign key changes can cascade delete unexpected records

**Safe Changes:** Adding new nullable columns, adding new tables, adding new RPC functions

**Risky Changes:** Renaming columns, changing constraints, modifying RLS policies, deleting tables

### RLS Policies

RLS policies are security boundaries. Modifying them without care can:
- Expose private data to public users
- Break admin access
- Allow unauthorized data modifications

**Before changing RLS:**
1. Understand what data the policy protects
2. Test thoroughly (in development first)
3. Verify no data leaks with test queries
4. Verify admin access still works

### SECURITY DEFINER Functions

These execute with elevated privileges. Bugs can be critical:

**Never:**
- Allow public input directly into SQL without validation
- Return sensitive data (like password hashes)
- Bypass intended security checks

**Always:**
- Validate input parameters in the function
- Test with public (unprivileged) user before going to production
- Document what data the function exposes

### Manual Registration Model

The system is intentionally MANUAL. These features must NEVER be added casually:
- NO automatic verification emails / tokens
- NO automatic capacity enforcement
- NO automatic confirmations
- NO automatic status updates

If any of these are added, it's a major architecture change and requires careful planning.

---

## What Must NOT Be Committed to Git

These files/patterns must stay out of git:

- `.env.local` — Local development secrets
- `node_modules/` — Installed dependencies (use npm install)
- `.next/` — Build artifacts
- `*.pem` — SSL certificates
- `*.key` — Private keys
- `*.sql` with credentials — Database dumps with passwords
- Temporary `*.tmp`, `*.log` files
- IDE-specific folders (`.vscode/`, `.idea/`)
- OS-specific files (`Thumbs.db`, `.DS_Store`)
- `dist/`, `build/` — Build outputs

**Currently in `.gitignore`:**
Check `.gitignore` in root directory for full list.

---

## Password Requirements

Admin passwords must pass validation (enforced in `lib/admin-auth.js`):

- Minimum 12 characters
- At least one lowercase letter (a–z)
- At least one uppercase letter (A–Z)
- At least one number (0–9)
- At least one special character (!@#$%^&*)

**Example Valid Passwords:**
- `SecureP@ss123`
- `MyStr0ng!Password`
- `Didar#Admin2026`

**Example Invalid Passwords:**
- `password` (no capitals, numbers, special chars)
- `Pass123` (only 7 chars)
- `PASSWORD123!` (no lowercase)

---

## Incident Response

### If Admin Password Is Compromised

1. **Immediately:** Change the password in `admins` table
   ```sql
   UPDATE admins SET password_hash = 'new_hash' WHERE id = 1;
   ```
2. **Invalidate Sessions:** Delete all sessions from `admin_sessions` table (forces re-login)
   ```sql
   DELETE FROM admin_sessions WHERE admin_id = 1;
   ```
3. **Review Logs:** Check Supabase and Vercel logs for unauthorized access
4. **Change API Keys:** If attacker accessed Supabase secret key, rotate it

### If Database Secret Key Is Leaked

1. **Immediately:** Revoke current key in Supabase dashboard
2. **Generate New:** Create new secret key
3. **Update:** Set new key in Vercel environment variables
4. **Monitor:** Watch logs for queries with old key
5. **Audit Data:** Review tables for unauthorized modifications

### If Email API Key Is Leaked

1. **Immediately:** Revoke API key in Resend dashboard
2. **Generate New:** Create new API key
3. **Update:** Set new key in Vercel environment variables
4. **Monitor:** Check Resend logs for unauthorized email sends

---

## Key Files

- `lib/admin-auth.js` — Password hashing, validation, session token generation
- `lib/session-store-db.js` — Session validation against database
- `pages/api/auth/login.js` — Login endpoint (password verification)
- `pages/api/auth/logout.js` — Logout endpoint (session deletion)
- `data/migration_002_admin_sessions_rls.sql` — RLS policies for sessions
- `data/migration_003_supabase_explicit_grants.sql` — Permission grants
- `.env.example` — Template for environment variables

