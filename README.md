# DIDAR Website

دیدار — Iranische Kulturgemeinschaft Stuttgart – Hochschulgruppe

A lightweight, cultural event website with secure event registration and membership applications.

## Features

- **Bilingual support** (Persian/Farsi + German) with RTL/LTR
- **Event management** with registration
- **Membership applications**
- **Contact form**
- **Single admin account** with secure session-based authentication
- **Privacy-first** with data minimization
- **Minimal dependencies** for easy maintenance

## Tech Stack

- **Frontend**: Next.js 15 with React 18
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Authentication**: Session-based (admin)
- **Form validation**: Server-side only

## Project Structure

```
.
├── pages/                    # Next.js pages and API routes
│   ├── api/
│   │   ├── health.js        # Deployment health check
│   │   ├── auth/            # Admin authentication
│   │   ├── registrations/   # Event registration API
│   │   ├── memberships/     # Membership application API
│   │   └── contact/         # Contact form API
│   └── [page].js            # Public pages (to be implemented in Phase 2)
├── lib/                     # Shared utilities
│   ├── supabase.js         # Supabase client setup
│   ├── admin-auth.js       # Admin authentication helpers
│   ├── validation.js       # Server-side form validation
│   ├── rate-limit.js       # Rate limiting for public forms
│   └── middleware.js       # API middleware
├── data/
│   └── schema.sql          # Database schema (manual setup)
├── scripts/                # Utility scripts
├── .env.example            # Environment variables template
├── package.json
├── next.config.js
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase project (free tier available)
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone https://github.com/danialhaghgoo-a11y/Didar-test.git
cd Didar-test
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at https://supabase.com
2. In the Supabase dashboard, go to **SQL Editor** and run the schema from `data/schema.sql`
3. Get your credentials:
   - Go to **Settings > API**
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `Publishable Key` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
ADMIN_PASSWORD_HASH=will-be-generated-during-setup
```

### 4. Set Admin Password

Generate a secure password hash for the admin account:

```bash
node scripts/setup-admin.js
```

This will prompt you to enter a strong password (12+ characters, including uppercase, lowercase, numbers, and special characters). The hash will be displayed and you must add it to `.env.local`:

```
ADMIN_PASSWORD_HASH=your-generated-hash-here
```

### 5. Local Development

```bash
npm run dev
```

Open http://localhost:3000

Test the health endpoint:

```bash
curl http://localhost:3000/api/health
```

### 6. Deployment to Vercel

```bash
npm run build
```

Deploy to Vercel:

1. Push to GitHub
2. Connect repository in Vercel dashboard
3. Add environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `ADMIN_PASSWORD_HASH`
4. Deploy

## API Endpoints

### Health Check
- `GET /api/health` - Check deployment and database connectivity

### Authentication (Admin)
- `POST /api/auth/login` - Login with password
- `POST /api/auth/logout` - Logout and clear session

### Forms (Public, Rate-Limited)
- `POST /api/registrations/submit` - Submit event registration
- `POST /api/memberships/submit` - Submit membership application
- `POST /api/contact/submit` - Submit contact message

## Security

### Authentication
- Single admin account protected by strong password hash
- Session-based authentication (24-hour expiry)
- HTTP-only, Secure, SameSite cookies

### Data Protection
- Server-side form validation on all public endpoints
- Rate limiting (10 requests/minute per IP)
- Row Level Security (RLS) in Supabase
- Personal data minimization

### Secrets
- **Never commit** `.env`, `.env.local`, or password hashes to Git
- Use `.env.example` as a template
- `.gitignore` prevents accidental commits

## Data Management

### What Data is Collected

**Event Registrations:**
- First name, last name, email (required)
- Phone, Telegram ID, comment (optional)

**Membership Applications:**
- First name, last name, email (required)
- Phone, Telegram ID, additional info (optional)

**Contact Submissions:**
- Name, email, message (required)

### Admin Access

Registrations and membership applications are accessible only to the authenticated admin through the admin interface (to be built in Phase 3).

In Phase 1, data can be exported using the Supabase dashboard or scripts.

### Data Retention

Data retention policy is intentionally simple for Phase 1:
- Registrations are kept until manually deleted
- Applications are kept until manually reviewed/deleted
- Contact messages are kept until manually reviewed/deleted

Detailed retention policy to be added in Phase 6 (Privacy/Security Hardening).

## Troubleshooting

### "Database connection failed"
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Verify Supabase project is active
- Run schema setup in Supabase SQL editor

### "Admin password not configured"
- Run `node scripts/setup-admin.js`
- Add the generated hash to `.env.local` as `ADMIN_PASSWORD_HASH`

### Build fails
- Delete `node_modules` and `.next`
- Run `npm install` and `npm run build` again

## Development Notes

### Phase 1 (Current)
- Infrastructure foundation only
- No UI/visual design yet
- Database schema and API routes established
- Admin authentication foundation

### Next Phases
- Phase 2: Design system and public UI
- Phase 3: Content model and admin interface
- Phase 4: Event registration forms
- Phase 5: Membership forms
- Phase 6: Privacy/security hardening
- Phase 7: SEO/accessibility/performance
- Phase 8-9: QA and launch

## License

Private project for DIDAR e.V.

## Support

For technical issues, check SETUP_GUIDE.md or contact the development team.
