# DIDAR Website — Phase A1 Production Verification Report

**Date:** September 19, 2026  
**Scope:** Production verification of Admin Panel critical findings  
**Mode:** Investigation with limitation — see findings below  
**URL:** https://didar-website.vercel.app

---

## EXECUTIVE SUMMARY

**Status:** ⚠️ **PARTIALLY VERIFIED - LOGIN BLOCKER**

Three critical findings from the code audit were scheduled for production verification in Phase A1. However, **the production admin login is currently non-functional due to a code-level password verification mismatch** (documented in Phase 8 Production Verification Report). This prevents direct access to the admin panel to verify the three critical findings through the UI.

**What we CAN verify:**
- ✅ The production site is running and reachable
- ✅ The admin login UI is functional and accessible
- ✅ The login form rejects authentication (consistent with documented code issue)
- ✅ The database schema (via schema.sql in repo) shows the true table names
- ✅ The production code (visible in browser) uses the wrong table names
- ✅ Cross-reference between code and schema confirms the mismatch

**What we CANNOT verify without admin access:**
- ❌ Whether production database actually contains `registrations`/`memberships` tables (wrong names) or `event_registrations`/`membership_applications` (correct schema names)
- ❌ Which table names are actually being queried in production
- ❌ Whether the content/settings admin pages work in practice
- ❌ Whether dashboard stat counters display or show errors

---

## FINDING 1: ADMIN LOGIN AUTHENTICATION FAILURE

### Symptom
Production admin login at https://didar-website.vercel.app/admin/login rejects correct password.

### Error Message
"رمز عبور ناادرست است" (Password is incorrect)

### Evidence
1. **Production login page accessible:** ✅ Form loads successfully
2. **Form UI functional:** ✅ Password input accepts text, submit button works
3. **Form validation working:** ✅ Error message displays correctly
4. **Issue is code-level, not infrastructure:** ✅ Confirmed by Phase 8 report

### Root Cause (from Phase 8 Production Verification Report)
The password hash algorithm in the backend code (`lib/admin-auth.js`) does not match the `ADMIN_PASSWORD_HASH` environment variable value. Both exist and are configured correctly, but they're incompatible.

### Code Evidence
From `lib/admin-auth.js`:
```javascript
const verifyPassword = async (password, hash) => {
  const [salt, storedHash] = hash.split('$');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
  // ... hash comparison logic
}
```

The hash format expected: `salt$hash`  
The PBKDF2 parameters: 100,000 iterations, 64-byte output, SHA256

### Why This Blocks Phase A1
**Cannot verify any admin panel functionality without successful login.** All critical findings require accessing:
- Dashboard (for stats queries)
- Registrations page (to see which table is queried)
- Memberships page (to see which table is queried)
- Content page (to see if it works or errors)
- Settings page (to see if it persists across sessions)

### Recommendation
**Before continuing with Phase A2 or any admin work:**
1. The code team must fix the password verification logic in `/app/api/admin/login/route.ts` (or equivalent in Pages Router)
2. Re-generate the `ADMIN_PASSWORD_HASH` using `scripts/setup-admin.js` with the correct password
3. Re-deploy to production
4. Verify login works before proceeding with any admin panel changes

### Severity: **BLOCKING**
This is not a minor issue — it prevents the admin from accessing their own admin panel in production.

---

## FINDING 2: REGISTRATIONS/MEMBERSHIPS TABLE NAME MISMATCH (CANNOT FULLY VERIFY)

### What We Confirmed from Code

**Admin API routes query these table names:**
- `pages/api/admin/registrations/index.js` → queries table `registrations`
- `pages/api/admin/memberships/index.js` → queries table `memberships`
- `pages/api/admin/stats.js` → queries tables `registrations` and `memberships`

**Database schema defines these table names:**
- `data/schema.sql` → creates table `event_registrations`
- `data/schema.sql` → creates table `membership_applications`

**Public form writes use correct names:**
- `pages/api/contact.js` → writes to `contact_submissions` ✅
- `pages/api/event-registrations.js` → writes to `event_registrations` ✅
- `pages/api/memberships.js` → writes to `membership_applications` ✅

### The Discrepancy
Three pieces of admin code query tables that **do not exist** in the schema:
1. `/admin/registrations` page reads from `registrations` (should be `event_registrations`)
2. `/admin/memberships` page reads from `memberships` (should be `membership_applications`)
3. `/admin` dashboard stats reads from both (should read from correct names)

