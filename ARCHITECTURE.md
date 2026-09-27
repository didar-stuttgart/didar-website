# ARCHITECTURE

This document describes the technical architecture of the DIDAR website.

## Overview

The DIDAR website is a Next.js 15 application with a React 18 frontend and Node.js backend, using Supabase PostgreSQL for data storage. It implements a bilingual interface (Persian/German) with RTL/LTR support, manual form submission workflow, and a password-protected admin dashboard.

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | Next.js | 15 |
| UI Library | React | 18 |
| Backend | Node.js (Next.js API routes) | 18+ |
| Database | Supabase PostgreSQL | Latest |
| Authentication | PBKDF2 + Database Sessions | N/A |
| Styling | CSS Modules + Global CSS | N/A |
| Internationalization | Custom lib/i18n.js | N/A |
| Hosting | Vercel (or any Node.js platform) | N/A |

---

## Project Structure

### Pages Directory

**Public Pages:**
```
pages/
├── index.js                     # Homepage (hero, about preview, events)
├── kontakt.js                   # Contact form page
├── mitglied-werden.js           # Membership application page
├── ueber-uns.js                 # About DIDAR page
├── impressum.js                 # Legal/Imprint page
├── datenschutz.js               # Privacy policy page
├── veranstaltungen/
│   ├── index.js                 # Event listing page
│   └── [slug].js                # Event detail page + registration form
└── registrations/
    └── verify.js                # Disabled (returns 404)
```

**Admin Pages:**
```
pages/admin/
├── login.js                     # Admin login page
├── index.js                     # Admin dashboard
├── registrations.js             # Registration management page
├── memberships.js               # Membership application management page
├── content.js                   # CMS editor page
├── settings.js                  # Settings page
└── events/
    ├── index.js                 # Event management list
    └── [slug].js                # Event detail editor
```

### API Routes

**Public Endpoints:**
```
pages/api/
├── auth/
│   ├── login.js                 # POST: Admin login
│   ├── logout.js                # POST: Admin logout
│   └── verify.js                # GET: Verify session
├── contact/
│   └── submit.js                # POST: Contact form submission (rate-limited)
├── events/
│   ├── index.js                 # GET: All events
│   └── [eventId]/
│       └── capacity-status.js   # GET: Event capacity info
├── memberships/
│   └── submit.js                # POST: Membership application (rate-limited)
├── registrations/
│   ├── submit.js                # POST: Event registration (rate-limited)
│   └── verify.js                # GET: Disabled (returns 404)
└── health.js                    # GET: Health check
```

**Admin Endpoints:**
```
pages/api/admin/
├── stats.js                     # GET: Dashboard statistics
├── registrations/
│   ├── index.js                 # GET: List registrations
│   ├── [id].js                  # GET/POST: Get/update registration
│   └── export.js                # POST: Export registrations to CSV
├── memberships/
│   ├── index.js                 # GET: List membership applications
│   ├── [id].js                  # GET/POST: Get/update application
│   └── export.js                # POST: Export applications to CSV
├── events/
│   ├── index.js                 # GET/POST: List/create events
│   └── [slug].js                # GET/POST/DELETE: Event operations
├── content/
│   ├── index.js                 # GET: Get CMS content
│   └── cms.js                   # POST: Update CMS content
├── settings/
│   ├── index.js                 # GET: Get settings
│   └── organization.js          # POST: Update organization settings
└── fix-event-status.js          # POST: Fix event registration status
```

### Library Directory

```
lib/
├── i18n.js                      # Internationalization (150+ strings)
├── supabase.js                  # Supabase client initialization
├── session-store.js             # Admin session management
├── api-middleware.js            # Admin API middleware
├── middleware.js                # Public API middleware
├── rate-limit.js                # Rate limiting implementation
├── validation.js                # Form validation rules
└── [other utilities]
```

### Styling

```
styles/
├── globals.css                  # Global CSS (reset, variables, defaults)
├── index.module.css             # Homepage styles
├── layout.module.css            # Layout and navigation
├── kontakt.module.css           # Contact form styles
├── mitglied-werden.module.css   # Membership form styles
├── admin.module.css             # Admin dashboard styles
└── [page-specific modules]
```

### Data Directory

