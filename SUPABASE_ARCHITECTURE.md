# Supabase Architecture — Phase 1 & Beyond

## Overview

DIDAR uses Supabase with two distinct access patterns:

1. **Public/Form Submission** (Phase 1 — Current)
   - Uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (public, safe for browser)
   - Limited by Row Level Security (RLS)
   - Can: INSERT forms, READ published events
   - Cannot: SELECT/UPDATE/DELETE personal data

2. **Admin Operations** (Phase 3+ — Future)
   - Uses `SUPABASE_SECRET_KEY` (secret, server-only)
   - Bypasses Row Level Security
   - Full access: CREATE, READ, UPDATE, DELETE
   - Used only after verifying admin session

## Phase 1 Architecture

```
Browser/Client
  ↓
Public Form Submission
  ↓
Next.js API Route (session-based auth check)
  ↓
Supabase (Publishable Key + RLS)
  ↓
INSERT form data into protected table
  ↓
RLS blocks public SELECT/UPDATE/DELETE
```

### Supabase Keys in Phase 1

| Key | Use | Secret? | Access |
|-----|-----|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | No | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Form submissions | No* | Limited by RLS |
| `SUPABASE_SECRET_KEY` | Admin (Phase 3+) | **YES** | Bypasses RLS |
| `ADMIN_PASSWORD_HASH` | Admin login | **YES** | Session only |

*Safe to expose: Limited to INSERT on forms, cannot READ other data

## Row Level Security (RLS) Policies

### Events Table
```
Policy: public_read_published_events
  - SELECT only if status = 'published'
  - Public can see event listings
  - Draft/archived events are hidden
```

### Event Registrations Table
```
Policy: public_insert_event_registrations
  - INSERT allowed (can submit registration)
  - RLS enforces unique (event_id, email)

Policies: block_public_select/update/delete
  - SELECT blocked (cannot read other registrations)
  - UPDATE blocked (cannot modify submission)
  - DELETE blocked (cannot delete submission)
```

### Membership Applications Table
```
Policy: public_insert_membership_applications
  - INSERT allowed (can apply for membership)
  - RLS enforces unique email

Policies: block_public_select/update/delete
  - SELECT blocked (cannot see other applications)
  - UPDATE blocked (cannot modify application)
  - DELETE blocked (cannot delete application)
```

### Contact Submissions Table
```
Policy: public_insert_contact_submissions
  - INSERT allowed (can send contact message)

Policies: block_public_select/update/delete
  - SELECT blocked (cannot read other messages)
  - UPDATE blocked (cannot modify message)
  - DELETE blocked (cannot delete message)
```

## Authentication Layers

### Layer 1: Supabase RLS (Database)
- **When**: Every Supabase query
- **What**: Enforces access based on key type
- **Public can**: INSERT forms, SELECT published events
- **Public cannot**: SELECT/UPDATE/DELETE personal data
- **Admin can** (Phase 3+): Everything (secret key bypasses RLS)

### Layer 2: Application Session (API Route)
- **When**: Admin operations (Phase 3+)
- **What**: Checks HTTP-only session cookie
- **Verified by**: `lib/admin-auth.js`
- **Protects**: Routes in `pages/api/admin/*` (built in Phase 3)
- **How it works**: Verify session → If valid, use service role key

### Layer 3: Form Validation (API Route)
- **When**: Public form submission
- **What**: Server-side validation before inserting
- **Prevents**: Invalid/malicious data
- **Enforced by**: `lib/validation.js`

## How Form Submission Works (Phase 1)

```
1. User submits form (registrations/submit, memberships/submit, contact/submit)
   ↓
2. API route receives POST request
   ↓
3. Server-side validation checks:
   - Email format valid
   - Names present and reasonable length
   - Phone number valid (if provided)
   - Comment under length limit
   ↓
4. Rate limiting checks:
   - Max 10 requests per minute per IP
   - Reject if exceeded
   ↓
5. If validation passes:
   - Create Supabase client with publishable key
   - INSERT into table (e.g., event_registrations)
   - RLS policy "public_insert_event_registrations" allows INSERT
   ↓
6. Return success/error to user
   ↓
7. Admin views data in Supabase dashboard
   ↓
8. Admin manually sends confirmation email
```

## How Admin Access Will Work (Phase 3+)

