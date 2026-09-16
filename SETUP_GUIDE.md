# DIDAR Website — Setup Guide

Detailed step-by-step setup instructions for developers and system administrators.

## Architecture Overview

```
┌─────────────┐
│   Vercel    │  (Deployment)
└──────┬──────┘
       │
┌──────▼──────────────────────┐
│   Next.js Application       │  (Frontend + API Routes)
│  - Public pages (Persian/DE)│
│  - Form submission APIs     │
│  - Admin auth               │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│   Supabase (PostgreSQL)     │  (Database)
│  - Events                   │
│  - Registrations            │
│  - Membership applications  │
│  - Contact submissions      │
│  - Row Level Security       │
└─────────────────────────────┘
```

## Phase 1 Scope

This is a **foundation-only** implementation. The following are established:

✅ Database schema with security  
✅ API routes with validation  
✅ Admin authentication framework  
✅ Environment configuration  
✅ Rate limiting and anti-spam  
✅ Deployment ready (Vercel)

❌ Not included yet:
- Public-facing pages/UI (Phase 2)
- Content management (Phase 3)
- Registration forms (Phase 4)
- Admin dashboard (Phase 3)

## Prerequisites

Before starting, you need:

1. **Node.js** 18.0.0 or higher
   ```bash
   node --version  # Should be v18+
   ```

2. **npm** or **yarn** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **GitHub account** (already have the repo)

4. **Supabase account** (free tier sufficient)
   - Sign up at https://supabase.com

5. **Vercel account** (for deployment)
   - Sign up at https://vercel.com

## Step 1: Clone Repository and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/danialhaghgoo-a11y/Didar-test.git
cd Didar-test

# Install dependencies
npm install

# Verify installation
npm --version
npx next --version
```

## Step 2: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Configure:
   - **Name**: `didar` (or your preference)
   - **Database Password**: Create a strong password (save it somewhere safe)
   - **Region**: Choose closest to your users (e.g., `eu-central-1` for Germany)
   - **Pricing Plan**: Start with free tier

4. Wait for project to initialize (2-3 minutes)

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)

2. Click **"New Query"**

3. Copy the entire contents of `data/schema.sql` from the repository

4. Paste it into the SQL Editor

5. Click **"Run"** (or press `Cmd+Enter` / `Ctrl+Enter`)

6. Wait for the schema to create successfully

   You should see:
   ```
   Success
   CREATE TABLE
   CREATE INDEX
   ... (more success messages)
   ```

If there are any errors, check:
- Supabase project is active
- You copied the entire SQL file correctly
- No syntax errors in the SQL

## Step 4: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings > API** (left sidebar)

2. Find these values:
   - **Project URL** — looks like `https://xxxxx.supabase.co`
   - **Publishable Key** — a long string starting with `eyJhbG...`

3. **Copy and save these somewhere safe** — you'll need them in the next step

## Step 5: Configure Environment Variables

1. Create a new file named `.env.local` in the repository root:

   ```bash
   # In the repository directory
   cp .env.example .env.local
   ```

2. Open `.env.local` in a text editor

3. Replace the placeholder values with your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-here.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-very-long-publishable-key-here
   ADMIN_PASSWORD_HASH=will-be-generated-during-setup
   ```

4. Save the file

**Important**: `.env.local` is in `.gitignore` and will never be committed to Git.

## Step 6: Generate Admin Password Hash

1. Create a setup script file named `scripts/setup-admin.js`:

   ```bash
   mkdir -p scripts
   touch scripts/setup-admin.js
   ```

2. Add this content to `scripts/setup-admin.js`:

   ```javascript
   const { hashPassword, validatePassword } = require('../lib/admin-auth');
   const readline = require('readline');

   const rl = readline.createInterface({
     input: process.stdin,
     output: process.stdout,
     terminal: false,
   });

   console.log('\n=== DIDAR Admin Password Setup ===\n');
   console.log('Enter a strong password for the admin account.');
   console.log('Requirements:');
   console.log('  - At least 12 characters');
   console.log('  - At least one uppercase letter');
   console.log('  - At least one lowercase letter');
   console.log('  - At least one number');
   console.log('  - At least one special character (!@#$%^&*)\n');

   let password = '';

   rl.on('line', (line) => {
     password = line.trim();

     if (!password) {
       console.log('Password cannot be empty. Try again:');
       return;
     }

     const validation = validatePassword(password);

     if (!validation.valid) {
       console.log('\nPassword does not meet requirements:');
       validation.errors.forEach((err) => console.log(`  - ${err}`));
       console.log('\nTry again:\n');
       password = '';
       return;
     }

     // Generate hash
     const hash = hashPassword(password);

     console.log('\n=== Password Hash Generated ===\n');
     console.log('Add this line to your .env.local:\n');
     console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
     console.log('Do NOT share this hash with anyone.\n');

     rl.close();
     process.exit(0);
   });

   rl.on('close', () => {
     process.exit(0);
   });

   process.stdout.write('Enter password: ');
   ```

3. Run the setup script:

   ```bash
   node scripts/setup-admin.js
   ```

4. Enter a strong password when prompted

5. Copy the generated hash

6. Add it to `.env.local`:

   ```
   ADMIN_PASSWORD_HASH=your-generated-hash-here
   ```

## Step 7: Test Local Development

1. Start the development server:

   ```bash
   npm run dev
   ```

   You should see:
   ```
   ▲ Next.js 15.x.x
   - Local:        http://localhost:3000
   ```

2. Test the health endpoint in another terminal:

   ```bash
   curl http://localhost:3000/api/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-09-16T...",
     "supabase": "connected"
   }
   ```

3. If it fails:
   - Check `.env.local` has correct Supabase credentials
   - Check Supabase project is active
   - Check schema was created successfully in Supabase

4. Stop the dev server: `Ctrl+C`

## Step 8: Build for Production

1. Build the application:

   ```bash
   npm run build
   ```

   This should complete without errors and show:
   ```
   ✓ Compiled successfully
   ```

2. Start the production build locally:

   ```bash
   npm start
   ```

3. Test again:

   ```bash
   curl http://localhost:3000/api/health
   ```

4. Stop: `Ctrl+C`

## Step 9: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI (one time)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Using GitHub + Vercel Dashboard

1. Push changes to GitHub:

   ```bash
   git add .
   git commit -m "Phase 1: Infrastructure foundation

   - Database schema with RLS
   - API routes with validation
   - Admin authentication
   - Rate limiting
   - Environment configuration

   Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
   git push origin main
   ```

2. Go to https://vercel.com/dashboard

3. Click **"Add New... > Project"**

4. Select the Didar repository

5. Click **"Import"**

6. Under **Environment Variables**, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = your-publishable-key-here
   ADMIN_PASSWORD_HASH = your-generated-hash-here
   ```

