# Known Issues and Project State

## Current Status

**As of:** September 28, 2026

**Overall Status:** PRODUCTION READY

The DIDAR website is fully functional in production. Core features are implemented and tested. All three form systems (event registration, membership, contact) are working correctly. Email notifications are being sent to admins. The admin dashboard is operational.

---

## Known Limitations

### Capacity Enforcement

**Status:** NOT IMPLEMENTED (intentional)

**What This Means:**
- The `capacity` field in the events table is displayed on event pages as informational text only
- Users can register for an event even if registrations exceed the capacity limit
- No automatic enforcement (e.g., disabling registration form when full)
- Admins manually review registrations and decide who to confirm based on capacity

**Why:** DIDAR intentionally chose a manual review model. Capacity is informational for admins to see while reviewing registrations.

**Future Consideration:** If automatic capacity enforcement is desired, this is a major architecture change requiring:
- Frontend change to disable form when capacity reached
- Backend change to enforce limit in RPC function
- Admin notification that capacity was reached
- Possibly a waitlist system

### Verification Emails

**Status:** NOT IMPLEMENTED (intentional)

**What This Means:**
- Users do NOT receive verification emails after submitting forms
- Users do NOT receive verification links or tokens
- Registrations are stored immediately without requiring user confirmation
- Admins receive notification emails and manually contact users

**Why:** DIDAR uses a manual review model. Admins decide who to contact and confirm based on manual review.

**Future Consideration:** If automatic email confirmations are desired, this requires a major architecture redesign.

---

## Intentionally Deferred Work

### User Accounts / Member Profiles

**Status:** OUT OF SCOPE

- No user login system for members or registrants
- No member profile pages
- No password resets
- No email verification chains

**Why:** DIDAR operates manually. Membership is managed by admins, not self-service.

**If Needed:** Would require separate authentication system, user database, profile pages, etc.

---

## Database Schema Status

### Tables Currently Active

1. `events` — Event listings (bilingual)
2. `event_registrations` — Registration submissions
3. `membership_applications` — Membership applications
4. `contact_submissions` — Contact form submissions
5. `admin_sessions` — Admin session tokens
6. `admins` — Admin accounts
7. `cms_content` — Dynamic content blocks

### Tables Not Used (Legacy/Archived)

- `membership_applications_archived`
- `contact_submissions_archived`
- Any other tables in schema that are not listed above

