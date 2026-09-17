# Phase 3A4 — Real Event Data Integration
## Implementation Guide

**Status**: Ready to implement  
**Date**: September 17, 2026  
**Target**: Replace mock event data with real Supabase events  

---

## Files to Modify/Create

### 1. **data/schema.sql** — ADD events table
**Action**: Append to existing schema.sql

See `events-table-schema.sql` for complete SQL.

**What it does**:
- Creates `events` table with bilingual fields (title_fa/de, description_fa/de, location_fa/de)
- Stores event metadata (date, time, image_url, speaker, artist, program)
- Manages registration status (registration_open, registration_closed, past_event)
- Supports draft/published events (is_published flag)
- Implements RLS to allow public read-only access
- Adds performance indexes on date and slug

**Important**: 
- Only published events visible to public
- Draft events (is_published = false) are hidden
- No public write access (RLS enforced)

**Deployment**: 
In Supabase Dashboard → SQL Editor → Copy/paste the schema → Run

---

### 2. **pages/api/events/index.js** — NEW public events endpoint
**Action**: Create new file

See `pages-api-events-index.js`

**What it does**:
- GET-only endpoint
- Fetches events from Supabase
- Supports status filter: `?status=upcoming|past|all`
- Returns only published events
- Sets cache headers (5 min)
- Handles errors gracefully

**Query Response**:
```json
{
  "success": true,
  "events": [
    {
      "id": 123,
      "slug": "poetry-night",
      "title_fa": "شب شاعری",
      "title_de": "Poesieabend",
      "date": "2026-10-15",
      "time": "19:00",
      "location_fa": "شتوتگارت",
      "location_de": "Stuttgart",
      "registration_status": "registration_open",
      "image_url": "/images/events/poetry.jpg"
    }
  ],
  "count": 1
}
```

**Testing**:
```bash
curl http://localhost:3000/api/events?status=upcoming
curl http://localhost:3000/api/events?status=past
curl http://localhost:3000/api/events?status=all
```

---

### 3. **pages/veranstaltungen/[slug].js** — MODIFY event detail page
**Action**: Replace existing file

See `pages-veranstaltungen-slug.js`

**What it does**:
- Uses `getStaticProps` to fetch real event by slug from Supabase
- Uses `getStaticPaths` to generate routes from all published events
- Includes EventRegistrationForm component (same as Phase 3A3)
- Displays bilingual event content (fa/de)
- Shows event metadata (date, time, location, speaker, artist, program)
- Supports RTL/LTR based on currentLang
- Implements proper SEO (title, meta, Open Graph)
- Form submission still works with real event.id

**Key Points**:
- Form's eventId comes from real database event.id
- Registration still posts to /api/registrations/submit (unchanged)
- Draft events (is_published = false) return 404
- ISR revalidate: 3600 (regenerates every hour)
- Static fallback: blocking (new events generate on first request)

