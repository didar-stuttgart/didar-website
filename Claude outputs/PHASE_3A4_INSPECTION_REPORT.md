# Phase 3A4 — Real Event Data Integration
## Inspection Report & Analysis

**Phase**: Phase 3A4 — Real Event Data Integration  
**Status**: ⏳ Ready for Implementation  
**Date**: September 17, 2026  

---

## Executive Summary

Phase 3A4 requires replacing mock event data (currently in-memory array) with real Supabase database queries. This involves:

1. Creating/verifying `events` table in Supabase with appropriate schema
2. Creating public API route `/api/events` to fetch events from Supabase
3. Updating event pages to query Supabase instead of using mock data
4. Preserving existing Phase 3A1-3A3 form integration
5. Maintaining bilingual support and event registration functionality

The phase preserves all infrastructure (Phase 1), form integrations (Phase 3A1-3A3), and design system (Phase 2) while replacing the temporary mock data layer with persistent database storage.

---

## Current Architecture Analysis

### What Exists (Phase 1 & Phase 3A1-3A3)
✅ **Database Infrastructure**
- Supabase PostgreSQL configured
- Row Level Security (RLS) policies implemented
- `event_registrations` table for storing registrations
- `membership_applications` table for membership requests
- `contact_submissions` table for contact form submissions
- Rate limiting via API middleware
- Server-side validation framework

✅ **API Endpoints**
- `/api/health` — Health check
- `/api/contact/submit` — Contact form (Phase 3A1)
- `/api/memberships/submit` — Membership form (Phase 3A2)
- `/api/registrations/submit` — Event registration (Phase 3A3)

✅ **Form Integrations**
- `pages/kontakt.js` — Contact form UI (Phase 3A1)
- `pages/mitglied-werden.js` — Membership form UI (Phase 3A2)
- Event registration form on event detail page (Phase 3A3)
- i18n support (Persian RTL / German LTR)
- Client-side state management with React hooks
- Error handling and success messages

✅ **i18n System**
- `lib/i18n.js` with translation keys
- Bilingual support for all user-facing strings
- RTL/LTR direction support

---

### What's Missing (Phase 3A4 Gap)

❌ **Events Table**
- No `events` table in Supabase schema yet
- Mock data is in-memory array (JavaScript), not persistent

❌ **Event Management API**
- No `/api/events` endpoint to fetch events
- No filtering by status (upcoming/past)
- No pagination
- No sorting (by date)

❌ **Event Pages Using Real Data**
- Event listing pages currently hardcoded or use mock data
- No dynamic event detail page routing based on real event IDs
- No real event-to-registration-form linking

---

## Required Implementation

### 1. Events Table Schema

**Location**: `data/schema.sql` (add to existing)

**Table Structure**:
```sql
CREATE TABLE events (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,      -- URL slug (e.g., "poetry-night-sept-2026")
  
  -- Bilingual Content
  title_fa TEXT NOT NULL,          -- Persian title
  title_de TEXT NOT NULL,          -- German title
  description_fa TEXT,             -- Persian description
  description_de TEXT,             -- German description
  location_fa TEXT,                -- Persian location
  location_de TEXT,                -- German location
  
  -- Event Details
  date DATE NOT NULL,              -- Event date (YYYY-MM-DD)
  time TIME,                       -- Event start time (HH:MM)
  
  -- Media & Optional Fields
  image_url TEXT,                  -- Hero image URL
  speaker_fa TEXT,                 -- Persian speaker name
  speaker_de TEXT,                 -- German speaker name
  artist_fa TEXT,                  -- Persian artist name
  artist_de TEXT,                  -- German artist name
  program_fa TEXT,                 -- Persian program/agenda
  program_de TEXT,                 -- German program/agenda
  
  -- Registration Management
  registration_status TEXT NOT NULL DEFAULT 'registration_open',
  -- Allowed values: 'registration_open', 'registration_closed', 'past_event'
  
  -- Admin/Metadata
  is_published BOOLEAN DEFAULT false,  -- Admin can draft events
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by_admin BOOLEAN,            -- Track if created by admin
  
  CONSTRAINT valid_registration_status CHECK (
    registration_status IN ('registration_open', 'registration_closed', 'past_event')
  )
);

-- Indexes for performance
CREATE INDEX idx_events_date ON events(date DESC);
CREATE INDEX idx_events_is_published ON events(is_published);
CREATE INDEX idx_events_slug ON events(slug);

-- RLS Policy: Anyone can read published events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_read_public ON events
  FOR SELECT
  USING (is_published = true);
```

**Key Design Decisions**:
- `slug` is unique, readable, and used for routing
- `date` and `time` separate to allow sorting and time display
- `registration_status` is manually controlled (no auto-calculation)
- `is_published` allows admins to draft events without showing them
- Bilingual fields (fa/de) allow independent content per language
- Optional fields (speaker, artist, program) for rich content
- RLS policy allows public read, no public write

