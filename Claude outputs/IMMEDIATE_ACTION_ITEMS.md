# Immediate Action Items — Phase 1 Deployment

**Date:** 2026-09-21  
**Status:** Phase 1 implementation complete, ready for production

---

## What You Need to Do Now

### ACTION 1: Execute Database Migration (5 minutes)

**Step 1:** Go to Supabase Dashboard
- Open: https://app.supabase.com
- Select your DIDAR project

**Step 2:** Open SQL Editor
- Click **SQL Editor** in left sidebar
- Click **New Query**

**Step 3:** Run Migration SQL
```sql
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline DATE;
```
- Paste the SQL above
- Click **Run** (play button)
- You should see: "Query executed successfully"

**Step 4:** Verify Columns Were Added
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;
```
- Run this query
- Look for `capacity` (integer, nullable) and `registration_deadline` (date, nullable)
- If you see them → **Migration successful** ✅

---

### ACTION 2: Deploy Code to Production (1-5 minutes)

**Step 1:** Prepare the commits
- On your local machine, ensure all Phase 1 files are in the project folder:
  - `data/schema.sql`
  - `pages/admin/events/[slug].js`
  - `pages/admin/events/index.js`
  - `pages/api/admin/events/index.js`
  - `pages/api/admin/events/[slug].js`

**Step 2:** Commit and push to GitHub
```bash
git add .
git commit -m "Phase 1: Admin panel event management rebuild

- Add capacity and registration_deadline fields
- Implement event create/edit/publish/archive/duplicate
- Add search and status filtering
- Soft-delete archive pattern (no data loss)
- Bilingual Persian/German support"
```

Then push:
```bash
git push origin main
```

**Step 3:** Wait for Vercel deployment
- Go to your Vercel dashboard
- You should see a deployment in progress
- Wait for it to complete (typically 2-3 minutes)
- Once complete, your site is updated

---

### ACTION 3: Test the Deployment (10 minutes)

**Step 1:** Login to admin panel
- Go to: `https://yourdomain.com/admin/login`
- Login with your admin credentials
- Navigate to: `/admin/events`

**Expected result:** Event list page loads without errors

**Step 2:** Create a test event
- Click **+ رویداد جدید** (New Event)
- Fill in the form:
  - Persian Title: "تست رویداد فاز یک"
  - German Title: "Test Event Phase 1"
  - Event Date: Any future date (e.g., 2026-10-01)
  - **Capacity: 50** (NEW FIELD — verify it appears)
  - **Registration Deadline: Any future date** (NEW FIELD — verify it appears)
  - Status: Draft
- Click **ذخیره رویداد** (Save Event)

**Expected result:** Event created, appears in list with both new fields

**Step 3:** Edit the event
- Click on the test event to edit
- Verify `Capacity` field shows "50"
- Verify `Registration Deadline` field shows the date
- Change capacity to "100"
- Click save

**Expected result:** Changes saved, capacity now shows "100"

**Step 4:** Publish and preview
- Change status to "Published"
- Click save
- Click **پیش‌نمایش** (Preview) button
- Event opens on public site

**Expected result:** Event visible on public page

**Step 5:** Archive the test event
- Go back to admin
- Click **بایگانی** (Archive) button
- Confirm action
- Event status changes to "archived"

**Expected result:** Event hidden from normal list (only appears in "All" filter)

**Step 6:** Test search and filter
- Type "تست" in search box → finds test event
- Filter by "Draft" → no results
- Filter by "Published" → no results (archived)
- Filter by "All" → finds test event

**Expected result:** All searches and filters work correctly

---

## Summary of Deliverables

You now have these documents in `/mnt/user-data/outputs/`:

| Document | What It Contains |
|----------|------------------|
| **PHASE_1_COMPLETION_SUMMARY.md** | Executive summary of what was built and current status |
| **PHASE_1_QA_REPORT.md** | Complete 20-point QA verification |
| **PRODUCTION_MIGRATION_GUIDE.md** | Detailed migration and deployment instructions |
| **IMMEDIATE_ACTION_ITEMS.md** | THIS FILE — step-by-step actions for you |
| **events_index_list.js** | Final admin events list component |
| **events_slug_form.js** | Final admin events form component |

All files are ready for review and deployment.

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Database Migration | ~5 min | **⏳ YOU DO THIS NOW** |
| Code Deployment | ~5 min | **⏳ THEN THIS** |
| Test Verification | ~10 min | **⏳ THEN THIS** |
| **Total** | **~20 min** | Ready for Production |

---

## Important Notes

### What Changed
- Database: Added 2 new optional columns
- Code: Modified 5 files (all in canonical project folder)
- Features: Complete event management UI (no code changes needed to use it)
- Users: Can now manage events without technical help

### What Stayed the Same
- Admin authentication (no changes to security)
- Public event pages (still work normally)
- Event registration system (still works, deadline/capacity enforcement is Phase 2)
- Everything else (unmodified)

### No Rollback Needed If Something Goes Wrong
- Both new database columns are optional (allow NULL)
- If you need to roll back, existing events work fine without the new columns
- Soft-delete means no data is ever permanently lost

---

## Getting Help

If you encounter any issues during deployment:

1. **Check the error message** — most errors are clear
2. **Verify database migration** ran successfully (see ACTION 1, Step 4)
3. **Clear browser cache** and try again (Ctrl+Shift+Delete or Cmd+Shift+Delete)
4. **Check Vercel deployment log** for any build errors
5. **Restart your dev server** if testing locally

**Common Issue:** "New fields not appearing in form"
- Solution: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- If still not working: Verify code deployment completed in Vercel dashboard

---

## After Deployment is Complete

Once Phase 1 is verified in production:

1. ✅ You can immediately start using the admin panel to manage events
2. ✅ All Phase 1 features are live (create, edit, publish, archive, duplicate, search, filter)
3. ✅ Users can register for open events (registration system unchanged)
4. ✅ Archived events don't appear publicly but data is preserved

**Phase 2 (whenever you want to start):**
- Capacity enforcement on registration
- Registration deadline enforcement
- Restore UI for archived events
- Image upload to storage
- Bulk operations

But Phase 1 is **complete and production-ready now.**

---

**Next Session:** Execute ACTION 1, 2, and 3 above to complete Phase 1 deployment.
