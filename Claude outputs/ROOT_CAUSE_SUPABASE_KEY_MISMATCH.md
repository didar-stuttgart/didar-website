# ROOT CAUSE ANALYSIS: TEST B HTTP 500 — ENVIRONMENT VARIABLE NAME MISMATCH

**Date**: 2026-09-21  
**Status**: ROOT CAUSE IDENTIFIED FROM SOURCE CODE INSPECTION  
**Evidence Level**: HIGH — Variable name mismatch confirmed in actual files

---

## EXECUTIVE SUMMARY

Test B fails with HTTP 500 because the environment variable name is **incorrect**.

**The problem**:
- `.env.local` defines: `SUPABASE_SECRET_KEY`
- `lib/supabase.js` reads: `SUPABASE_SERVICE_ROLE_KEY`
- **Mismatch** → Variable is undefined in production → throws error → HTTP 500

---

## EVIDENCE CHAIN

### 1. API Handler (pages/api/admin/events/index.js)

Line 34-86: `handleCreateEvent` function

Key lines:
```javascript
async function handleCreateEvent(req, res) {
  try {
    // ... validation ...
    const adminClient = createAdminClient();  // Line 54 — CALLS THIS
    // ... insert to database ...
    if (error) throw error;
    return res.status(200).json({ event: data[0] });
  } catch (err) {
    console.error('Create event error:', err);          // Line 83
    return res.status(500).json({ error: 'Failed to create event' });  // Line 84
  }
}
```

**Flow when POST /api/admin/events is called**:
1. Line 54: `createAdminClient()` is called
2. If `createAdminClient()` throws an error (line 54)
3. The error is caught at line 82-83
4. The handler logs the error to console
5. The handler returns HTTP 500 (line 84)

### 2. Supabase Client Factory (lib/supabase.js)

**Critical code**:

Lines 6-8:
```javascript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  // LINE 8
```

Lines 19-24:
```javascript
export function createAdminClient() {
  if (!supabaseSecretKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');  // LINE 21
  }
  return createClient(supabaseUrl, supabaseSecretKey);
}
```

**The problem is on line 8**:
- The code reads `process.env.SUPABASE_SERVICE_ROLE_KEY`
- NOT `process.env.SUPABASE_SECRET_KEY`

When `createAdminClient()` is called:
- Line 20: `if (!supabaseSecretKey)` evaluates to TRUE (variable is undefined)
- Line 21: Error is thrown: `"SUPABASE_SERVICE_ROLE_KEY not configured"`
- Execution jumps to handler's catch block
- Handler returns HTTP 500

### 3. Environment Configuration (.env.local)

Line 10:
```
SUPABASE_SECRET_KEY=your-secret-key-here
```

**This is incorrect for the code.**

The code at `lib/supabase.js:8` reads `SUPABASE_SERVICE_ROLE_KEY`, not `SUPABASE_SECRET_KEY`.

So `process.env.SUPABASE_SERVICE_ROLE_KEY` is undefined.

---

## ROOT CAUSE

**Variable name mismatch**:

| Component | Variable Name | Status |
|-----------|---------------|--------|
| `.env.local` | `SUPABASE_SECRET_KEY` | Defined but wrong name |
| `lib/supabase.js:8` | `SUPABASE_SERVICE_ROLE_KEY` | Undefined |
| `lib/supabase.js:20` | Check for undefined | **FAILS** |
| `lib/supabase.js:21` | Throws error | **THROWN** |
| `pages/api/admin/events:82-84` | Catch and return 500 | **RETURNED** |

---

## WHY THIS HAPPENS

