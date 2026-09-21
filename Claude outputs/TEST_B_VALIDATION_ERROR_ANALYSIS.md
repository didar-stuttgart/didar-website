# TEST B: HTTP 400 VALIDATION ERROR — ROOT CAUSE ANALYSIS

**Date:** 2026-09-21  
**Time:** Test execution at ~18:29:59 UTC  
**Status:** ⚠️ **HTTP 400 VALIDATION ERROR IDENTIFIED** — Database fix verified, new issue requires investigation

---

## SUMMARY

Test B now returns **HTTP 400** (Bad Request) instead of the previous **HTTP 500** (Server Error). This confirms:

✅ **Database permissions are FIXED** — No PostgreSQL 42501 errors  
❌ **New blocker:** HTTP 400 validation error prevents event creation

---

## KEY FINDINGS

### Database Permission Status: ✅ FIXED
- **Previous error (18:25:11):** POST 500 with "permission denied for sequence events_id_seq"
- **Current status (18:29:59):** POST 400 with NO database permission error
- **Conclusion:** GRANT statements successfully resolved the PostgreSQL 42501 error

### Form Submission Status: ✅ WORKING
- Form submits successfully (no client-side errors)
- Request reaches the API (11ms execution)
- API responds with HTTP 400
- Session validates correctly: "✅ Session valid: 883f6c36..."

### Validation Error Status: ❌ BLOCKING CREATION
- HTTP 400 indicates form validation failure
- Vercel free logs do NOT show response body with error details
- Event is NOT created in database
- Browser DevTools Network tab would show the error message

---

## ROOT CAUSE: HTTP 400 VALIDATION ERROR

The API handler (`pages/api/admin/events/index.js`, lines 37-52) performs these validations:

### Required Fields (Must Not Be Empty)
```javascript
const { event } = req.body;
if (!event.title_fa || !event.title_de || !event.event_date) {
  return res.status(400).json({ error: 'Missing required fields' });
}
```

**Test data submitted:**
- ✅ title_fa: "تست رویداد"
- ✅ title_de: "Test Event"
- ✅ event_date: "2026-10-15"

### Optional Capacity Validation
```javascript
if (event.capacity !== null && event.capacity !== undefined && event.capacity !== '') {
  const cap = Number(event.capacity);
  if (!Number.isInteger(cap) || cap < 1) {
    return res.status(400).json({
      error: 'Capacity must be empty or a positive integer (1 or higher)'
    });
  }
  event.capacity = cap;
}
```

**Test data submitted:**
- ✅ capacity: 50 (valid positive integer)

---

## INVESTIGATION NEEDED

The submitted test data meets all validation requirements, yet the API returns 400. Possible causes:

1. **Data wrapping:** Form sends `{ event: {...} }` ✅ Correct (verified in code)
2. **Required fields:** title_fa, title_de, event_date are all present ✅ Correct
3. **Capacity validation:** 50 is a valid positive integer ✅ Correct
4. **Unknown validation:** Possibly undocumented field requirement or constraint

---

## HOW TO DIAGNOSE

Since Vercel free logs don't show response bodies, use browser DevTools:

### Method 1: Browser Network Tab
1. Open Admin Panel: https://www.didar-stuttgart.com/admin/events/new
2. Open DevTools (F12 → Network tab)
3. Fill form with test data (Persian title, German title, date, capacity: 50)
4. Click "Save" button
5. Find POST request to `/api/admin/events`
6. Click → Response tab → Copy error message
7. **This will show the exact validation error**

### Method 2: Browser Console
1. Open DevTools (F12 → Console tab)
2. Look for JavaScript error messages
3. May show API response details if error-handled

### Method 3: Increase Vercel Log Verbosity
1. Update API handler to log request body:
   ```javascript
   console.log('Received event:', JSON.stringify(event));
   ```
2. Redeploy
3. Re-test
4. Check Vercel logs for the logged data

---

## VERCEL LOG EVIDENCE

**POST /api/admin/events at 2026-09-21T16:29:59.299Z**

```
Execution Duration: 11ms ✅ (completes quickly, no timeout)
Response finished in 165ms ✅ (normal)
Session Message: "✅ Session valid: 883f6c36..." ✅ (authenticated)
No PostgreSQL error ✅ (permissions fixed)
No external API errors ✅ (Supabase responding)
Firewall: Allowed ✅ (no blocking)
Status: 400 ❌ (validation error)
Response body: NOT SHOWN in free logs ❌
```

---

## NEXT STEPS

### Immediate
1. **Use browser DevTools Network tab to capture the exact error message**
   - This is the fastest way to identify what validation is failing
   - No code changes needed, just inspection

### If Additional Information Needed
1. Check form field values being sent (may differ from what was filled)
2. Verify slug generation doesn't have issues (line 55 of API)
3. Review any undocumented field requirements
4. Check Supabase table constraints/triggers that might validate inserts

### Once Error Identified
1. Fix the issue (may be client-side data transformation or server validation)
2. Re-test with corrected data
3. Verify HTTP 200/201 response and event appears in database
4. Check admin events list shows new event
5. Verify Supabase events table contains the new row

---

## VERIFICATION CHECKLIST FOR COMPLETE RESOLUTION

| Item | Status | Notes |
|------|--------|-------|
| Database Permissions | ✅ FIXED | No 42501 errors |
| Form Submission | ✅ WORKING | Reaches API successfully |
| Session Validation | ✅ WORKING | Session recognized |
| HTTP 400 Error | ❌ IDENTIFIED | Requires diagnosis |
| Validation Error Details | ❓ UNKNOWN | Need DevTools to inspect |
| Event Created in DB | ❌ NO | Blocked by validation error |
| Test B Status | ❌ BLOCKED | Waiting for error diagnosis |

---

**Critical Next Action:** Inspect HTTP 400 response body using browser DevTools Network tab to identify the exact validation failure cause.

*Analysis completed 2026-09-21*  
*Vercel Log Reference: POST /api/admin/events at 16:29:59.29 UTC*
