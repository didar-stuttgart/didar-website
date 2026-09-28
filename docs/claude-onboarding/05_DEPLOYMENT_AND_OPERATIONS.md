# Deployment and Operations

## Production Hosting

### Primary Deployment Platform: Vercel

**URL:** https://didar-website.vercel.app (or custom domain if configured)

**Provider:** Vercel (serverless Next.js hosting)

**Deployment Method:**
- Git-based: Push to main branch triggers automatic deployment
- Vercel GitHub integration: Watches repository for changes
- Build and deploy typically complete in 2–5 minutes

### Database: Supabase.com

**Type:** Managed PostgreSQL

**Region:** Check Supabase dashboard for current region

**Credentials:** Stored in Vercel environment variables (never in git)

### Email Service: Resend.com

**Purpose:** Send admin notification emails when forms are submitted

**API Key:** Stored in Vercel environment variables (server-side only)

---

## Environment Variables

### Required for Production

These must be set in Vercel project settings (Environment Variables tab):

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` — PostgreSQL endpoint URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Publishable key (safe to expose)
- `SUPABASE_SECRET_KEY` — Secret key (server-side only; grants admin access)

#### Resend Email
- `RESEND_API_KEY` — API key for sending emails

#### Admin Sessions
- `ADMIN_SESSION_DURATION_MS` — Session expiration time in milliseconds (default: 86400000 = 24 hours)

#### Next.js
- `NODE_ENV` — Should be `production` (Vercel sets this automatically)

### Development Local (.env.local)

Create `.env.local` in project root for local development:
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[key]
SUPABASE_SECRET_KEY=[secret]
RESEND_API_KEY=[key]
ADMIN_SESSION_DURATION_MS=86400000
NODE_ENV=development
```

**CRITICAL:** Never commit `.env.local` to git. It's in `.gitignore`.

---

## Build and Deployment Process

### Local Build

```bash
npm install
npm run build
npm start
```

### Vercel Deployment

#### Automatic (Git Push)
1. Make changes to code
2. Commit and push to `main` branch
3. Vercel detects push automatically
4. Vercel runs build command: `next build`
5. Vercel deploys to production URL
6. Check Vercel dashboard for build status

#### Manual (Vercel Dashboard)
1. Log in to Vercel
2. Select DIDAR project
3. Click "Deployments" tab
4. Click "Deploy" button to re-deploy current version

### Build Command

```bash
next build
```

This creates optimized production build in `.next/` directory.

### Start Command

```bash
next start
```

Starts production server (used by Vercel).

---

## Verifying Production Behavior

### Health Check Endpoint

**Endpoint:** `GET /api/health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-09-28T12:00:00Z"
}
```

**Use:** Verify that backend is responding

### Email Delivery Verification

**Test Event Registration Email:**
1. Navigate to any event page
2. Complete and submit registration form with test email
3. Check that registration appears in admin dashboard
4. Check email inbox (should receive admin notification within 1 minute)
5. Verify email contains event details and registrant info

**Expected Email:**
- Subject: "New Event Registration: [Event Title]"
- From: noreply@resend.dev or configured from address
- Contains registrant name, email, phone
- Contains link to admin dashboard

**If Email Fails:**
1. Check Resend API key is valid and set in Vercel
2. Check domain verification in Resend (may need DKIM/SPF records)
3. Check email inbox spam folder
4. Verify registration WAS saved to database (even if email failed)

### Deployment Checklist

- [ ] Changes pushed to main branch
- [ ] Vercel build completes (check dashboard)
- [ ] No build errors in Vercel logs
- [ ] Visit production URL and verify page loads
- [ ] Test event registration form works
- [ ] Check admin dashboard is accessible
- [ ] Verify database queries work (events display)
- [ ] Test email notification (register for event, check email)
- [ ] Check error logs in Vercel for any exceptions

---

## Common Deployment Issues

### Database Connection Error

**Error:** "Unable to connect to database" or "SUPABASE_SECRET_KEY not found"

**Cause:** Environment variables not set in Vercel

**Fix:**
1. Log in to Vercel project
2. Go to Settings → Environment Variables
3. Add all required variables
4. Redeploy

### Email Not Sending

**Error:** Registrations save but emails don't arrive

**Cause:** Usually Resend API key or domain verification