```
data/
├── schema.sql                   # Complete database schema
├── migration_001_*.sql          # Schema and RLS foundation
├── migration_002_*.sql          # Admin sessions table
├── migration_003_*.sql          # Supabase grants
├── migration_004_*.sql          # CMS content table
├── migration_005_*.sql          # Manual registration RPC
├── migration_006_*.sql          # RPC error handling
├── migration_007_*.sql          # Membership application RPC
├── migration_008_*.sql          # Contact submission RPC
└── migration_009_*.sql          # Service role grants
```

---

## Routing

### Language Routing

The site supports two languages via URL-based routing:

- `/` or `/de/...` — German (default)
- `/fa/...` — Persian

Language is detected from URL pathname and passed through context to all pages and components. No localStorage-based language persistence; URL is the source of truth.

### Dynamic Routes

- `/veranstaltungen/[slug]` — Event-specific pages (slug from database)
- `/admin/events/[slug]` — Event editor (slug from database)
- `/api/events/[eventId]/...` — Event-specific APIs
- `/api/admin/registrations/[id]` — Registration-specific APIs
- `/api/admin/memberships/[id]` — Membership-specific APIs

---

## API Design

### Request/Response Pattern

All API endpoints follow a consistent pattern:

**Success Response (200-201):**
```json
{
  "success": true,
  "message": "Operation description",
  "data": { "key": "value" }
}
```

**Error Response (400-500):**
```json
{
  "error": "Error message",
  "details": ["Validation error 1", "Validation error 2"]
}
```

### Authentication

Admin routes verify session via `requireAdminSession()` middleware from `lib/api-middleware.js`:
- Check `session_token` cookie
- Validate token in `admin_sessions` table
- Reject if invalid or expired (24-hour TTL)

### Rate Limiting

Public form endpoints wrapped with `withRateLimit()` middleware:
- Identifies client by IP address
- Default: 10 requests per 60 seconds per IP
- Returns 429 with Retry-After header when exceeded
- Applies to: /api/contact/submit, /api/memberships/submit, /api/registrations/submit

---

## Database Layer

### Schema Overview

**9 Tables:**
1. `events` — Event definitions with bilingual content
2. `event_registrations` — User event registrations
3. `membership_applications` — Membership application submissions
4. `contact_submissions` — Contact form submissions
5. `admin_sessions` — Admin session tokens
6. `cms_content` — CMS-editable content
7. [Additional system tables created by Supabase]

### Row-Level Security (RLS)

All tables have RLS policies:

- **events:** Public read, admin-only write
- **event_registrations:** Public insert via RPC, admin-only read/update
- **membership_applications:** Public insert via RPC, admin-only read/update
- **contact_submissions:** Public insert via RPC, no update
- **admin_sessions:** Admin-only access, public deny

### SECURITY DEFINER RPCs

Public forms use SECURITY DEFINER stored procedures to bypass table RLS:

- `insert_contact_submission_manual()` — Insert contact submission
- `insert_event_registration()` — Insert event registration
- `insert_membership_application()` — Insert membership application

These run with Supabase service role permissions to write to protected tables.

---

## Authentication & Sessions

### Admin Authentication Flow

1. User submits password on `/admin/login`
2. Backend hashes submitted password with PBKDF2
3. Compares hash to stored `ADMIN_PASSWORD_HASH`
4. If match: Generate session token
5. Store token in `admin_sessions` table (24-hour TTL)
6. Send token in HTTP-only, secure cookie (`session_token`)
7. Browser sends cookie with subsequent requests
8. Backend validates token on protected routes

### Session Storage

Sessions stored in `admin_sessions` table with columns:
- `token_hash` — Hashed session token (unique)
- `user_id` — Admin user ID (fixed value)
- `expires_at` — Expiration timestamp (24 hours from creation)
- `created_at` — Creation timestamp
- `updated_at` — Last access timestamp

Expired sessions are not automatically cleaned; admin/application should handle expiration.

---

## Bilingual Support

### Internationalization (i18n)

Custom i18n system in `lib/i18n.js` with:
- 150+ translation strings
- English, Persian, German support
- Fallback to English for missing translations
- All UI labels, form placeholders, validation messages

### RTL/LTR Support

- German (LTR) — Left-to-right text flow, standard flexbox
- Persian (RTL) — Right-to-left text flow, mirrored layouts
- CSS uses logical properties where possible
- Hero section has separate LTR and RTL layouts
- Form inputs, buttons adapt to text direction

### URL-Based Language Selection

Language determined by URL:
- `/de/...` or `/` — German
- `/fa/...` — Persian

No language switcher UI; users share links with language embedded in URL.

---

## Form Submission Workflow (Manual Model)

### Event Registration

