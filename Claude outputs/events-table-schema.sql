-- Add events table to data/schema.sql
-- This SQL should be added to the existing schema.sql file

-- Events table for storing event data
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,           -- URL slug (e.g., "poetry-night-2026")

  -- Bilingual content
  title_fa TEXT NOT NULL,              -- Persian title
  title_de TEXT NOT NULL,              -- German title
  description_fa TEXT,                 -- Persian description
  description_de TEXT,                 -- German description
  location_fa TEXT,                    -- Persian location
  location_de TEXT,                    -- German location

  -- Event details
  date DATE NOT NULL,                  -- Event date (YYYY-MM-DD)
  time TIME,                           -- Event time (HH:MM)
  image_url TEXT,                      -- Event image URL

  -- Optional rich content fields
  speaker_fa TEXT,                     -- Persian speaker
  speaker_de TEXT,                     -- German speaker
  artist_fa TEXT,                      -- Persian artist
  artist_de TEXT,                      -- German artist
  program_fa TEXT,                     -- Persian program/agenda
  program_de TEXT,                     -- German program/agenda

  -- Status management
  registration_status TEXT NOT NULL DEFAULT 'registration_open',
  -- Allowed: 'registration_open', 'registration_closed', 'past_event'
  is_published BOOLEAN DEFAULT false,  -- Admin can draft events

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_registration_status CHECK (
    registration_status IN ('registration_open', 'registration_closed', 'past_event')
  ),
  CONSTRAINT valid_date CHECK (date >= CURRENT_DATE - INTERVAL '1 year')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date_published ON events(date DESC) WHERE is_published = true;

-- Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public can read published events only
CREATE POLICY events_read_public ON events
  FOR SELECT
  USING (is_published = true);

-- No public write access
CREATE POLICY events_no_public_write ON events
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY events_no_public_update ON events
  FOR UPDATE
  USING (false);

CREATE POLICY events_no_public_delete ON events
  FOR DELETE
  USING (false);