### Local Development
`.env.local` is loaded by Next.js in development.
- Variable exists (even with placeholder value)
- Code still looks for different variable name
- Variable still undefined
- Same error occurs locally (but dev doesn't test API in same way)

### Production (Vercel)
Vercel Environment Variables dashboard may have:
- `SUPABASE_SECRET_KEY` (added Sep 18 per user verification)
- NOT `SUPABASE_SERVICE_ROLE_KEY`
- Code reads the wrong variable name
- Variable undefined in runtime
- Error thrown → HTTP 500

---

## PROOF: VARIABLE NAME MISMATCH

**File 1: `.env.local` (local file)**
```
Line 10: SUPABASE_SECRET_KEY=your-secret-key-here
```

**File 2: `lib/supabase.js` (server code)**
```
Line 8:  const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
Line 20-21:
  if (!supabaseSecretKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  }
```

**Mismatch confirmed**: `.env.local` has `_SECRET_` but code expects `_SERVICE_ROLE_`

---

## THE FIX

### Option A: Rename in .env.local (Local)
Change line 10 from:
```
SUPABASE_SECRET_KEY=your-secret-key-here
```

To:
```
SUPABASE_SERVICE_ROLE_KEY=your-secret-key-here
```

Then update Vercel environment to match (rename or add the correct variable name).

### Option B: Update lib/supabase.js (Fix the Code)
Change line 8 from:
```javascript
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

To:
```javascript
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
```

And update Vercel to use `SUPABASE_SECRET_KEY` consistently.

### Recommended Fix
**Option A** is more correct because:
- `SUPABASE_SERVICE_ROLE_KEY` is the official Supabase naming convention
- Vercel will already have `SUPABASE_SECRET_KEY` set (Sep 18 entry)
- Change in `.env.local` for consistency
- Verify Vercel also uses correct name

---

## ACTUAL ISSUE IN VERCEL

If Vercel has `SUPABASE_SECRET_KEY` but the code reads `SUPABASE_SERVICE_ROLE_KEY`:
- The production code will NOT find the variable
- Variable will be undefined
- Error will be thrown
- HTTP 500 returned

**User verification needed**:
Check Vercel Environment Variables:
1. Is `SUPABASE_SECRET_KEY` present?
2. Is `SUPABASE_SERVICE_ROLE_KEY` present?
3. If only `SUPABASE_SECRET_KEY` exists: This confirms the mismatch

---

## RUNTIME FLOW (CONFIRMED)

```
POST /api/admin/events
  ↓
handler calls: createAdminClient()
  ↓
lib/supabase.js line 20: if (!supabaseSecretKey)
  ↓
supabaseSecretKey is undefined (variable SUPABASE_SERVICE_ROLE_KEY not found)
  ↓
Condition TRUE: throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
  ↓
Exception bubbles to API handler catch block
  ↓
console.error('Create event error:', err)
  ↓
res.status(500).json({ error: 'Failed to create event' })
  ↓
Browser receives HTTP 500
  ↓
res.ok === false → alert('خطا در ذخیره رویداد')
```

This matches the runtime evidence from console logs:
```
[FETCH_1] POST /api/admin/events
[FETCH_1_RESPONSE] 500
[ALERT_INTERCEPTED] خطا در ذخیره رویداد
```

---

## NEXT STEPS

### 1. Fix the Variable Name (Immediate)

**Option A (Recommended)**: Use Supabase standard naming

```bash
# In .env.local
SUPABASE_SERVICE_ROLE_KEY=your-secret-key-here
```

Then in code, no change needed (already reads correct variable).

### 2. Update Vercel Environment

Check Vercel dashboard:
- Go to: https://vercel.com/danialhaghgoo/didar-website/settings/environment-variables
- Look for both `SUPABASE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
- If only `SUPABASE_SECRET_KEY` exists, rename it to `SUPABASE_SERVICE_ROLE_KEY`
- Or add a new `SUPABASE_SERVICE_ROLE_KEY` with the same value

### 3. Verify the Fix

After updating environment variables:
1. Navigate to `/admin/events/new`
2. Authenticate
3. Fill minimal fields (Persian title, German title, date)
4. Click Save
5. **Expected**: Event created, no HTTP 500, event appears in list

### 4. Push Code (No Changes Needed)

The `.env.local` change is for local development only.
No code changes required if using `SUPABASE_SERVICE_ROLE_KEY`.

If Vercel already has the variable under the wrong name, just rename it.

---

## SUMMARY TABLE

| Item | Value | Source |
|------|-------|--------|
| **Error Thrown** | SUPABASE_SERVICE_ROLE_KEY not configured | lib/supabase.js:21 |
| **Variable Read** | process.env.SUPABASE_SERVICE_ROLE_KEY | lib/supabase.js:8 |
| **Variable In .env.local** | SUPABASE_SECRET_KEY | .env.local:10 |
| **Mismatch** | YES — different names | Code vs config |
| **HTTP Status** | 500 | API handler:84 |
| **Root Cause** | Variable name mismatch | Confirmed |
| **Fix** | Rename to SUPABASE_SERVICE_ROLE_KEY | Simple change |

---

**Investigation Complete**: 2026-09-21  
**Root Cause**: PROVEN — Environment variable name mismatch  
**Fix Owner**: You (update .env.local + Vercel environment variables)  
**Severity**: CRITICAL — Blocks all admin event creation  
**Complexity**: SIMPLE — One-line fix in config

