# DIDAR Phase 1 — Production Migration Guide

**Date:** 2026-09-21  
**Phase:** 1 (Event Management Implementation)  
**Status:** Ready for Deployment

---

## OVERVIEW

Phase 1 implementation is **COMPLETE** and all code changes have been deployed to the project repository. The **only remaining step** is to apply the database schema migration to your production Supabase database.

This guide walks you through:
1. Applying the schema migration
2. Verifying the migration was successful
3. Testing Phase 1 functionality
4. Cleanup procedures

---

## PART 1: APPLY SCHEMA MIGRATION

### What Changed?

Two new columns have been added to the `events` table:
- `capacity INT` — optional field for event capacity limits
- `registration_deadline DATE` — optional field for registration deadline

These columns are **optional** (allow NULL), so existing events won't break.

### How to Apply the Migration

**Option A: Supabase Dashboard (Recommended for non-technical users)**

1. Open your Supabase project: https://app.supabase.com
2. Navigate to the **SQL Editor** section
3. Click **New Query**
4. Paste the following SQL:

```sql
-- Add capacity column
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INT;

-- Add registration_deadline column
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline DATE;
```

5. Click **Run** (the play button)
6. You should see: `Query executed successfully`

**Option B: Command Line (psql)**

If you have psql installed locally:

```bash
# Replace SUPABASE_URL, DATABASE_PASSWORD with your actual credentials
psql "postgresql://postgres:[DATABASE_PASSWORD]@[SUPABASE_URL]:5432/postgres" << EOF
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline DATE;
EOF
```

---

## PART 2: VERIFY THE MIGRATION

After running the SQL, verify the columns were added:

### Verification Query

In the Supabase SQL Editor, run:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;
```

### Expected Output

You should see all event columns including:
- `capacity` (integer, nullable)
- `registration_deadline` (date, nullable)

If you see these columns, **the migration was successful**.

---

## PART 3: DEPLOY CODE CHANGES

After the database migration is complete, deploy the code changes to your production environment:

### Files Modified in Phase 1

1. **data/schema.sql** — Added column definitions (documentation only)
2. **pages/admin/events/[slug].js** — Enhanced form with new fields and actions
3. **pages/admin/events/index.js** — Added search and filter UI
4. **pages/api/admin/events/index.js** — Updated POST handler for new fields
5. **pages/api/admin/events/[slug].js** — Updated PATCH handler and soft-delete DELETE

### Deployment Steps

1. Pull latest code from repository
2. Run `npm install` (no new dependencies added)
3. Deploy to production (your usual deployment process)
4. Restart the application

---

## PART 4: TEST THE DEPLOYMENT

After code deployment, perform these quick verification tests:

### Test 1: Admin Login

1. Go to: `https://yourdomain.com/admin/login`
2. Login with your admin credentials
3. Navigate to: `/admin/events`
4. You should see the event list page

**Expected:** Login works, events page loads

### Test 2: Create Event (with new fields)

1. Click **+ رویداد جدید** (New Event)
2. Fill in the form:
   - Persian Title: "تست رویداد جدید"
   - German Title: "Test Event New"
   - Event Date: Any future date
   - **Capacity: 100** (new field)
   - **Registration Deadline: Any future date** (new field)
   - Other fields as needed
3. Click **ذخیره رویداد** (Save Event)

**Expected:** Event created successfully, form includes new fields

### Test 3: Edit Event

1. Click on an existing event
2. Scroll down to verify:
   - Capacity field shows value
   - Registration Deadline field shows date
3. Modify capacity to a different number
4. Click **ذخیره رویداد** (Save Event)

**Expected:** Changes saved, fields persist

### Test 4: Archive Event (Soft-Delete)

1. From event list, click on any event
2. Click **بایگانی** (Archive) button
3. Confirm the action
4. Check the event list

**Expected:** Event status changes to "archived", data is preserved

### Test 5: Search and Filter

1. From event list, type in search box
2. Filter by status (Published, Draft, Archived)

**Expected:** Search and filters work correctly

---

## PART 5: KNOWN LIMITATIONS (Phase 1)

These features are **intentionally deferred** to Phase 2:

1. **Capacity Enforcement:** Field exists but registrations aren't blocked when capacity is reached
2. **Registration Deadline Enforcement:** Field exists but registrations aren't blocked after deadline
3. **Restore Functionality:** Archive is one-way in the UI (can restore via database edit if needed)
4. **Image Upload:** Currently URL-only, no file upload to cloud storage
5. **Bulk Operations:** No bulk archive/publish functionality

**These are NOT bugs — they are documented Phase 2 enhancements.**

---

## PART 6: TROUBLESHOOTING

### Issue: "Column already exists" error

**Solution:** The migration uses `IF NOT EXISTS`, so if the columns already exist, you'll see this message. This is normal and safe.

### Issue: Events not loading after migration

**Solution:** 
1. Clear browser cache
2. Restart your application server
3. Verify the new columns exist (see Part 2)

### Issue: New fields not appearing in form

**Solution:**
1. Verify code deployment completed
2. Check that all 5 files listed in Part 3 were deployed
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Public events not displaying correctly

**Solution:**
1. Verify the migration ran successfully
2. Published events should appear normally
3. Archive events are hidden from public (expected behavior)

---

## PART 7: CLEANUP & NEXT STEPS

### After Verification

1. **Archive test events** you created during testing
2. **Keep all data** — soft-delete means nothing is permanently removed
3. **No manual cleanup needed** — events are automatically filtered by status

### Next Steps

**Phase 1 is now complete and production-ready.**

For Phase 2 (deferred enhancements):
- Capacity enforcement on registration
- Deadline enforcement on registration  
- Restore UI for archived events
- Image upload to cloud storage
- Bulk operations

---

## CRITICAL CHECKLIST

- [ ] Database migration executed successfully
- [ ] New columns verified in Supabase
- [ ] Code deployed to production
- [ ] Admin login works
- [ ] Can create event with capacity field
- [ ] Can create event with registration deadline field
- [ ] Can edit events and changes persist
- [ ] Can archive events (soft-delete)
- [ ] Search and filter working
- [ ] Public events display correctly
- [ ] No errors in application logs

---

## GETTING HELP

If you encounter any issues:

1. **Check application logs** for error messages
2. **Verify database connection** in Supabase dashboard
3. **Clear browser cache** and try again
4. **Restart your application** server

---

**Migration Guide Generated:** 2026-09-21  
**Ready for Production:** Yes  
**Estimated Deployment Time:** 5-10 minutes (migration) + your usual deploy time