---

### 2. API Endpoint: `/api/events`

**File**: `pages/api/events/index.js` (new)

**Purpose**: Fetch events from Supabase, with filtering and sorting

**Features**:
- Filter by status: `?status=upcoming|past|all` (default: upcoming)
- Sort by date ascending or descending
- Return only published events to public
- Cache headers for performance

**Response Structure**:
```javascript
{
  success: true,
  events: [
    {
      id: 123,
      slug: "poetry-night-sept-2026",
      title_fa: "شب شاعری",
      title_de: "Poesieabend",
      date: "2026-10-15",
      time: "19:00",
      image_url: "/images/events/poetry-night.jpg",
      location_fa: "شتوتگارت",
      location_de: "Stuttgart",
      registration_status: "registration_open",
      description_fa: "...",
      description_de: "..."
    }
  ],
  count: 15
}
```

**Implementation**:
```javascript
// pages/api/events/index.js
import { createServerClient } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status = 'upcoming' } = req.query;
    const supabase = createServerClient();
    const today = new Date().toISOString().split('T')[0];

    let query = supabase
      .from('events')
      .select('*')
      .eq('is_published', true);

    // Filter by status
    if (status === 'upcoming') {
      query = query.gte('date', today);
    } else if (status === 'past') {
      query = query.lt('date', today);
    }
    // else: status === 'all', no date filter

    // Sort by date
    query = query.order('date', { ascending: status === 'upcoming' });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    // Cache for 5 minutes (static events don't change frequently)
    res.setHeader('Cache-Control', 'public, max-age=300');

    return res.status(200).json({
      success: true,
      events: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Events endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

### 3. Event Detail Page Updates

**File**: `pages/veranstaltungen/[slug].js` (modify)

**Current State**: Uses mock data or static props
**New State**: Query real event from Supabase using slug

**Implementation Pattern**:
```javascript
// pages/veranstaltungen/[slug].js
import { createServerClient } from '@/lib/supabase';

export async function getStaticProps({ params }) {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    return { notFound: true };
  }

  return {
    props: { event: data },
    revalidate: 3600, // Regenerate every hour
  };
}

export async function getStaticPaths() {
  const supabase = createServerClient();
  
  const { data } = await supabase
    .from('events')
    .select('slug')
    .eq('is_published', true);

  const paths = (data || []).map(event => ({
    params: { slug: event.slug },
  }));

  return {
    paths,
    fallback: 'blocking', // New events generate on first request
  };
}

export default function EventDetail({ event, currentLang }) {
  // Component implementation
  // Receives real event data instead of mock
}
```

---

### 4. Events Listing Page Updates

**File**: `pages/veranstaltungen.js` (modify)

**Changes**:
- Query `/api/events` endpoint instead of using mock data
- Fetch upcoming and past events separately
- Sort correctly
- Handle loading/error states

**Pattern**:
```javascript
export async function getStaticProps() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    // Fetch upcoming events
    const upcomingRes = await fetch(`${baseUrl}/api/events?status=upcoming`);
    const upcomingData = await upcomingRes.json();
    
    // Fetch past events
    const pastRes = await fetch(`${baseUrl}/api/events?status=past`);
    const pastData = await pastRes.json();

    return {
      props: {
        upcomingEvents: upcomingData.events || [],
        pastEvents: pastData.events || [],
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return {
      props: {
        upcomingEvents: [],
        pastEvents: [],
      },
      revalidate: 300, // Retry after 5 minutes on error
    };
  }
}
```

---

### 5. Home Page Updates

**File**: `pages/index.js` (modify)

**Changes**:
- Query `/api/events` for upcoming events
- Show nearest 2-3 upcoming events in hero section
- Link to event details using real slugs
- No mock data

**Pattern**: Similar to events listing page

---

## Data Flow (After Phase 3A4)

```
┌─────────────────────────────────────┐
│        Admin Dashboard              │
│ (Phase 3B - Future)                 │
│ - Create/Edit/Publish Events        │
└────────────┬────────────────────────┘
             │
             ↓
        Supabase PostgreSQL
        (events table)
             ↑
             │
    ┌────────┴────────┐
    ↓                 ↓
GET /api/events   getStaticProps
    │                 │
    ├─────────────────┤
    ↓
Browser / Next.js
  ├─ pages/index.js (homepage)
  ├─ pages/veranstaltungen.js (events listing)
  └─ pages/veranstaltungen/[slug].js (event detail)
       │
       ├─ Display event info
       └─ Event registration form
          (Phase 3A3 - POST /api/registrations/submit)
