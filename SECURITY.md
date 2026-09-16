# Security & Privacy Architecture — Phase 1

## Overview

DIDAR Phase 1 implements security-first principles:

- **Data minimization**: Only collect what's necessary
- **No automatic emails**: Manual admin workflow
- **Server-side validation**: All input validated on the server
- **Rate limiting**: Protection against spam/abuse
- **Secure authentication**: Strong password hashing
- **Protected secrets**: Environment variables, not committed to Git
- **Row Level Security**: Database-level access control

## Authentication & Authorization

### Admin Authentication (Session-Based)

1. **Password Storage**
   - Stored as PBKDF2-SHA256 hash in `.env.local`
   - Never stored in Git
   - Password requirements: 12+ characters, mixed case, numbers, symbols

2. **Login Flow**
   ```
   POST /api/auth/login
   → Verify password against hash
   → Generate session token
   → Set HTTP-only cookie (24h expiry)
   ```

3. **Protected Routes**
   - Admin routes check session cookie
   - Expired sessions automatically rejected
   - Logout clears session

### Why Session-Based Auth?

- Simple, no external service required
- Sufficient for single admin
- Standard HTTP cookie security
- Future migration to proper JWT easy

## Data Security

### What Data is Collected

| Table | Data | Visibility | Retention |
|-------|------|------------|-----------|
| Registrations | First name, last name, email, phone, Telegram, comment | Admin only | Manual review & deletion |
| Memberships | First name, last name, email, phone, Telegram, info | Admin only | Manual review & deletion |
| Contact | Name, email, message | Admin only | Manual review & deletion |
| Events | Title, description, date, time, location, status | Public | Until deletion |

### Row Level Security (RLS)

Database enforces access control:

```sql
-- Public can INSERT but not SELECT registrations
CREATE POLICY "public_insert_registrations" ON event_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_no_read_registrations" ON event_registrations
  FOR SELECT USING (false);

-- Admin can do everything (enforced at app layer in Phase 1)
```

This means:
- Users cannot read back their own submissions
- Users cannot modify submissions
- Only admin can view data
- Database prevents unauthorized access as a second layer

### Data in Transit

- All traffic uses HTTPS (enforced by Vercel/Supabase)
- No sensitive data in URLs (all in POST body)
- Cookies are `Secure`, `HttpOnly`, `SameSite=Strict`

### Personal Data Storage

All personal data is stored only in Supabase PostgreSQL database:
- No third-party services
- No analytics tracking
- No email logs
- No automatic archival

## Form Security

### Server-Side Validation

Every form submission is validated on the server:

```javascript
// Validate format
- Email: RFC standard
- Phone: 5-20 chars
- Name: 1-100 chars
- Message: 10-2000 chars

// Sanitization
- Whitespace trimmed
- Email lowercased
- No special characters allowed
- Max field lengths enforced
```

Why server-side only?
- Client-side validation is for UX
- Server-side validation is for security
- Attackers can bypass client-side checks
- Server always validates

### Rate Limiting

Prevents spam and abuse:

```
10 requests per minute per IP
Enforced on public forms (registrations, memberships, contact)
Uses IP address as identifier
Cleanup runs every 5 minutes
```

Response on rate limit:
```
HTTP 429 Too Many Requests
Retry-After header included
```

Implementation:
- In-memory map (Phase 1)
- Consider Redis for multi-instance deployments (Phase 3+)

### CSRF Protection

Not implemented in Phase 1 because:
- Forms are POST-only from verified API routes
- No sensitive state changes (admin actions require auth)
- Can be added in Phase 6 if needed

## Secret Management

### Environment Variables

**Safe to expose (NEXT_PUBLIC_):**
- `NEXT_PUBLIC_SUPABASE_URL` → browser needs it to query
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → safe, limited by RLS

**Secret (server-only):**
- `ADMIN_PASSWORD_HASH` → only used in login route
- `SUPABASE_SECRET_KEY` → only used in admin routes (Phase 3+)
- Never sent to browser

### Files Never Committed to Git

`.gitignore` prevents:
```
.env
.env.local
.env.*.local
node_modules/
.next/
data/exports/
```

Verification:
```bash
git check-ignore .env.local  # Should return .env.local
git ls-files | grep ".env"   # Should only show .env.example
```

### Vercel Deployment

Environment variables are:
1. Stored in Vercel Project Settings (encrypted)
2. Injected at build/runtime
3. Never visible in logs
4. Available in /api routes only (not browser)

## API Security

### HTTP Methods

- `GET /api/health` - Public, no data
- `POST /api/auth/login` - Public, password-protected
- `POST /api/auth/logout` - Auth required
- `POST /api/*/submit` - Public, rate-limited, validated

Rejects other methods:
```javascript
if (req.method !== 'POST') {
  return res.status(405).json({ error: 'Method not allowed' });
}
```

### Input Validation

Every API route:
1. Checks request method
2. Validates content-type (JSON)
3. Checks required fields exist
4. Validates field format
5. Enforces max lengths
6. Trims whitespace

Example validation errors:
```json
{
  "error": "Validation failed",
  "details": [
    "Email is invalid",
    "Name is too long (max 100 characters)"
  ]
}
```

### Error Messages