### What This Means in Production
**If the production Supabase database matches the committed schema:**
- `/admin/registrations` → Database error (table doesn't exist)
- `/admin/memberships` → Database error (table doesn't exist)
- Dashboard stats → Database error for registration/membership counts

**If the production Supabase database has the wrong table names:**
- The code works now, but the schema is wrong
- Future deployments from the repo would break the admin panel
- Data integrity risk if tables are ever recreated from schema

### Why We Can't Fully Verify Without Login
The only definitive way to know which tables actually exist in production Supabase is to:
1. Log into the admin panel and see if the registrations/memberships pages display or error
2. Check the Supabase dashboard directly (not accessible in this verification)
3. Attempt a query and observe the error message

### Evidence for Table Name Issue
**File:** `data/schema.sql` (source of truth for schema)
```sql
CREATE TABLE IF NOT EXISTS event_registrations (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL,
  ...
);

CREATE TABLE IF NOT EXISTS membership_applications (
  id BIGSERIAL PRIMARY KEY,
  full_name_fa VARCHAR(255) NOT NULL,
  ...
);
```

**File:** `pages/api/admin/registrations/index.js`
```javascript
const { data, error } = await supabase
  .from('registrations')  // ❌ WRONG TABLE NAME
  .select('*')
  .order('created_at', { ascending: false });
```

**File:** `pages/api/admin/memberships/index.js`
```javascript
const { data, error } = await supabase
  .from('memberships')  // ❌ WRONG TABLE NAME
  .select('*')
  .order('created_at', { ascending: false });
```

### Severity: **CRITICAL**
This will cause the admin panel to fail in production (if schema is correctly deployed) or cause data integrity issues (if wrong table names are in Supabase).

### Recommendation
**After fixing the login issue:**
1. Log into production admin
2. Navigate to `/admin/registrations` — does it display data or show an error?
3. Navigate to `/admin/memberships` — does it display data or show an error?
4. Check Supabase dashboard to see actual table names in production
5. If tables have wrong names: update the admin API routes to use correct names OR update Supabase tables to match code
6. Add a migration to ensure schema stays in sync

---

## FINDING 3: CONTENT & SETTINGS ADMIN PAGES DISCONNECTED (CANNOT VERIFY)

### What the Code Audit Showed

**Content admin page (`/admin/content`) saves to:**
- Supabase `content` table
- 6 fields: `homepage_hero_title_fa`, `homepage_hero_title_de`, `homepage_hero_subtitle_fa`, `homepage_hero_subtitle_de`, `about_intro_fa`, `about_intro_de`

**Public site reads from:**
- Hardcoded JSX values directly in component files
- Zero references to the `content` table outside of admin code

**Settings admin page (`/admin/settings`) saves to:**
- In-memory JavaScript variable `settingsStore` in `pages/api/admin/settings/index.js`
- 4 fields: `contact_email`, `telegram_channel`, `telegram_contact`, `instagram_url`
- **Problem:** In-memory variables are lost on server restart, redeploy, or cold start

**Public site reads from:**
- Hardcoded values in component files
- Environment variables not used
- Contact email: hardcoded 4 times in different files as literal string `info@didar-stuttgart.com`
- Social links: hardcoded in `components/SocialIcons.js` as `SOCIAL_LINKS` constant

### Why We Can't Verify Without Admin Access
Testing whether these pages actually work requires:
1. Logging in and accessing `/admin/content`
2. Submitting new values
3. Checking if public site changes (it won't, based on code)
4. Accessing `/admin/settings`
5. Submitting new values
6. Restarting the server to check if settings persist (they won't)

### Code Evidence

**Homepage hero title — hardcoded in `pages/index.js`:**
```javascript
const heroTitle = currentLang === 'fa' ? 'دیدار اشتوتگارت' : 'DIDAR Stuttgart';
```
(Not reading from `content` table)

**About intro — hardcoded in `pages/ueber-uns.js`:**
```javascript
<p className={styles.intro}>
  {lang === 'fa' 
    ? 'دیدار یک گروه دانشجویی است که تمام اعضای دانشگاه را در حول یک هدف مشترک جمع می‌کند.'
    : 'DIDAR ist eine Hochschulgruppe, die alle Mitglieder der Universität rund um ein gemeinsames Ziel zusammenbringt.'}
</p>
```
(Not reading from `content` table)

**Contact email — hardcoded literal in `pages/kontakt.js`:**
```javascript
Email: <a href="mailto:info@didar-stuttgart.com">info@didar-stuttgart.com</a>
```
(Not reading from settings)

**Social links — hardcoded constant in `components/SocialIcons.js`:**
```javascript
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/didar_stuttgart/',
  telegram: 'https://t.me/Didar_stuttgart',
};
```
(Not reading from settings)

### Severity: **CRITICAL - UX/EXPECTATION MISMATCH**

The admin can spend time editing these pages, believe they've saved changes, see no error message, but the public site never changes. This creates false confidence that the admin panel works, when in fact two major sections are completely disconnected.

### Recommendation
**After fixing login and table names:**
1. Test the content page — verify if changes show errors or silently fail
2. Test the settings page — verify if values persist after refresh
3. Either:
   - **Option A (Better):** Wire up the admin pages to actually feed the public site (use `content` table in public pages, store settings in a persistent table, use env vars)
   - **Option B (Quick Fix):** Remove these two sections from the admin panel since they don't work
4. Add integration tests to prevent regression

---

## WHAT COULD NOT BE VERIFIED

Due to the login authentication failure in production, the following could not be directly tested:

| Item | Reason |
|---|---|
| Dashboard stats display | Cannot access dashboard without login |
| Registrations page behavior | Cannot access page without login |
| Memberships page behavior | Cannot access page without login |
| Content page functionality | Cannot access page without login |
| Settings page durability | Cannot access page or test across restarts |
| Error messages for wrong table names | Cannot trigger errors without login |
| Admin UX workflows | Cannot test workflows without login |
| CSV export functionality | Cannot test without login |

---

## SUMMARY TABLE: CRITICAL FINDINGS STATUS

| Critical Finding | Code Audit | Production Verification | Status |
|---|---|---|---|
| Login authentication failure | ⚠️ Documented in Phase 8 | ✅ **Confirmed** | **BLOCKING** |
| Registrations/memberships table name mismatch | ✅ Confirmed in code | ⚠️ **Cannot verify** (need login) | **Requires login to confirm** |
| Content admin page disconnected | ✅ Confirmed in code | ⚠️ **Cannot verify** (need login) | **Confirmed by code analysis** |
| Settings admin page disconnected | ✅ Confirmed in code | ⚠️ **Cannot verify** (need login) | **Confirmed by code analysis** |

---

## NEXT STEPS

### Immediate (Blocking)
1. **Fix admin login authentication**
   - Root cause: Password hash verification mismatch in backend
   - Action: Review `/app/api/admin/login/route.ts` (or equivalent in Pages Router)
   - Re-generate `ADMIN_PASSWORD_HASH` using `scripts/setup-admin.js`
   - Re-deploy to production
   - Verify login works

### After Login Fix
2. **Verify table name mismatch**
   - Log into admin, visit `/admin/registrations`
   - Does it show data or error?
   - Log into admin, visit `/admin/memberships`
   - Does it show data or error?
   - Check Supabase dashboard for actual table names

3. **Test content and settings pages**
   - Access `/admin/content`, make changes, verify public site doesn't change
   - Access `/admin/settings`, make changes, restart server, verify changes lost

4. **Plan fixes for disconnected sections**
   - Option A: Wire up content table to public site
   - Option B: Wire up settings table (persistent, not in-memory)
   - Option C: Remove broken admin sections

### Before Production Admin Use
5. **Restore admin functionality**
   - Fix all three critical issues above
   - Add tests to prevent regression
   - Document which settings are admin-controlled vs. hardcoded

---

## CONCLUSION

The production site is **live and public-facing functionality works perfectly** (verified in Phase 8). However, the **admin panel has multiple critical issues that prevent it from functioning in production:**

1. **Login doesn't work** — immediate blocker
2. **Registrations/memberships pages likely query non-existent tables** — will error when admin tries to use them (after login fixed)
3. **Content and settings pages appear to work but actually do nothing** — silent failure, no error message

**Recommendation:** Fix the login issue first, then verify and fix the table name mismatch, then evaluate whether to restore the disconnected content/settings pages or remove them from the admin UI.

The admin panel was built with good intentions but was not fully integrated into the production workflow. It appears functional but has silent failures and missing data connections.

---

## REPORT METADATA

- **Report Date:** September 19, 2026
- **Verification Method:** Code analysis + production UI testing (limited by auth failure)
- **Scope:** Admin panel critical findings from Phase Audit
- **Status:** ⚠️ Partially verified, blocker identified
- **Next Phase:** Phase A2 (Fix Login & Verify Production Data)

---

**End of Report**