7. Click **"Deploy"**

8. Wait for deployment to complete (2-3 minutes)

9. Once deployed, test:

   ```bash
   curl https://your-vercel-url.vercel.app/api/health
   ```

## Verification Checklist

After setup, verify everything works:

- [ ] Local development server starts (`npm run dev`)
- [ ] Health check endpoint returns "healthy" status
- [ ] Can build for production (`npm run build`)
- [ ] Environment variables are configured (`.env.local`)
- [ ] Supabase schema is created (check in SQL Editor)
- [ ] No secrets are in Git (check `.gitignore`)
- [ ] Deployed to Vercel and accessible
- [ ] Health check works on Vercel URL

## File Structure After Setup

```
Didar-test/
├── .env.local                 # NOT in Git (created by you)
├── .env.example              # Template (in Git)
├── .gitignore               # Prevents committing secrets
├── package.json
├── next.config.js
├── README.md
├── SETUP_GUIDE.md           # This file
├── data/
│   └── schema.sql           # Database schema
├── lib/
│   ├── supabase.js
│   ├── admin-auth.js
│   ├── validation.js
│   ├── rate-limit.js
│   └── middleware.js
├── pages/
│   ├── api/
│   │   ├── health.js
│   │   ├── auth/
│   │   │   ├── login.js
│   │   │   └── logout.js
│   │   ├── registrations/
│   │   │   └── submit.js
│   │   ├── memberships/
│   │   │   └── submit.js
│   │   └── contact/
│   │       └── submit.js
│   └── _app.js              # To be built in Phase 2
├── scripts/
│   └── setup-admin.js       # Admin password setup
└── .next/                    # Build output (not in Git)
```

## Security Notes

### Admin Password
- The password is hashed using PBKDF2-SHA256
- The hash is stored in `.env.local` (not Git)
- Never share the password or hash
- Change it by re-running `scripts/setup-admin.js`

### Environment Variables
- `NEXT_PUBLIC_*` variables are safe to expose (they go to browser)
- Other variables stay on the server only
- Never commit `.env.local` to Git
- Always add new secrets to `.env.example` as placeholders

### Supabase Security
- Publishable Key is for client-side read/write to public tables
- Row Level Security (RLS) restricts what data is accessible
- Admin uses session-based auth (not RLS roles in Phase 1)
- Admin API routes will be protected in Phase 3

## Troubleshooting

### npm install fails
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Cannot find module 'next'"
```bash
npm install next@latest react react-dom
```

### Health check returns "unhealthy"
1. Verify Supabase credentials in `.env.local`
2. Check Supabase project is active (go to Dashboard)
3. Verify schema was created (go to SQL Editor > look for tables)
4. Check network connection

### Admin password setup fails
- Make sure `.env.local` has Supabase credentials first
- Run `node -e "console.log('Node works')"` to verify Node.js
- Try deleting `.env.local` and creating it fresh

### Build fails with "Module not found"
```bash
rm -rf .next
npm run build
```

### Deployment fails on Vercel
1. Check all environment variables are added in Vercel Project Settings
2. Check that the variables have no typos
3. Redeploy from Vercel dashboard
4. Check build logs in Vercel dashboard

## Next Steps (Phase 2)

Once Phase 1 is verified working:

1. **Phase 2: Design System & Public UI**
   - Create visual design system (colors, typography, spacing)
   - Build page shells (Home, Events, About, etc.)
   - Implement Persian/German language support
   - Build responsive mobile layout

## Support

- For Supabase issues: https://supabase.com/docs
- For Next.js issues: https://nextjs.org/docs
- For Vercel deployment: https://vercel.com/docs