**Security**:
- Only published events accessible
- Form validates event exists and is registered
- eventId passed from real database (can't be spoofed)

---

### 4. **pages/veranstaltungen.js** — MODIFY events listing page
**Action**: Replace existing file

See `pages-veranstaltungen.js`

**What it does**:
- Uses `getStaticProps` to fetch upcoming and past events
- Calls `/api/events?status=upcoming` and `?status=past`
- Displays event cards with bilingual content
- Links to event detail pages
- Shows registration status badge
- Supports RTL/LTR and bilingual rendering
- Cached for performance (revalidate: 3600)

**Key Points**:
- Upcoming events sorted soonest → latest
- Past events sorted most recent → oldest
- Shows "No upcoming events" message if empty
- Only published events displayed
- Event cards link to /veranstaltungen/[slug]

---

### 5. **pages/index.js** — MODIFY homepage
**Action**: Replace existing file

See `pages-index.js`

**What it does**:
- Uses `getStaticProps` to fetch featured events
- Displays 2-3 upcoming events in hero section
- Shows event teasers with date, time, location
- Links to full events page and event details
- Bilingual content (fa/de)
- Cached for performance (revalidate: 3600)

**Key Points**:
- Takes only first 2-3 events for teaser
- Shows "Learn More" link to /veranstaltungen
- Maintains existing hero, about, and membership sections
- Real events replace mock data
- Still supports traditional links (no changes to other sections)

---

## Bilingual Content Implementation

All event content is stored bilingual in Supabase:

```
title_fa / title_de       — Event title
description_fa / description_de  — Event description
location_fa / location_de — Event location
speaker_fa / speaker_de   — Speaker name
artist_fa / artist_de     — Artist name
program_fa / program_de   — Program/agenda
```

**Rendering Pattern**:
```javascript
const content = currentLang === 'fa' ? event.title_fa : event.title_de;
```

**Admin** (Phase 3B) will provide both language versions when creating events.

---

## RTL/LTR Support

All pages use:
```javascript
const dir = currentLang === 'fa' ? 'rtl' : 'ltr';
// Then render: <section dir={dir}>
```

Existing CSS handles RTL/LTR layout automatically (flexbox, margins, etc).

---

## Event Registration Form Integration (Phase 3A3 Preserved)

The registration form component is included in `/veranstaltungen/[slug].js`:

```javascript
<EventRegistrationForm event={event} currentLang={currentLang} />
```

**Form behavior**:
- Only shows if `event.registration_status === 'registration_open'`
- Submits to `/api/registrations/submit` (unchanged)
- Passes real `event.id` as `eventId`
- Handles all validation/errors same as before
- Shows success/error messages same as before

**No changes needed** to Phase 3A3 API or form submission logic.

---

## Security & RLS

**Database Level**:
- `is_published = false` events never exposed
- RLS policy: `WHERE is_published = true` for public SELECT
- No public INSERT/UPDATE/DELETE on events table

**API Level**:
- `/api/events` only fetches published events
- `getStaticProps` only generates routes for published events
- Draft events return 404 on detail page

**Form Registration**:
- eventId comes from real database (can't be forged)
- API validates eventId exists before accepting registration

---

## Performance & Caching

**Static Generation (ISR)**:
- Event listing: `revalidate: 3600` (1 hour)
- Event detail: `revalidate: 3600` (1 hour)
- Homepage: `revalidate: 3600` (1 hour)
- `/api/events`: `Cache-Control: public, max-age=300` (5 minutes)

**Fallback Behavior**:
- `fallback: 'blocking'` on event detail
- New events generate on first request
- Existing events regenerated hourly

**Result**: 
- Very fast loads (static HTML)
- Events update within 1 hour of publish
- New events available immediately after creation

---

## Testing Checklist

After implementation:

### 1. Database
- [ ] `events` table created in Supabase
- [ ] Sample events added manually or via seed script
- [ ] RLS policies verified
- [ ] Published events visible, draft events hidden

### 2. API Endpoint
- [ ] `/api/events` returns upcoming events
- [ ] `/api/events?status=past` returns past events
- [ ] `/api/events?status=all` returns all published events
- [ ] Response includes all required fields
- [ ] Cache headers present

### 3. Events Listing Page
- [ ] `/veranstaltungen` loads
- [ ] Upcoming events displayed correctly
- [ ] Past events displayed correctly
- [ ] Persian and German text correct
- [ ] RTL/LTR rendering correct
- [ ] Links to event detail work
- [ ] "No events" message shows if empty

### 4. Event Detail Page
- [ ] `/veranstaltungen/[slug]` loads real event
- [ ] Event title, date, time, location display
- [ ] Image displays if present
- [ ] Bilingual content correct (Persian and German)
- [ ] RTL/LTR correct for language
- [ ] Registration form appears when status = registration_open
- [ ] Registration form hidden when status = registration_closed or past_event
- [ ] Form submission still works
- [ ] Success/error messages display correctly
- [ ] Back link to events page works

### 5. Homepage
- [ ] Featured events display (2-3)
- [ ] Event links work
- [ ] "All Events" link shows /veranstaltungen
- [ ] Bilingual content correct
- [ ] RTL/LTR correct
- [ ] No errors in console

### 6. Language Switching
- [ ] Persian/German switch works
- [ ] All event content updates to correct language
- [ ] RTL/LTR updates correctly
- [ ] No console errors

### 7. Build & Lint
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] No errors in build output
- [ ] `.next/` generated successfully

### 8. Security
- [ ] Draft events never visible to public
- [ ] No SUPABASE_SECRET_KEY exposed
- [ ] No database credentials in code
- [ ] Form validation still enforced
- [ ] Rate limiting still works

---

## Migration from Mock Data

**Old (Phase 2-3A3)**:
```javascript
// Mock data in memory
const mockEvents = [
  { id: 1, slug: 'event-1', title_fa: '...', ... }
];
```

**New (Phase 3A4)**:
```javascript
// Real data from Supabase
const { data: event } = await supabase
  .from('events')
  .select('*')
  .eq('slug', 'event-1')
  .single();
```

**No changes** to component rendering logic — both use same event structure.

---

## Minimal Admin Work

**No admin UI needed yet** (Phase 3B).

**For now, event creation is manual via Supabase Dashboard**:
1. Open Supabase project → Table Editor
2. Click `events` table
3. Click `Insert Row`
4. Fill in event data (title_fa, title_de, description_fa/de, date, time, etc)
5. Set `is_published = true` to show on website
6. Event appears on site within 1 hour

**Phase 3B** will add a proper admin interface.

---

## Rollback Plan

If issues arise:

1. Revert modified files to Phase 3A3 versions
2. Keep `events` table in database (can be used again)
3. Events list will fallback to mock data
4. Registration forms still work (not affected)

**No data loss** — Supabase retains all event data and registrations.

---

## Next Phase (Phase 3B)

Phase 3B will add:
- Admin event creation/editing UI
- Image upload
- Event publishing workflow
- Admin dashboard to manage events

Phase 3A4 only adds **public read access** to real events.
No admin features yet.

---

## Files Changed Summary

| File | Action | Notes |
|------|--------|-------|
| `data/schema.sql` | ADD | events table + RLS |
| `pages/api/events/index.js` | CREATE | New endpoint |
| `pages/veranstaltungen/[slug].js` | MODIFY | Real event detail |
| `pages/veranstaltungen.js` | MODIFY | Real event listing |
| `pages/index.js` | MODIFY | Real featured events |

**Total files**: 5 changes  
**Phase 1-3A3 untouched**: ✅ No changes to past phases  
**Security**: ✅ RLS enforced, no secrets exposed  
**Bilingual**: ✅ Persian/German fully supported  
**Performance**: ✅ Static generation + caching  

---

## Implementation Order

1. Add events table to `data/schema.sql`
2. Deploy schema to Supabase (SQL Editor)
3. Create `/api/events/index.js`
4. Update `/pages/veranstaltungen/[slug].js`
5. Update `/pages/veranstaltungen.js`
6. Update `/pages/index.js`
7. Run `npm run lint` and `npm run build`
8. Test all pages and event forms
9. Verify git diff (only these 5 files changed)
10. Wait for user approval before committing

---

## Expected Result

✅ Real Supabase events displayed on website  
✅ Event detail pages dynamic (based on slug)  
✅ Event registration forms work with real event IDs  
✅ Bilingual content fully functional  
✅ Homepage shows featured events from database  
✅ Events page shows upcoming and past events  
✅ All Phase 1-3A3 functionality preserved  
✅ No breaking changes to security or auth  
✅ Build succeeds, no errors  
✅ Ready for Phase 3B (admin interface)  

---

**Status**: Implementation guide complete  
**Ready**: To implement Phase 3A4  