Errors are intentionally generic to prevent information leaks:

```javascript
// ✗ WRONG - reveals too much
return res.status(401).json({
  error: 'Password hash does not match stored hash for admin user'
});

// ✓ CORRECT - doesn't reveal system details
return res.status(401).json({
  error: 'Authentication failed'
});
```

## Network Security

### HTTP Headers

Configured in `next.config.js`:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME type sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | Legacy XSS protection |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer info |

### HTTPS

- Vercel enforces HTTPS by default
- No HTTP fallback
- HSTS headers recommended (Phase 6)

### CORS

Not configured in Phase 1 because:
- All requests come from same-origin (your website)
- Admin endpoints use session cookies (not CORS-dependent)
- Can be added if needed for Phase 3 admin dashboard

## Third-Party Services

### Services Used

1. **Supabase** (Database)
   - Handles data storage
   - Data region: EU (configurable)
   - Free tier: 500 MB database, plenty for Phase 1

2. **Vercel** (Deployment)
   - Hosts the application
   - Manages HTTPS certificates
   - Environment variables encrypted

3. **GitHub** (Source Control)
   - Repository hosted
   - No personal data stored

### Services NOT Used

- No email service (manual admin process)
- No analytics (privacy-first)
- No tracking pixels
- No CDNs beyond Vercel's default
- No external authentication

## Data Deletion & Privacy

### How Users Can Request Deletion

In Phase 1, there is no automated data deletion. Process:

1. User contacts DIDAR
2. Admin reviews request
3. Admin deletes from Supabase dashboard

Detailed process to be added in Phase 6 (Privacy/Security Hardening).

### How Registrations Are Managed

- Admin reviews submission
- Sends email manually
- Updates status in database (new → contacted/confirmed/declined)
- Deletes after event/decision

### Data Retention Baseline

- No automated deletion
- No archival
- Manual review required
- To be formalized in privacy policy (Phase 6)

## Development Security

### Git Practices

```bash
# Never do this
git add .env.local
git commit -m "Add secrets"
git push

# Always do this
git add .
git status  # Verify .env.local NOT listed
git commit
git push
```

### Code Review

When adding new features:
1. Check for hardcoded secrets
2. Verify validation on all inputs
3. Ensure errors don't leak information
4. Test with invalid data
5. Check .gitignore before committing

### Dependency Security

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update
npm audit fix
```

## Testing Security

### Manual Testing

```bash
# Health check (should work)
curl https://your-vercel-url.vercel.app/api/health

# Rate limiting (send 11 requests, 11th fails)
for i in {1..11}; do
  curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","name":"Test"}' \
    https://your-vercel-url.vercel.app/api/contact/submit
done

# Invalid input (should fail)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}' \
  https://your-vercel-url.vercel.app/api/contact/submit

# Should get 400 with validation errors
```

### Checklist Before Launch

- [ ] No `.env.local` in Git history
- [ ] All `.env` files in `.gitignore`
- [ ] Passwords meet requirements (12+ chars, mixed case, numbers, symbols)
- [ ] Health check works
- [ ] Rate limiting blocks after limit
- [ ] Invalid input returns 400 with validation errors
- [ ] Admin login requires correct password
- [ ] Logged-out users cannot access admin routes
- [ ] Supabase RLS blocks unauthorized access
- [ ] No personal data in error messages

## Known Limitations (Phase 1)

1. **Sessions are in-memory** - lost on server restart
   - Fix in Phase 3+: Use Redis or database for sessions

2. **No email verification** - intentional
   - Users can enter fake emails
   - Fix: None (by design - emails are manually verified)

3. **No password reset** - intentional for single admin
   - If password forgotten: Generate new hash with `scripts/setup-admin.js`

4. **No activity logging** - intentional for simplicity
   - Add in Phase 6+: Log admin actions for audit

5. **No two-factor authentication** - not needed for Phase 1
   - Single admin, simple deployment
   - Can add MFA support in Phase 3+

## Future Security Improvements (Phase 3+)

- [ ] Session persistence (Redis/Database)
- [ ] Activity logging
- [ ] IP whitelisting for admin
- [ ] Rate limiting by endpoint
- [ ] Intrusion detection
- [ ] Automated backups
- [ ] Encryption at rest
- [ ] API key rotation
- [ ] Security headers (CSP, etc.)

## Incident Response

### If Secrets Are Leaked

1. Stop using the leaked secret immediately
2. Rotate (generate new password, API key, etc.)
3. Revoke old secrets in services
4. Update `.env` files
5. Re-deploy
6. Monitor for misuse

### If Data Breach Suspected

1. Immediately notify users (Datenschutzerklärung must include this)
2. Revoke compromised credentials
3. Enable audit logging
4. Restore from backup if needed
5. Notify Supabase support

### If Application Is Compromised

1. Take site offline
2. Review Git logs for unauthorized commits
3. Rotate all secrets
4. Rebuild from clean repo
5. Deploy fresh instance
6. Verify with security review

## Contact

Security questions or concerns: [To be filled in Phase 6 with legal/contact details]

---

**Last Updated**: Phase 1 (2026-09-16)  
**Next Security Review**: Phase 6 (Privacy/Security Hardening)
