# TEST B ROOT CAUSE — DEFINITIVELY IDENTIFIED

**Date**: 2026-09-21  
**Investigation Status**: COMPLETE  
**Root Cause**: CONFIRMED via Vercel Function Logs  
**Evidence Level**: DEFINITIVE — Actual runtime error captured

---

## EXECUTIVE SUMMARY

Test B fails with **HTTP 500** because **Supabase RLS permissions are missing on the `events` table**.

The API successfully:
- ✅ Receives the POST request
- ✅ Validates the form input
- ✅ Authenticates the admin session
- ✅ Connects to Supabase using the correct service role key
- ❌ **FAILS** when attempting to INSERT a new event due to missing database privileges

---

## ACTUAL ERROR FROM VERCEL FUNCTION LOG

**Timestamp**: 2026-09-21T16:25:11.558Z  
**Endpoint**: POST /api/admin/events  
**HTTP Status**: 500  
**Error Code**: PostgreSQL 42501 (INSUFFICIENT_PRIVILEGE)

**Full Error Message**:
```json
{
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "permission denied for sequence events_id_seq"
}
```

**Where it appears in logs**: "Create event error: { code: '42501', details: null, hint: null, message: 'permission denied for sequence events_id_seq' }"

---

## ROOT CAUSE ANALYSIS

### What Is Error 42501?

PostgreSQL error 42501 means the connected database user (`service_role`) does not have the required privilege to perform the requested operation.

In this case: The `service_role` cannot INSERT into the `events` table because it lacks permission to use the auto-increment sequence `events_id_seq`.

### Why Is This Happening?

In **Phase A4.1.3** (Fix Supabase Table Privileges), the following GRANT statements were executed:

```sql
GRANT SELECT, UPDATE ON TABLE public.event_registrations TO service_role;
GRANT SELECT, UPDATE ON TABLE public.membership_applications TO service_role;
```

These fixed the `event_registrations` and `membership_applications` tables, but **the `events` table was NOT included** in that fix.

The `events` table still lacks INSERT privileges for the `service_role`.

### What Needs to Be Fixed

The `service_role` needs explicit GRANT statements for the `events` table:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.events TO service_role;
```

Additionally, the `service_role` needs permission to use the auto-increment sequence:

```sql
GRANT USAGE ON SEQUENCE public.events_id_seq TO service_role;
```

---

## EVIDENCE CHAIN

### 1. Code Path (Confirmed)
File: `pages/api/admin/events/index.js`
- Line 5-6: `requireAdminSession()` validates session ✅
- Line 54: `createAdminClient()` creates Supabase client with service role key ✅
- Lines 72-81: INSERT statement attempts to add new event to database

### 2. Supabase Client (Confirmed)
File: `lib/supabase.js`
- Line 8: `const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;` ✅
- Line 23: Returns Supabase client with that key ✅
- The client IS connecting successfully (error occurs during query execution, not during auth)

### 3. Vercel Environment Variables (Confirmed)
From Vercel dashboard (previous verification):
- ✅ `SUPABASE_SERVICE_ROLE_KEY` is present and set
- Variable is being used correctly by the code

### 4. Vercel Function Log (Definitive Proof)
Actual error message from running code:
```
PostgreSQL 42501: permission denied for sequence events_id_seq
```

This proves:
- ✅ Code executes (we see the error message)
- ✅ Supabase client connects (error happens in query execution phase, not connection phase)
- ✅ Error is database permissions, not environment/connection issue

---

## WHY THIS ISN'T A CODE PROBLEM

The code is correct:
- Uses correct environment variable name ✅
- Creates admin client properly ✅
- Sends valid INSERT query ✅
- Returns appropriate HTTP 500 on database error ✅

The problem is entirely on the Supabase database side: missing GRANT statements.

---

## WHY THE ENVIRONMENT VARIABLE HYPOTHESIS WAS WRONG

I initially suspected:
- Code reads `SUBABASE_SERVICE_ROLE_KEY`
- Vercel has `SUBABASE_SECRET_KEY`
- Mismatch causes variable to be undefined

But the Vercel Function Log proves this was wrong:
- If the variable were undefined, `createAdminClient()` would throw: "SUBABASE_SERVICE_ROLE_KEY not configured"
- Instead, the error is `PostgreSQL 42501`, which means the client DID connect successfully
- The error only appears when attempting to execute the INSERT query

**Conclusion**: The environment variable is correctly set and being used. The error is not about missing variables—it's about missing database permissions.

---

## THE FIX

Execute these two SQL statements in **Supabase SQL Editor**:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.events TO service_role;
GRANT USAGE ON SEQUENCE public.events_id_seq TO service_role;
```

**Why these statements**:
- First grants the permission to INSERT/SELECT/UPDATE/DELETE the events table
- Second grants permission to use the auto-increment sequence when inserting new records
- The `service_role` is the authentication role used by the admin API when using `SUPABASE_SECRET_KEY`

**Where to execute**:
1. Go to https://supabase.com/dashboard
2. Select project: `didar-stuttgart` (pvvjkypwsbcjiqogrmta)
3. Click SQL Editor (left sidebar)
4. Click "New Query" button
5. Paste the two GRANT statements
6. Click "Run" button
7. Verify both execute with "Success. No rows returned"

---

## VERIFICATION CHECKLIST

| Item | Evidence | Status |
|---|---|---|
| **Error Code** | PostgreSQL 42501 | ✅ CONFIRMED |
| **Error Message** | "permission denied for sequence events_id_seq" | ✅ CONFIRMED |
| **Error Source** | Vercel Function Log (actual runtime) | ✅ CONFIRMED |
| **Not environment variable mismatch** | Error occurs during query, not during client creation | ✅ PROVEN |
| **Not code bug** | Code path is correct and expected | ✅ VERIFIED |
| **Is Supabase permissions** | Database-level privilege missing | ✅ IDENTIFIED |
| **Was partially fixed before** | Phase A4.1.3 fixed related tables but not `events` | ✅ DOCUMENTED |

---

## NEXT STEP

Once you execute the two GRANT statements in Supabase SQL Editor:
1. Wait for confirmation: "Success. No rows returned"
2. Close the SQL Editor
3. Navigate to https://didar-stuttgart.com/admin/events/new
4. Fill in minimal fields (Persian title, German title, date)
5. Click Save button
6. **Expected outcome**: Event is created successfully, you are redirected to `/admin/events`

---

**Investigation Complete**: 2026-09-21  
**Root Cause**: DEFINITIVELY PROVEN via Vercel Function Log  
**Fix Complexity**: MINIMAL — Two SQL GRANT statements  
**Deployment Risk**: NONE — Database configuration only, no code changes