```

---

## Verification Checklist (Phase 3A4)

### Before Implementation
- [ ] Understand existing Phase 1 schema structure
- [ ] Verify Phase 3A1-3A3 forms still work
- [ ] Confirm Supabase is configured and accessible
- [ ] Review master context for event field requirements

### After Implementation
- [ ] `events` table created in Supabase
- [ ] `/api/events` endpoint responds correctly
- [ ] `getStaticProps` fetches real event data
- [ ] `getStaticPaths` generates routes from database
- [ ] Event detail pages render real content
- [ ] Bilingual content displays correctly (fa/de)
- [ ] Registration form still works with real event IDs
- [ ] Homepage shows upcoming events from database
- [ ] Events page sorts upcoming/past correctly
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] No secrets exposed in code
- [ ] Images load correctly
- [ ] Cache headers work
- [ ] Error states handled gracefully

---

## Key Technical Considerations

### 1. Static Generation vs Dynamic Rendering
- **Decision**: Use `getStaticProps` with `revalidate` (ISR)
- **Reason**: Events don't change frequently, faster performance, reduced database queries
- **Fallback**: Use `fallback: 'blocking'` for new events

### 2. Event ID Storage
- **Current Form**: Uses `eventId` field in registrations
- **Implementation**: Events table `id` matches registration `eventId`
- **Linking**: Event slug → page → event.id → registration form

### 3. Bilingual Content
- **Pattern**: All fields have `_fa` and `_de` suffixes
- **Rendering**: Component displays based on `currentLang` prop
- **No Translation API**: Content is pre-created in both languages

### 4. Image Handling
- **Storage**: URLs stored in `image_url` field
- **Where**: Can be local `/images/` or external CDN
- **Responsive**: Component handles image optimization (Next.js Image)

### 5. RLS Policies
- **Public Events**: Available to read (is_published = true)
- **Admin Events**: Draft events (is_published = false) hidden
- **Future**: Admin authentication for edit/delete (Phase 3B)

---

## Files to Create/Modify

| File | Action | Phase | Purpose |
|------|--------|-------|---------|
| `data/schema.sql` | Modify | 3A4 | Add `events` table |
| `pages/api/events/index.js` | Create | 3A4 | Public events API |
| `pages/veranstaltungen.js` | Modify | 3A4 | Fetch real events |
| `pages/veranstaltungen/[slug].js` | Modify | 3A4 | Real event details |
| `pages/index.js` | Modify | 3A4 | Upcoming events section |

---

## Scope Boundaries (What NOT to do in Phase 3A4)

❌ **Do NOT implement** admin event creation UI (Phase 3B)  
❌ **Do NOT implement** image upload (Phase 3B)  
❌ **Do NOT implement** event publishing workflow (Phase 3B)  
❌ **Do NOT implement** event editing (Phase 3B)  
❌ **Do NOT modify** Phase 3A1-3A3 form code  
❌ **Do NOT change** Phase 1 authentication or security  
❌ **Do NOT add** email automation  
❌ **Do NOT add** capacity logic  

All admin features deferred to Phase 3B (Simple Admin Interface).

---

## Security & Privacy

### Data Protection
- Only published events shown to public
- Draft events (is_published = false) never exposed
- RLS policies enforced at database level
- No admin data leaked in responses

### API Safety
- GET-only endpoint, no public write
- Error messages generic (no information leaks)
- Cache headers prevent stale content
- No sensitive data in response

### Future Admin Access
- Admin authentication (Phase 3B) will use secret key
- Admin can see all events (published + draft)
- Edit/delete operations require admin session

---

## Next Steps (After Phase 3A4)

1. **Phase 3B — Simple Admin Interface**
   - Admin event creation form
   - Event edit/publish/unpublish
   - Image upload
   - Simple dashboard

2. **Phase 3C — Content Management**
   - Homepage hero content editing
   - About page content editing
   - Legal page content (Impressum, Datenschutz)

3. **Phase 4 — Polish & Optimization**
   - Performance tuning
   - Image optimization
   - SEO enhancement
   - Analytics

---

## Summary

Phase 3A4 replaces temporary in-memory mock data with persistent Supabase event storage. This is a foundational change that:

- ✅ Preserves all existing form integrations (Phase 3A1-3A3)
- ✅ Maintains infrastructure security (Phase 1)
- ✅ Keeps design system intact (Phase 2)
- ✅ Enables real event management workflow
- ✅ Sets foundation for admin interface (Phase 3B)

The implementation is straightforward:
1. Add `events` table to Supabase schema
2. Create `/api/events` public endpoint
3. Update page components to fetch from Supabase
4. Maintain RLS policies for security

Ready to begin implementation.

---

**Report Created**: 2026-09-17  
**Status**: Ready for User Approval  
**Next Action**: User confirms phase can proceed → implement  
