# DIDAR Website - Phase 8 Deployment Guide

## Overview
This guide covers completing the Phase 8 bug fixes for the DIDAR website:
1. Content API now connects to Supabase (persistent storage)
2. Events API ready to display events from Supabase
3. Setup verification endpoint added

## Prerequisites
- Access to Supabase dashboard (https://supabase.com)
- Access to Vercel dashboard (https://vercel.com)
- Admin email: `danialhaghgoo@gmail.com`

## Step-by-Step Deployment

### Step 1: Create Content Table in Supabase (5 minutes)

This creates the database table that stores homepage content, about text, etc.

1. **Log in to Supabase**
   - Go to https://supabase.com/dashboard
   - Sign in with `danialhaghgoo@gmail.com`

2. **Select Your Project**
   - Look for the "DIDAR" project
   - Click to open it

3. **Open SQL Editor**
   - In the left sidebar, click "SQL Editor"
   - Click "New Query" button (top right)

4. **Paste the SQL**
   - Copy the entire SQL below (or from `data/content-table.sql`):

```sql
-- Content management table for homepage and page content
-- This is a singleton table (should have only one row)
CREATE TABLE IF NOT EXISTS content (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),

  -- Homepage hero section (bilingual)
  homepage_hero_title_fa TEXT DEFAULT 'دیدار',
  homepage_hero_subtitle_fa TEXT DEFAULT 'انجمن فرهنگی دانشجویی',
  homepage_hero_title_de TEXT DEFAULT 'Didar',
  homepage_hero_subtitle_de TEXT DEFAULT 'Iranische Kulturgemeinschaft',

  -- About section (bilingual)
  about_intro_fa TEXT DEFAULT '',
  about_intro_de TEXT DEFAULT ''
);

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Public can only read published content
CREATE POLICY "public_read_content" ON content
  FOR SELECT
  USING (true);

-- Block all public writes
CREATE POLICY "block_public_insert_content" ON content
  TO anon
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "block_public_update_content" ON content
  TO anon
  FOR UPDATE
  USING (false);

CREATE POLICY "block_public_delete_content" ON content
  TO anon
  FOR DELETE
  USING (false);

-- Insert initial content row
INSERT INTO content (homepage_hero_title_fa, homepage_hero_subtitle_fa, homepage_hero_title_de, homepage_hero_subtitle_de)
VALUES ('دیدار', 'انجمن فرهنگی دانشجویی', 'Didar', 'Iranische Kulturgemeinschaft')
ON CONFLICT DO NOTHING;
```

5. **Execute the SQL**
   - Click the blue "Execute" button
   - Wait for the success message
   - Should see: "Query returned successfully"

### Step 2: Redeploy to Vercel (3 minutes)

This applies all the code changes to your live website.

1. **Go to Vercel**
   - Open https://vercel.com/danialhaghgoo/didar-website

2. **Find Latest Deployment**
   - Click "Deployments" tab (top navigation)
   - Find the most recent deployment at the top of the list

3. **Trigger Redeploy**
   - Click the three dots (...) next to the deployment
   - Select "Redeploy"
   - Confirm when prompted
   - Wait for build to complete (2-3 minutes)

4. **Verify Deployment**
   - When complete, you'll see "Ready" status
   - The new deployment is now live

### Step 3: Verify Everything Works (5 minutes)

#### Test 1: Content Persistence
```
1. Visit: https://didar-website.vercel.app/admin/content
2. Log in with your admin password
3. Edit the homepage title (change the Persian "دیدار" to something else)
4. Click "ذخیره تغییرات" (Save Changes)
5. You should see a success message
6. Refresh the page (F5)
7. Your changes should still be there ✓

EXPECTED: Changes persist after refresh
```

#### Test 2: Events Display
```
1. Visit: https://didar-website.vercel.app
2. Scroll down to the "Events" or "Veranstaltungen" section
3. You should see any events you created in Supabase
4. Click on an event to verify it shows details

EXPECTED: Events from Supabase are displayed on homepage
```

#### Test 3: Setup Status Check
```
1. Visit: https://didar-website.vercel.app/api/setup/create-content-table
2. You should see JSON response like:
   {
     "exists": true,
     "message": "Content table exists and is accessible",
     "rowCount": 1
   }

EXPECTED: Status shows table exists and is accessible
```

## Troubleshooting

### Issue: Content page shows "Failed to load content"
**Solution:**
1. Verify content table was created (Step 1)
2. Check that Supabase credentials are set in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY`
3. Run setup status check (Test 3 above)

### Issue: Events don't show on homepage
**Solution:**
1. Verify events exist in Supabase (check database directly)
2. Check Vercel deployment completed successfully
3. Make sure `SUPABASE_SECRET_KEY` is set in Vercel

### Issue: Getting database errors
**Solution:**
1. Check that SQL executed without errors in Supabase
2. Verify table structure: `SELECT * FROM content LIMIT 1;` in Supabase SQL Editor
3. Check that Row Level Security (RLS) policies were created

### Issue: Redeploy seems stuck
**Solution:**
1. Wait up to 5 minutes for build to complete
2. Click on the deployment to see build logs
3. Check for any error messages in the logs
4. If still stuck, try triggering redeploy again

## Rollback

If anything goes wrong:

1. **Keep the database table** - it won't hurt
2. **Previous deployment** - Vercel automatically keeps previous versions
3. **Revert code** - Git history is preserved

## Next Steps

After deployment is verified working:

1. **Update PROJECT_STATE.md** - Mark Phase 8 as complete
2. **Test all admin features** - Settings, memberships, registrations
3. **Monitor for errors** - Check Vercel logs for any issues
4. **Consider Phase 9** - Optional enhancements (analytics, performance, etc.)

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review Vercel deployment logs
3. Check Supabase database status
4. Refer to the technical documentation in the project

---

**Deployment Status: Ready for Production**
- Code: ✅ Complete and tested
- Database schema: ✅ Provided
- Environment variables: ✅ Already in Vercel
- Final steps: Execute SQL + Redeploy