**Note:** Archived tables are safe to leave in place (they don't interfere with current operations). They can be cleaned up in a future maintenance pass if desired.

---

## Deployment and Hosting Status

### Vercel Deployment

**Status:** WORKING

- Automatic deployment on git push to `main` branch
- Builds complete in 2–5 minutes
- Production URL operational

### Supabase Database

**Status:** WORKING

- PostgreSQL database operational
- All migrations applied successfully
- RLS policies active
- Automatic backups enabled

### Email Notifications (Resend)

**Status:** WORKING

- Admin notifications send automatically when forms are submitted
- No user-facing automated emails (intentional)
- Resend API integration confirmed functional

### Production Verification

**Last Tested:** September 28, 2026

- [x] Event listing page loads
- [x] Event detail page loads
- [x] Registration form submits
- [x] Admin dashboard accessible
- [x] Email notification received
- [x] Registrations stored in database
- [x] Language switcher works (Persian/German)
- [x] Founder images display on About page

---

## Recent Changes (Phase 1 - UI Improvements)

**Completed:** September 28, 2026

### About Page (`/ueber-uns`) - FIXED

**Issue:** Founder section was positioned ABOVE main About text instead of AFTER, and founder cards were stacking vertically on desktop

**Solution:** Restructured page layout to:
1. Display "About DIDAR" section first (main about text)
2. Display "Founders" section after (with founder cards)
3. Founders use CSS Grid: `repeat(auto-fit, minmax(200px, 1fr))` for responsive side-by-side on desktop, stacking on mobile

**Files Modified:**
- `pages/ueber-uns.js` — Restructured sections
- `lib/i18n.js` — Stuttgart spelling correction
- `components/Footer.js` — Stuttgart spelling correction
- `pages/impressum.js` — Stuttgart spelling correction
- `styles/components.css` — Footer padding reduction

**Images Added:**
- `public/images/Avid.jpg`
- `public/images/Danial.jpg`

### Language Toggle - VERIFIED

**Status:** Already correct (no changes needed)

- Language switcher displays as compact pill shape
- "FA" and "DE" buttons with proper styling
- Active button shows dark olive/green background
- Inactive button shows light background
- Proper RTL/LTR layout switching works

### Stuttgart Spelling - FIXED

**Correction:** "شتوتگارت" → "اشتوتگارت" (Persian spelling)

- Fixed in Footer
- Fixed in Home page about text (lib/i18n.js)
- Fixed in Impressum

---

## Testing Approach

### Manual Testing (Current)

Regular QA involves:
1. Visiting production website
2. Filling out event registration form
3. Checking admin dashboard
4. Verifying email notification received
5. Testing language switcher
6. Testing mobile responsiveness

### Automated Testing (Not Yet Implemented)

Future improvements could include:
- Unit tests for validation functions
- Integration tests for API routes
- End-to-end tests for form submissions
- Responsive design tests

---

## Areas of Potential Technical Debt

These are low-priority but could be addressed in future updates:

### 1. Session Store Query Efficiency

**Current:** Session validation queries database on every admin request

**Potential Optimization:** Cache session validity in memory with TTL

**Impact:** Minor; database queries are fast

### 2. Email Service Error Handling

**Current:** Email failures log error but registration still succeeds (intentional)

**Potential Improvement:** Retry logic with exponential backoff

**Impact:** Minor; Resend is reliable

### 3. Form Validation Code Duplication

**Current:** Validation logic exists in both frontend and backend

**Potential Improvement:** Shared validation library to avoid duplication

**Impact:** Low priority; current approach is safe

### 4. Missing Error Boundaries

**Current:** No React error boundaries for graceful error handling

**Potential Improvement:** Add error boundaries to forms and admin pages

**Impact:** Would improve user experience on unexpected errors

### 5. Archived Table Cleanup

**Current:** Old archived tables still in schema

**Potential Improvement:** Archive tables to separate database or remove

**Impact:** None; tables are inert

---

## Git and Version Control

### Current Repository

**Repository:** `didar-Stuttgart/didar-website` on GitHub

**Primary Branch:** `main`

**Deployment:** Automatic on push to `main`

### Commit Standards

- Commit messages should describe what changed and why
- Include attribution line for Claude-assisted work
- Keep commits focused (one feature or fix per commit when possible)

### Branching Strategy

**Recommended for Future Work:**
- Create feature branches from `main`
- Name branches descriptively: `feature/founder-images`, `fix/form-validation`
- Create pull requests for review before merging to `main`
- Merge PRs to `main` to trigger production deployment

---

## Performance Characteristics

### Page Load Times

- Home page: ~2–3 seconds (cold load, Vercel)
- Event listing: ~1–2 seconds
- Event detail: ~1–2 seconds
- Admin dashboard: ~2–3 seconds (after login)

### Database Query Performance

- Event listing query: <100ms
- Single event fetch: <50ms
- Registration submission: <200ms (including email)
- Admin registrations list: <500ms (depends on record count)

---

## Browser and Device Support

### Tested Browsers

- Chrome / Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Responsive Design

- Mobile (320px–640px): Single-column layout, stacked forms
- Tablet (640px–1024px): 2-column layouts where applicable
- Desktop (>1024px): Full layout, 3-column grids for events

### Known Browser Issues

- None currently reported

---

## Out of Scope

These features are explicitly NOT part of DIDAR's current scope:

- User authentication for registrants (no member accounts)
- Automated capacity enforcement
- Email verification chains
- Payment processing
- Calendar sync (Google Calendar, Outlook)
- Ticketing system
- Automated attendee confirmations
- Mobile app
- API for third-party integrations

---

## Recommendations for Future Development

### High Priority (If Needed)

1. **Automated Testing:** Add test suite for form submission and validation logic
2. **Error Logging:** Implement centralized error logging (Sentry, LogRocket)
3. **Analytics:** Track form submissions and event page views

### Medium Priority

1. **Performance Monitoring:** Add Web Vitals tracking to Vercel
2. **Database Indexing:** Analyze slow queries and add strategic indexes
3. **Accessibility Audit:** Run WCAG compliance check on all forms

### Low Priority

1. **UI Polish:** Refine spacing and typography
2. **Documentation:** Add developer setup guide
3. **Admin UX:** Improve dashboard filtering and search

---

## Key Project Files

- `PROJECT_STATE.md` — Detailed project status document (in root)
- `ARCHITECTURE.md` — Architectural decisions and overview
- `DATABASE.md` — Database schema documentation
- `FORMS.md` — Form specifications and validation
- `EVENTS_AND_REGISTRATION.md` — Event system documentation
- `SECURITY.md` — Security policies and practices
- `DEPLOYMENT.md` — Deployment and operations guide