**Fix:**
1. Check Resend API key is valid (Resend dashboard)
2. Check domain DKIM/SPF records (Resend settings)
3. Check email went to spam
4. Verify registration WAS saved (it should be even if email fails)

### Page Returns 404

**Error:** "This page could not be found"

**Cause:** Route not defined in pages/ directory

**Fix:**
1. Check file exists in `pages/` directory with correct name
2. Check filename matches route (e.g., `/veranstaltungen` → `pages/veranstaltungen/index.js`)
3. Redeploy

### Form Submission Returns 500

**Error:** "Internal Server Error"

**Cause:** Backend validation or database error

**Fix:**
1. Check Vercel logs for specific error message
2. Verify database is reachable (check Supabase dashboard)
3. Verify SUPABASE_SECRET_KEY is set (for admin operations)
4. Check form validation rules (frontend may be too permissive)

---

## Monitoring and Maintenance

### Key Metrics to Monitor

- **Vercel Build Times:** Typically < 5 minutes; longer builds may indicate issues
- **Database Queries:** Check Supabase dashboard for slow queries
- **Error Rates:** Monitor Vercel logs for 500 errors
- **Email Delivery:** Test registrations weekly to ensure emails work

### Regular Maintenance Tasks

#### Weekly
- Check admin notifications are being received
- Verify registrations are being stored correctly
- Test one form submission end-to-end

#### Monthly
- Review Supabase database size (check under project settings)
- Clean up old test data if needed
- Verify backups are being taken (Supabase automatic backups)

#### Before Major Events
- Test full registration workflow
- Verify email notifications work
- Check database capacity (especially if high registration volume expected)

### Database Backups

**Supabase:** Automatic daily backups (kept for 7 days by default)

To restore from backup:
1. Log in to Supabase dashboard
2. Go to Settings → Backups
3. Select backup date
4. Click "Restore"
5. Verify data after restore

### Accessing Production Logs

**Vercel Logs:**
1. Log in to Vercel
2. Select DIDAR project
3. Click "Deployments" tab
4. Click latest deployment
5. Click "Logs" to see build and runtime logs

**Supabase Logs:**
1. Log in to Supabase dashboard
2. Go to Project Settings → Logs
3. View real-time database and API logs

---

## Rollback Procedure

If production deployment has critical issues:

### Immediate Rollback (Vercel)

1. Log in to Vercel dashboard
2. Select DIDAR project
3. Go to "Deployments"
4. Find previous working deployment
5. Click "..." menu on deployment
6. Select "Promote to Production"
7. Wait for deployment to complete

### Git-Based Rollback

```bash
# Revert to previous commit
git revert [commit-hash]
git push origin main

# Or reset (if commits not yet pushed)
git reset --hard [previous-commit]
```

### Database Rollback

1. Log in to Supabase dashboard
2. Go to Settings → Backups
3. Select backup from before the issue
4. Click "Restore"
5. Verify data

---

## Performance Optimization

### Current Implementation

- **Caching:** Supabase query results cached in React component state
- **Image Optimization:** Next.js Image component handles responsive images
- **Code Splitting:** Next.js automatic page-based code splitting

### Future Optimizations (if needed)

- Add SWR or React Query for automatic data refetching and caching
- Implement aggressive image optimization for events
- Add database query indexing for frequently used filters
- Consider edge caching for public content

---

## Security in Production

### HTTPS/TLS

- Vercel provides automatic HTTPS certificates
- All traffic encrypted in transit
- SSL/TLS renewal automatic

### Secrets Management

- Environment variables stored in Vercel (never in git)
- Supabase secret key restricted to server-side only
- Resend API key restricted to server-side only
- Session tokens hashed before storage

### Database Security

- Supabase Row-Level Security (RLS) enforces access control
- Service role key only used after session verification
- Public forms use SECURITY DEFINER RPC (not direct table access)
- Admin operations require valid session token

### Admin Access

- Admin login password PBKDF2-hashed (not plaintext)
- Sessions stored in database with token hash
- Session cookies HTTP-only and Secure
- Automatic session expiration after 24 hours

---

## Key Files

- `next.config.js` — Next.js build configuration
- `vercel.json` — Vercel deployment settings (if any custom config)
- `.env.example` — Template for environment variables (committed to git)
- `.env.local` — Actual environment variables (NOT committed; local development only)
- `package.json` — Build and start scripts

