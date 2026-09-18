# Phase 8 Events Fix - Root Cause & Solution

## Root Cause
The events are not displaying on the website because **the events table has not been created yet in the Supabase database**.

The code is correct:
- ✅ `/pages/api/events/index.js` - Public API endpoint correctly filters for published events
- ✅ RLS policies defined in `data/schema.sql` - Would allow public read access
- ✅ Database credentials in environment - All set up correctly

But the database table itself doesn't exist yet.

## Solution

The events table needs to be created in Supabase with its Row Level Security policies. I've created two files to help:

1. **`data/events-table.sql`** - Standalone SQL for just the events table
2. **Updated `DEPLOYMENT_GUIDE.md`** - Now includes Step 1b for creating events table

## What You Need To Do

Execute the following SQL in Supabase SQL Editor:

### Step 1: Create Events Table

1. Go to https://supabase.com/dashboard
2. Select your DIDAR project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query" button (top right)
5. Paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  title_fa TEXT NOT NULL,
  title_de TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_fa TEXT,
  description_de TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location_fa TEXT,
  location_de TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  registration_open BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_published_events" ON events
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "block_public_insert_events" ON events
  TO anon
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "block_public_update_events" ON events
  TO anon
  FOR UPDATE
  USING (false);

CREATE POLICY "block_public_delete_events" ON events
  TO anon
  FOR DELETE
  USING (false);
```

6. Click "Execute" button and wait for success message

### Step 2: Add Your Events

Once the table exists, add your events via one of these methods:

**Option A: Use Supabase Table Editor (Easiest)**
1. Go to "Table Editor" in Supabase sidebar
2. Click on "events" table
3. Click "Insert Row" button
4. Fill in: title_fa, title_de, slug, description_fa, description_de, event_date, location_fa, location_de, status ('published'), registration_open (true/false)
5. Save

**Option B: Use SQL INSERT**
```sql
INSERT INTO events (title_fa, title_de, slug, description_fa, description_de, event_date, event_time, location_fa, location_de, status, registration_open)
VALUES 
  ('عنوان رویداد', 'Veranstaltungstitel', 'event-slug', 'توضیح فارسی', 'Deutsche Beschreibung', '2026-09-20', '18:00', 'تهران', 'Berlin', 'published', true);
```

### Step 3: Verify It Works

1. Visit your website homepage: https://didar-website.vercel.app
2. Scroll to "Events" section
3. You should see your events displayed

You can also test the API directly:
- Visit https://didar-website.vercel.app/api/events to see the raw data
- Visit https://didar-website.vercel.app/api/setup/check-events-table to verify the table exists

## Technical Details

**How the events flow works:**
1. Homepage calls `/api/events?status=upcoming` during build (getStaticProps)
2. API endpoint queries Supabase with publishable key (anon access)
3. RLS policy `public_read_published_events` allows read-only access to events where `status = 'published'`
4. API returns filtered events
5. Homepage displays them in EventCard components

**Why RLS works here:**
- The publishable key is limited by RLS policies
- Public users can ONLY read events with `status = 'published'`
- Public users CANNOT write, update, or delete events
- Admin endpoints use secret key to bypass RLS for management

## Files Created/Modified

- ✅ `data/events-table.sql` - New SQL file for events table
- ✅ `pages/api/setup/check-events-table.js` - New diagnostic endpoint
- ✅ `DEPLOYMENT_GUIDE.md` - Updated with events table step
- ✅ All existing code is already correct and ready

## Next Steps

1. Execute the SQL in Supabase (copy from above)
2. Add your events to the table
3. Website will automatically show them (getStaticProps caches for 1 hour)
4. For faster refresh, you can redeploy Vercel: https://vercel.com/danialhaghgoo/didar-website

That's it! The events will start displaying once the table exists and contains published events.
