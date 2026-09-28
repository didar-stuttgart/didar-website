# DIDAR Architecture

## Next.js Application Structure

```
didar-website/
├── pages/                      # Next.js pages (routes)
│   ├── _app.js                # App wrapper, layout, i18n context
│   ├── index.js               # Homepage (/)
│   ├── ueber-uns.js           # About Us page (/ueber-uns, /fa/)
│   ├── veranstaltungen.js     # Events listing page
│   ├── [eventId].js           # Event details page
│   ├── mitglied-werden.js     # Membership form page
│   ├── kontakt.js             # Contact form page
│   ├── datenschutz.js         # Privacy policy page
│   ├── impressum.js           # Legal/imprint page
│   ├── admin/                 # Admin panel pages
│   │   ├── index.js           # Admin login
│   │   ├── dashboard.js       # Admin dashboard
│   │   ├── memberships/       # Membership review
│   │   ├── registrations/     # Event registration review
│   │   └── contact/           # Contact submissions review
│   ├── api/                   # API routes (backend)
│   │   ├── contact/submit.js  # POST /api/contact/submit
│   │   ├── memberships/       # Membership API routes
│   │   ├── registrations/     # Registration API routes
│   │   └── admin/             # Admin API routes
│   └── registrations/         # Legacy registration pages (deprecated path)
│
├── components/                # Reusable React components
│   ├── Header.js             # Navigation, language toggle
│   ├── Footer.js             # Footer with links
│   ├── EventCard.js          # Event card component
│   └── SocialIcons.js        # Social media links
│
├── lib/                       # Utility libraries
│   ├── i18n.js               # Internationalization (Persian/German)
│   ├── supabase.js           # Supabase client initialization
│   ├── admin-auth.js         # Admin authentication logic
│   ├── admin-email.js        # Email notification system
│   ├── validation.js         # Form input validation
│   ├── api-middleware.js     # API middleware (CORS, rate-limit)
│   ├── rate-limit.js         # Rate limiting logic
│   ├── session-store-db.js   # Admin session storage (Supabase)
│   ├── events-filter.js      # Event filtering logic
│   └── middleware.js         # Next.js middleware
│
├── styles/                    # CSS files
│   ├── globals.css           # Global styles
│   ├── layout.css            # Layout component styles
│   ├── components.css        # Component-specific styles
│   ├── rtl.css               # Persian RTL specific styles
│   └── enhancements.css      # Additional styling tweaks
│
├── public/                    # Static assets
│   ├── images/               # Images (logos, founder images, etc.)
│   └── [other static files]
│
├── data/                      # Data files (not used in current phase)
│   └── migrations/           # Database migration records
│
├── scripts/                   # Build and utility scripts
│   └── [utility scripts]
│
└── docs/                      # Documentation
    └── claude-onboarding/     # This documentation
```

## Page Routes

| Page | Route | Component | Purpose |
|------|-------|-----------|---------|
| Home | `/` or `/fa/` | `pages/index.js` | Homepage with hero, events preview, membership CTA |
| Events | `/veranstaltungen` | `pages/veranstaltungen.js` | Event listing with filters |
| Event Details | `/veranstaltungen/[id]` | `pages/[eventId].js` | Individual event details + registration form |
| About | `/ueber-uns` or `/fa/` (Persian default) | `pages/ueber-uns.js` | About DIDAR, mission, founder bios |
| Membership | `/mitglied-werden` | `pages/mitglied-werden.js` | Membership application form |
| Contact | `/kontakt` | `pages/kontakt.js` | Contact form for public inquiries |
| Privacy | `/datenschutz` | `pages/datenschutz.js` | Privacy policy (German + Persian) |
| Legal | `/impressum` | `pages/impressum.js` | Legal information / imprint |
| Admin Login | `/admin` | `pages/admin/index.js` | Admin authentication |
| Admin Dashboard | `/admin/dashboard` | `pages/admin/dashboard.js` | Dashboard for reviewing submissions |

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/contact/submit` | POST | Submit contact form |
| `/api/memberships/submit` | POST | Submit membership application |
| `/api/registrations/submit` | POST | Submit event registration |
| `/api/admin/auth/login` | POST | Admin login |
| `/api/admin/auth/logout` | POST | Admin logout |
| `/api/admin/sessions/verify` | GET | Verify admin session |
| `/api/admin/memberships/list` | GET | List pending memberships |
| `/api/admin/registrations/list` | GET | List pending registrations |
| `/api/admin/contact/list` | GET | List contact submissions |
| `/api/admin/[type]/[id]/update` | PUT | Update submission status |

## Frontend/Backend Boundary

**Frontend (Client-side):**
- Pages and components in `/pages` (except API routes)
- All form UI and validation
- Language switching and i18n
- Navigation and routing

**Backend (Server-side):**
- API routes in `/pages/api/`
- Supabase database access
- Email notification via Resend
- Admin authentication and session management
- Rate limiting and CORS

**Database Access:**
- Frontend uses Supabase's public API key (read public data)
- Backend (API routes) use service-role key for admin operations
- No direct frontend access to admin tables

## Important Architectural Decisions

1. **Manual Review Model**
   - NO automatic email confirmations
   - NO verification tokens
   - NO automatic capacity enforcement
   - All submissions require admin review

2. **Language Switching**
   - Client-side language toggle in Header
   - Uses Next.js router query parameter or URL prefix
   - Context-based i18n in _app.js
   - RTL/LTR applied via CSS and `dir` attribute

3. **Admin Authentication**
   - Session-based (JWT token in secure HTTP-only cookie)
   - Sessions stored in Supabase `admin_sessions` table
   - Admin password verified during login
   - Session expiry after period of inactivity

4. **Email Notifications**
   - Used Resend email service
   - Admin notifications for all new submissions
   - No user confirmation emails (manual model)
   - Email templates built dynamically in code

5. **No CMS or External Content System**
   - All content hardcoded in components/pages
   - Translations in `lib/i18n.js`
   - Event data stored in Supabase (not CMS)
   - Legal pages static (Impressum, Datenschutz)

## Styling Architecture

- **CSS Files:** Modular CSS in `/styles/` directory
- **CSS Variables:** Used for colors, spacing, typography
- **RTL Support:** CSS for Persian RTL text direction
- **Inline Styles:** Some component styles inline in React (for responsive logic)
- **No CSS-in-JS:** No styled-components or emotion; plain CSS + inline styles

## Important Files to Know

| File | Purpose | Critical |
|------|---------|----------|
| `pages/_app.js` | App wrapper, context providers | **YES** |
| `lib/i18n.js` | All translations (Persian + German) | **YES** |
| `lib/supabase.js` | Supabase client initialization | **YES** |
| `lib/admin-email.js` | Email notification logic | **YES** |
| `lib/admin-auth.js` | Admin authentication | **YES** |
| `package.json` | Dependencies and scripts | **YES** |
| `.env.example` | Environment variable template | Yes |
| `pages/ueber-uns.js` | About page with founder section | Important |
| `components/Header.js` | Navigation and language toggle | Important |

## Build and Deployment

- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Dev Command:** `npm run dev`
- **Environment:** Variables loaded from `.env.local` (local) and Vercel environment (production)