1. User fills form on `/veranstaltungen/[slug]`
2. Frontend validates (required fields, formats)
3. POST to `/api/registrations/submit` with form data
4. Backend validates (server-side validation is authoritative)
5. RPC `insert_event_registration()` saves to database
6. User sees success message
7. Admin sees new registration in `/admin/registrations`
8. Admin manually updates status and contacts user

### Membership Application

1. User fills form on `/mitglied-werden`
2. Frontend validates
3. POST to `/api/memberships/submit`
4. Backend validates
5. RPC `insert_membership_application()` saves to database
6. User sees success message
7. Admin sees new application in `/admin/memberships`
8. Admin manually updates status and contacts user

### Contact Form

1. User fills form on `/kontakt`
2. Frontend validates
3. POST to `/api/contact/submit`
4. Backend validates
5. RPC `insert_contact_submission_manual()` saves to database
6. User sees success message
7. Admin can view submission (not yet in admin UI)
8. Admin manually sends reply

**No automated emails at any stage.**

---

## CMS Integration

### Dynamic Content

The `cms_content` table stores editable content:
- Keyed by unique identifier (e.g., "homepage.hero.title")
- Organized by page/section/item_type
- Admin can edit via `/admin/content` page
- Public pages read content at request time

### Supported Content Types

- Text fields (titles, descriptions)
- Long-form content (body, bio)
- Structured data (JSON)

---

## Performance Considerations

### Static Generation

- Events can be pre-rendered as static HTML
- Homepage can be cached (1-hour ISR revalidation)
- Legal pages (Impressum, Datenschutz) are static

### Optimization

- Images lazy-loaded with shimmer animation
- CSS bundled and minified by Next.js
- Minimal JavaScript on public pages
- Form validation runs client-side first (faster feedback)

### Rate Limiting

In-memory rate limiter sufficient for single instance. For multi-instance deployment, consider Redis or similar shared store.

---

## Error Handling

### Validation Errors

- Caught by backend validator
- Returned as 400 with `details` array
- Each error describes specific field and requirement

### Server Errors

- Caught by try-catch in API routes
- Logged to console
- Returned as 500 with generic message (no sensitive info to client)

### Networking

- Client implements exponential backoff on 5xx
- Rate limiting returns 429 with Retry-After header
- Session expiration returns 401 to admin routes

---

## Deployment Architecture

### Development

- Local Next.js dev server on port 3000
- Local Supabase instance or cloud Supabase project
- Environment variables from `.env.local`

### Production (Vercel)

- Auto-deploys on git push to main
- Environment variables configured in Vercel dashboard
- Supabase cloud project (same as development)
- Vercel serverless functions handle API routes
- Static content cached globally via CDN

### Environment-Specific Behavior

- `NODE_ENV=production` — Minified builds, production logging
- `VERCEL_ENV=production` — Production deployment tracking

---

## Security Architecture

### Data Privacy

- No personal data in Git
- Secrets stored in `.env.local` (local) or environment variables (Vercel)
- All data sent over HTTPS
- Supabase connection encrypted in transit

### Database Security

- Row-Level Security (RLS) on all tables
- Admin-only tables deny public access
- Public form submissions via trusted SECURITY DEFINER RPCs
- Service role used only for RPC execution

### Admin Route Protection

- All admin routes require valid session
- Session token verified on every request
- HTTP-only, secure cookies prevent XSS token theft
- 24-hour session expiration forces periodic re-login

### Form Protection

- Rate limiting prevents brute-force spam
- Server-side validation (frontend validation is UX only)
- Email validation to reduce invalid submissions
- Duplicate prevention for memberships and registrations

---

## Future Architectural Considerations

- **Multi-instance deployment:** Implement Redis rate limiting and session store
- **Email delivery:** Add transactional email service (Brevo, SendGrid, etc.) if auto-emails needed
- **File uploads:** Add object storage (AWS S3, Supabase Storage) for admin image uploads
- **Advanced CMS:** Migration to headless CMS if content becomes more complex
- **Analytics:** Add event tracking or analytics integration
- **Real-time updates:** Consider Supabase Realtime for live admin dashboard updates

---

## Related Documentation

- **DATABASE.md** — Detailed schema, tables, RLS policies
- **FORMS.md** — Form validation, API endpoints, rate limiting
- **ADMIN_GUIDE.md** — Admin UI walkthrough
- **DEPLOYMENT.md** — Build and deploy steps
- **SECURITY.md** — Security best practices
