# Security Documentation

**Last Updated:** September 27, 2026

## Overview

DIDAR implements security best practices for protecting user data, admin credentials, and application integrity. This document describes authentication mechanisms, data protection, access control, and incident response procedures.

---

## 1. Admin Authentication

### Password Hashing

Admin passwords are hashed using PBKDF2 (Password-Based Key Derivation Function 2) with the following configuration:

```javascript
// From lib/password.js
const hashPassword = (password) => {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    100000,  // iterations
    64,      // keylen
    'sha256'
  ).toString('hex');
  return `${salt}:${hash}`;
};
```

**Key parameters:**
- **Algorithm:** PBKDF2-SHA256
- **Iterations:** 100,000 (increases computational cost for brute-force attacks)
- **Key Length:** 64 bytes (512 bits)
- **Salt:** 32 random bytes per password

**Important:** Never store plaintext passwords. Always use `hashPassword()` when creating or updating admin accounts.

### Session Management

Admin sessions are stored in the `admin_sessions` table with database-backed authentication:

```sql
CREATE TABLE admin_sessions (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Session lifecycle:**
1. Admin submits username and password on `/admin/login`
2. Server validates credentials against `admins` table using PBKDF2 comparison
3. Server generates random 64-character session token and stores hash in `admin_sessions`
4. Token returned to client as HTTP-only secure cookie `session_token`
5. Client sends cookie with each admin API request
6. Server validates token hash against `admin_sessions` table before processing request
7. Session expires after 24 hours (configurable via `ADMIN_SESSION_DURATION_MS`)

**Security properties:**
- **HTTP-Only Cookie:** Browser JavaScript cannot access the token (prevents XSS token theft)
- **Secure Flag:** Cookie only transmitted over HTTPS
- **Database-Backed:** Sessions stored server-side; clients cannot forge valid sessions
- **Token Hashing:** Server never stores plaintext tokens; only hashes are saved
- **Automatic Expiration:** Expired sessions become invalid; logout clears cookie

### Admin Credentials Initialization

For first-time admin setup:

```bash
# Generate password hash locally (never store plaintext)
node -e "
const crypto = require('crypto');
const password = 'your-secure-password';
const salt = crypto.randomBytes(32).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
console.log('Hash:', salt + ':' + hash);
"
```

Then insert into the `admins` table via Supabase dashboard or SQL:

```sql
INSERT INTO admins (username, password_hash)
VALUES ('admin', 'salt:hash');
```

---

## 2. Row-Level Security (RLS)

All data tables implement Row-Level Security policies to restrict access based on user role:

### Public Tables (No RLS — User-Facing Data)

These tables have RLS enabled but allow public SELECT access for frontend data needs:

- **events:** Public SELECT; admin INSERT/UPDATE/DELETE
- **cms_content:** Public SELECT; admin INSERT/UPDATE/DELETE

### Restricted Tables (RLS — Protected Data)

These tables restrict access to admin role via SECURITY DEFINER functions:

- **event_registrations:** Public cannot read/write directly; only via SECURITY DEFINER RPC
- **membership_applications:** Public cannot read/write directly; only via SECURITY DEFINER RPC
- **contact_submissions:** Public cannot read/write directly; only via SECURITY DEFINER RPC
- **admin_sessions:** Admin only; used for session validation

### SECURITY DEFINER Procedures

All public form submissions use SECURITY DEFINER procedures that execute with elevated privileges:

```sql
CREATE FUNCTION insert_event_registration_manual(
  p_event_id BIGINT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_telegram_id TEXT,
  p_comment TEXT
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_registration_id BIGINT;
BEGIN
  INSERT INTO event_registrations (
    event_id, first_name, last_name, email, phone, telegram_id, comment, status
  ) VALUES (
    p_event_id, p_first_name, p_last_name, p_email, p_phone, p_telegram_id, p_comment, 'new'
  )
  RETURNING id INTO v_registration_id;
  
  RETURN v_registration_id;
END;
$$;

-- Grant execution to anon/authenticated roles
GRANT EXECUTE ON FUNCTION insert_event_registration_manual(...) TO anon, authenticated;
```

**Benefits:**
- Public cannot directly INSERT/UPDATE rows (only via RPC)
- RPC executes with `postgres` role privileges, bypassing RLS
- Backend validates input before calling RPC
- Prevents direct SQL injection into table structure

---

## 3. Data Privacy

### User Data Collection

DIDAR collects only necessary information for event registration and membership:

**Event Registration:**
- First name, last name, email, phone (optional), Telegram ID (optional), comment (optional)

**Membership Application:**
- First name, last name, email, phone (optional), Telegram ID (optional), additional info (optional)

**Contact Form:**
- Name, email, message

**No automated email addresses, IP addresses, or personal browsing data are stored.**

### Data Retention

- **Event registrations:** Retained indefinitely (admin can manually delete if needed)
- **Membership applications:** Retained indefinitely (admin can manually delete)
- **Contact submissions:** Retained indefinitely (admin can manually delete)
- **Admin sessions:** Automatically expire after 24 hours; expired records can be cleaned up

### Data Export

Admins can export registrations and memberships to CSV via:
- `/admin/registrations` → "Export CSV" button
- `/admin/memberships` → "Export CSV" button

Exported files contain only the submission data; no system metadata is included.

### Deleting User Data

To delete a specific registration or membership:

1. Admin logs in to `/admin`
2. Navigate to Registrations or Memberships
3. Click the registration/membership to open details
4. Click "Delete" button (if available)
5. Confirm deletion

**Note:** Deletion is permanent; there is no undo.

---

## 4. Transport Security

### HTTPS Enforcement

All production deployments must use HTTPS:

- **Vercel:** HTTPS enabled by default; automatic HTTPS redirect
- **Self-hosted:** Configure nginx reverse proxy with SSL certificate

```nginx
server {
  listen 443 ssl http2;
  server_name your-domain.com;
  
  ssl_certificate /etc/ssl/certs/your-cert.crt;
  ssl_certificate_key /etc/ssl/private/your-key.key;
  
  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto https;
  }
}
```

### Secure Cookies

Admin session cookies are configured as:

```javascript
// From pages/api/auth/login.js
res.setHeader('Set-Cookie', [
  `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
]);
```

- **HttpOnly:** JavaScript cannot access the cookie
- **Secure:** Only transmitted over HTTPS (browser enforces this)
- **SameSite=Strict:** Prevents CSRF attacks (cookie only sent in same-site requests)
- **Max-Age=86400:** 24-hour expiration

---

## 5. Rate Limiting

All public forms are protected by rate limiting to prevent spam and brute-force attacks:

**Implementation:**
- **Location:** `lib/rate-limit.js` and applied via `withRateLimit()` middleware
- **Mechanism:** Per-IP in-memory counter with sliding window
- **Default Limit:** 10 requests per 60 seconds per IP
- **Configuration:**
  - `RATE_LIMIT_REQUESTS=10` (number of requests allowed)
  - `RATE_LIMIT_WINDOW_MS=60000` (time window in milliseconds)

**Protected endpoints:**
- `POST /api/contact/submit` — Contact form
- `POST /api/memberships/submit` — Membership application
- `POST /api/registrations/submit` — Event registration

**Rate limit error response:**

```json
HTTP 429 Too Many Requests
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 42
}

Response Header: Retry-After: 42
```

**Client behavior:** Browsers should wait the specified `retryAfter` seconds before retrying.

### Adjusting Rate Limits

To change rate limiting for production:

```bash
# .env.production
RATE_LIMIT_REQUESTS=20        # Allow 20 requests
RATE_LIMIT_WINDOW_MS=120000   # Per 2 minutes
```

**Note:** Changes require redeployment (cannot be modified at runtime without restart).

---

## 6. Input Validation

All user inputs are validated server-side before processing or storage:

### Contact Form Validation

```javascript
// lib/validation.js
export function validateContactForm(data) {
  const errors = [];
  
  if (!validateRequired(data.name, 1, 100))
    errors.push('Name is required (1-100 characters)');
  
  if (!validateEmail(data.email))
    errors.push('A valid email address is required');
  
  if (!validateRequired(data.message, 10, 2000))
    errors.push('Message is required (10-2000 characters)');
  
  return { valid: errors.length === 0, errors };
}
```

### Event Registration Validation

```javascript
export function validateEventRegistration(data) {
  const errors = [];
  
  if (!validateRequired(data.firstName, 1, 100))
    errors.push('First name is required (1-100 characters)');
  
  if (!validateRequired(data.lastName, 1, 100))
    errors.push('Last name is required (1-100 characters)');
  
  if (!validateEmail(data.email))
    errors.push('A valid email address is required');
  
  if (data.phone && !validatePhone(data.phone))
    errors.push('Phone number is invalid');
  
  if (data.telegramId && !validateTelegram(data.telegramId))
    errors.push('Telegram ID is invalid');
  
  return { valid: errors.length === 0, errors };
}
```

### Validation Rules

- **Names:** 1-100 characters, required
- **Email:** Valid format (basic regex), max 254 characters, required
- **Phone:** 5-20 characters, optional
- **Telegram:** Starts with @ (2-32 chars) or numeric ID, optional
- **Message/Comment:** Text length limits (10-2000 for messages, max 1000 for comments)

**All validation happens server-side; client-side validation is for UX only.**

---

## 7. SQL Injection Prevention

DIDAR uses parameterized queries (prepared statements) throughout:

```javascript
// Example: Never concatenate strings into SQL queries

// ❌ VULNERABLE:
const query = `SELECT * FROM events WHERE id = ${eventId}`;

// ✅ SECURE (using Supabase client):
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('id', eventId);
```

The Supabase JavaScript client handles all parameterization automatically. Values are never interpolated into SQL strings.

---

## 8. XSS (Cross-Site Scripting) Prevention

DIDAR uses Next.js and React with built-in XSS protection:

- **React escaping:** All user data rendered via React is HTML-escaped automatically
- **No innerHTML:** User data is never inserted via `innerHTML` or `dangerouslySetInnerHTML`
- **Content Security Policy:** (Optional) Can be configured in `next.config.js` for additional protection

Example:

```javascript
// ✅ SAFE - React auto-escapes:
<p>{userSubmittedText}</p>

// ❌ UNSAFE - Never do this with user input:
<p dangerouslySetInnerHTML={{ __html: userSubmittedText }} />
```

---

## 9. CSRF (Cross-Site Request Forgery) Prevention

DIDAR uses SameSite cookies for CSRF protection:

```javascript
// From lib/middleware.js
res.setHeader('Set-Cookie', [
  `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/`
]);
```

**SameSite=Strict** ensures cookies are only sent to same-site requests, preventing cross-origin form submissions from stealing session tokens.

---

## 10. Dependency Security

### Regular Updates

Keep dependencies current to patch security vulnerabilities:

```bash
npm outdated          # Check for outdated packages
npm audit             # Check for known vulnerabilities
npm update            # Update to latest minor/patch versions
```

### Critical Dependencies

Key security-related dependencies:

- **next:** Framework security updates
- **react:** Framework updates
- **@supabase/supabase-js:** Database client security fixes
- **crypto:** Node.js built-in (no external dependency)

Monitor these packages for security advisories via:
- GitHub Security Alerts (if repo is on GitHub)
- npm audit regularly
- Dependabot (GitHub) or similar service

---

## 11. Incident Response

### Security Incident Types

#### Unauthorized Admin Access

**Signs:**
- Unexpected changes to events or admin settings
- Admin dashboard access logs (if implemented) show unknown activity
- Users report seeing old event data

**Response:**
1. Immediately change all admin passwords via `pages/api/auth/change-password` (if endpoint exists) or via Supabase dashboard
2. Revoke all active sessions by clearing the `admin_sessions` table (all existing tokens become invalid)
3. Review recent admin API logs for unauthorized actions
4. If data was modified, determine scope of changes and recover from backup if needed

```sql
-- Emergency: Invalidate all sessions
DELETE FROM admin_sessions WHERE expires_at > now();
```

#### Data Breach (User Submissions)

**Signs:**
- Registrations/memberships accessible to unauthorized users
- Contact submissions visible to non-admins
- Evidence of unauthorized database access

**Response:**
1. Verify RLS policies on affected tables are still enabled and correct
2. Review Supabase access logs for unusual database activity
3. Check that SECURITY DEFINER functions have correct permissions
4. Notify affected users if personal data was exposed
5. Consider rotating database credentials

```sql
-- Verify RLS is enabled on protected tables
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('event_registrations', 'membership_applications', 'contact_submissions');
```

#### DDoS or Rate Limit Bypass

**Signs:**
- Spike in requests from specific IP or geographic location
- Rate limiting not working as expected
- Server performance degradation

**Response:**
1. Increase `RATE_LIMIT_REQUESTS` or decrease `RATE_LIMIT_WINDOW_MS` to tighten limits
2. Deploy rate-limiting reverse proxy (nginx, CloudFlare) if self-hosted
3. Monitor request logs for patterns
4. Temporarily block IPs if severe (at nginx or firewall level)
5. Verify middleware is still applied to endpoints

#### Compromised Secrets (.env)

**Signs:**
- Evidence that `.env` file (with API keys) was exposed
- Unauthorized API usage on Supabase or external services

**Response:**
1. Immediately rotate all secrets:
   - Supabase API keys → generate new ones in Supabase dashboard
   - JWT secret → rotate in Supabase settings
2. Redeploy application with new `.env` values
3. Review audit logs in Supabase for unauthorized access
4. Never commit `.env` files to version control

---

## 12. Best Practices Checklist

### Development

- [ ] Never commit `.env` files or secrets to version control
- [ ] Use `.env.example` to document required environment variables (with placeholder values)
- [ ] Validate all user inputs server-side (not just client-side)
- [ ] Use parameterized queries (Supabase client does this automatically)
- [ ] Keep dependencies updated with `npm audit`
- [ ] Enable HTTPS in production

### Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure cookies (HttpOnly, Secure, SameSite)
- [ ] Enable database RLS policies
- [ ] Verify SECURITY DEFINER functions have correct permissions
- [ ] Set appropriate rate limiting values
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure CORS if needed (currently open for local development)

### Operations

- [ ] Monitor admin login activity
- [ ] Regularly review database backups (Supabase automatic backups)
- [ ] Keep admin passwords strong (minimum 12 characters, mixed case, numbers, symbols)
- [ ] Rotate admin credentials periodically
- [ ] Monitor application logs for errors or suspicious activity
- [ ] Review rate-limit metrics to detect attacks

### Incident Response

- [ ] Have a plan to revoke all admin sessions if needed
- [ ] Know how to rotate database credentials
- [ ] Have contact info for Supabase support
- [ ] Document procedures for restoring from backups
- [ ] Test incident response procedures annually

---

## 13. Security Contacts

For security concerns or to report vulnerabilities:

**Note:** DIDAR is currently a demonstration project. For a production deployment, establish a security contact and disclosure policy.

---

## Related Documentation

- **DATABASE.md** — RLS policies, table permissions
- **DEPLOYMENT.md** — Environment variable setup, production configuration
- **ADMIN_GUIDE.md** — Admin session management, password policies

