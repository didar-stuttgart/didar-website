# DIDAR Website

The DIDAR (German-Iranian Cultural Organization) website is a bilingual (Persian/German) Next.js application for managing events, memberships, and public engagement.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Git

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/[owner]/didar-website.git
   cd didar-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Your Supabase publishable key
   - `SUPABASE_SECRET_KEY` — Your Supabase secret key (admin operations only)
   - `ADMIN_PASSWORD_HASH` — Generated during admin setup

4. **Set up the database:**
   - Go to your Supabase project dashboard
   - Run all SQL migrations in `data/` directory in order (migration_001 through migration_009)
   - See `DATABASE.md` for schema details

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Admin Access

1. Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Enter your admin password (from `ADMIN_PASSWORD_HASH`)
3. Access the dashboard at [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Features

### Public Pages

- **Homepage** (`/`) — Hero section, about preview, membership CTA, upcoming events
- **Events** (`/veranstaltungen`) — Upcoming events listing with registration
- **Event Detail** (`/veranstaltungen/[slug]`) — Event details and registration form
- **Membership** (`/mitglied-werden`) — Membership application
- **Contact** (`/kontakt`) — Contact form
- **About** (`/ueber-uns`) — About DIDAR
- **Legal** (`/impressum`, `/datenschutz`) — Imprint and privacy policy

### Bilingual Support

- Persian (Farsi) — Right-to-left (RTL)
- German — Left-to-right (LTR)
- Language selector in header, URL-based routing (`/fa/...`, `/de/...`)

### Admin Dashboard

- **Event Management** — Create, edit, publish, archive events
- **Registration Review** — View, update status, export registrations
- **Membership Review** — View, update status, export applications
- **CMS Editor** — Edit homepage content and organization details
- **Settings** — Manage contact email, social links, organization info

### Forms & Submissions

- **Event Registration** — Users register for upcoming events
- **Membership Application** — Users apply for membership
- **Contact Form** — Visitors send messages to DIDAR
- All forms are rate-limited, validated, and stored in database
- No automated emails; admin reviews manually

### Security

- PBKDF2 password hashing for admin authentication
- Database-backed admin sessions with HTTP-only cookies
- Row-Level Security (RLS) on all database tables
- SECURITY DEFINER RPCs for safe form submissions
- Rate limiting on public forms (10 requests per 60 seconds per IP)

---

## Technology Stack

- **Frontend:** Next.js 15, React 18
- **Backend:** Node.js with Next.js API routes
- **Database:** Supabase PostgreSQL
- **Authentication:** PBKDF2 password hash + database sessions
- **Styling:** CSS Modules + Global CSS (no external framework)
- **Internationalization:** Manual i18n system in `lib/i18n.js`
- **Hosting:** Vercel or any Node.js platform

---

## Project Structure

```
didar-website/
├── pages/
│   ├── index.js                     # Homepage
│   ├── kontakt.js                   # Contact page
│   ├── mitglied-werden.js           # Membership application
│   ├── ueber-uns.js                 # About page
│   ├── impressum.js                 # Legal/Imprint
│   ├── datenschutz.js               # Privacy policy
│   ├── registrations/
│   │   └── verify.js                # Disabled (returns 404)
│   ├── veranstaltungen/
│   │   ├── index.js                 # Event listing
│   │   └── [slug].js                # Event detail + registration
│   ├── admin/
│   │   ├── login.js                 # Admin login
│   │   ├── index.js                 # Dashboard
│   │   ├── registrations.js         # Registration management
│   │   ├── memberships.js           # Membership management
│   │   ├── content.js               # CMS editor
│   │   ├── settings.js              # Settings
│   │   └── events/
│   │       ├── index.js             # Event list
│   │       └── [slug].js            # Event editor
│   └── api/
│       ├── auth/                    # Authentication
│       ├── events/                  # Event APIs
│       ├── registrations/           # Registration APIs
│       ├── memberships/             # Membership APIs
│       ├── contact/                 # Contact form API
│       └── admin/                   # Admin APIs
├── lib/
│   ├── i18n.js                      # Internationalization
│   ├── supabase.js                  # Supabase client
│   ├── validation.js                # Form validation
│   ├── middleware.js                # API middleware
│   ├── rate-limit.js                # Rate limiting
│   ├── session-store.js             # Session management
│   └── api-middleware.js            # Admin middleware
├── components/
│   └── [component files]            # React components
├── styles/
│   ├── globals.css                  # Global styles
│   └── [module].module.css          # CSS modules
├── public/
│   ├── images/                      # Images and assets
│   └── favicon.ico                  # Site icon
├── data/
│   ├── schema.sql                   # Database schema
│   └── migration_00X_*.sql          # Database migrations (9 total)
├── .env.example                     # Environment template
├── next.config.js                   # Next.js config
├── package.json                     # Dependencies
└── README.md                        # This file
```

---

## API Endpoints

### Public Form Submissions

- `POST /api/contact/submit` — Submit contact form
- `POST /api/registrations/submit` — Register for event
- `POST /api/memberships/submit` — Apply for membership

### Public Data

- `GET /api/events/index` — Get all events
- `GET /api/events/[eventId]/capacity-status` — Check event capacity

### Admin Authentication

- `POST /api/auth/login` — Admin login
- `POST /api/auth/logout` — Admin logout
- `GET /api/auth/verify` — Verify session

### Admin Management

- `GET /api/admin/stats` — Dashboard stats
- `GET /api/admin/registrations/index` — List registrations
- `GET /api/admin/memberships/index` — List applications
- `GET /api/admin/events/index` — List events
- And many more... See `ARCHITECTURE.md` for complete list

---

## Forms & Rate Limiting

All public forms are rate-limited to prevent spam:

- **All three forms (contact, membership, registration) share a single global rate limiter**
- Default limit: 10 requests per 60 seconds per IP address
- Configurable via `RATE_LIMIT_REQUESTS` and `RATE_LIMIT_WINDOW_MS` environment variables
- Rate limit exceeded returns HTTP 429 with Retry-After header

See `FORMS.md` for detailed form documentation.

---

## Database

The application uses 9 SQL migrations to set up the schema:

1. **migration_001** — Base event and registration schema
2. **migration_002** — Admin sessions with RLS
3. **migration_003** — Supabase service role grants
4. **migration_004** — CMS content table
5. **migration_005** — Manual registration RPC
6. **migration_006** — RPC error handling fix
7. **migration_007** — Membership application RPC
8. **migration_008** — Contact submission RPC
9. **migration_009** — Service role grants

See `DATABASE.md` for complete schema documentation.

---

## Documentation

- **ARCHITECTURE.md** — Technical architecture, routing, API design
- **DATABASE.md** — Database schema, tables, RLS policies
- **FORMS.md** — Form documentation, validation, rate limiting
- **EVENTS_AND_REGISTRATION.md** — Event lifecycle and manual registration workflow
- **ADMIN_GUIDE.md** — Admin panel features and usage
- **DEPLOYMENT.md** — Build, deploy, and monitoring steps
- **SECURITY.md** — Security practices, authentication, privacy
- **PROJECT_STATE.md** — Project baseline, phases, known issues

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect Vercel to repository
3. Set environment variables in Vercel dashboard
4. Deploy

See `DEPLOYMENT.md` for detailed instructions.

---

## Development Workflow

1. Create a new branch: `git checkout -b feature/description`
2. Make changes and test locally
3. Commit with clear messages
4. Push and create a pull request
5. After review and merge, Vercel auto-deploys

---

## Contributing

For bug reports and feature requests, please create an issue or contact the project owner.

---

## License

This project is developed for DIDAR. Specific licensing information is available in the repository.

---

## Support

For questions or issues, contact the development team or create an issue in the repository.

**Repository:** https://github.com/[owner]/didar-website  
**Live Site:** https://didar-stuttgart.de