```
1. Admin attempts to access /admin/* route
   ↓
2. API route checks session cookie
   - If missing/invalid: Return 401 Unauthorized
   - If valid: Continue
   ↓
3. Admin route uses createAdminClient()
   - This creates a client with SUPABASE_SECRET_KEY
   - Secret key bypasses RLS
   - Now admin can SELECT/UPDATE/DELETE
   ↓
4. Admin can:
   - View all registrations
   - Update registration status (new → confirmed → declined)
   - View all membership applications
   - Download data for manual review
   - Update membership status
```

## Environment Variables

### Phase 1 (Current)

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
ADMIN_PASSWORD_HASH=generated-by-setup-script
```

**Optional:**
```
SUPABASE_SECRET_KEY=not-needed-yet
```

### Phase 3+ (When Admin Dashboard Built)

**Add to .env.local:**
```
SUPABASE_SECRET_KEY=get-from-supabase-settings
```

**In Vercel Project Settings:**
```
Add the same 3 required variables
Add SUPABASE_SECRET_KEY (server-only)
```

## Security Checklist

- ✅ Publishable key is public but limited by RLS
- ✅ Secret key is secret and server-only
- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ Secret key never sent to browser
- ✅ Admin session verified before admin queries
- ✅ Form validation prevents bad data
- ✅ RLS prevents accidental data exposure
- ✅ Each operation has multiple security layers

## Common Questions

### Q: Why use publishable key if it can INSERT?
**A:** Publishable key is limited by RLS. It can only INSERT forms, not SELECT/UPDATE/DELETE data. RLS is the second layer of protection.

### Q: Why not use JWT roles?
**A:** Simple single-admin architecture doesn't need JWT complexity. Session-based is simpler and sufficient for Phase 1.

### Q: When do we use secret key?
**A:** Phase 3 (Admin Dashboard). Only for admin operations. Never for public forms.

### Q: What if someone guesses the publishable key?
**A:** They can only INSERT forms (add spam). RLS blocks them from seeing other data. Rate limiting prevents spam abuse. Good enough for Phase 1.

### Q: How do we prevent duplicate registrations?
**A:** Database constraints (UNIQUE) + RLS + API validation. User cannot submit same event+email twice.

### Q: Can users read each other's phone numbers?
**A:** No. RLS blocks all public SELECT on personal data tables. Only events table is readable (public events only).

### Q: How do admins see registrations?
**A:** Phase 1: Supabase dashboard (manual viewing)
**A:** Phase 3: Admin dashboard (API route with session + service role key)

## Migration Path

### Phase 1 → Phase 3

**No schema changes needed.** Schema is already correct.

**Code changes needed:**
1. Create admin API routes (`pages/api/admin/*`)
2. Verify session before querying
3. Use `createAdminClient()` after session verification
4. Implement admin dashboard UI

**Configuration changes:**
1. Get service role key from Supabase Settings
2. Add to `.env.local` and Vercel

**That's it.** RLS policies are already in place.

## Troubleshooting

### "Database connection failed"
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is correct
- Check Supabase project is active
- Check schema was deployed

### "Permission denied" on INSERT
- Check RLS policy "public_insert_*" exists
- Check policy is enabled
- Check table has RLS enabled

### "Cannot read data" (admin in Phase 3)
- Check session is valid
- Check secret key is set
- Check `createAdminClient()` is used (not `createServerClient()`)
- Check admin routes exist

### Can't generate secret key in Phase 1
- Secret key is optional in Phase 1
- Only needed when building Phase 3 admin dashboard
- Until then, use Supabase dashboard to view data

## Production Deployment

### Vercel Environment Variables

**Public (safe):**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

**Secret (server-only):**
```
SUPABASE_SECRET_KEY (added in Phase 3)
ADMIN_PASSWORD_HASH
```

### Supabase Database (PostgreSQL)

**No production differences.** Schema is the same everywhere.

**Backup:** Supabase handles automatic backups (free tier).

### Security Summary

- Publishable key: Public, limited by RLS
- Secret key: Secret, full access
- Session: HTTP-only cookie, verified on admin routes
- Validation: Server-side on all forms
- Rate limiting: 10 req/min per IP

This is a solid, simple architecture that scales from Phase 1 to production.
