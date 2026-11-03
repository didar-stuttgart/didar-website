# DIDAR Website — Setup Guide

Use [DEPLOYMENT.md](DEPLOYMENT.md) for production operations.

## 1. Prerequisites

- Node.js 18+
- npm
- GitHub access
- Supabase access for the relevant environment
- Vercel access for deployment work

## 2. Clone

```bash
git clone https://github.com/didar-Stuttgart/didar-website.git
cd didar-website
npm install
```

Do not use the old `Didar-test` repository path from the historical version of this document.

## 3. Environment

```bash
cp .env.example .env.local
```

Required variable names are in [DEPLOYMENT.md](DEPLOYMENT.md). Never paste real values into GitHub, documentation or chat.

## 4. Admin password

Generate the hash with:

```bash
node scripts/setup-admin.js
```

Store the result only in the ignored local environment file or deployment environment.

## 5. Database

For a fresh database:

1. apply `data/schema.sql`;
2. apply migrations 001–014 in order;
3. verify RPC signatures and relevant columns/buckets.

The existence of a migration file does not prove Production application.

## 6. Event-image Storage

Migration 014 configures:

- `event-images`
- public read
- 5 MB maximum
- JPEG/PNG/WebP

Before production use, confirm the bucket in Supabase. The upload API rejects uploads if the bucket is missing or not public-read.

## 7. Run locally

```bash
npm run dev
```

Persian is the default route; German uses `/de`.

## 8. Build and lint

```bash
npm run lint
npm run build
npm run start
```

The current repository has no runnable Jest test script.

## 9. Current admin routes

- `/admin/login`
- `/admin`
- `/admin/events`
- `/admin/registrations`
- `/admin/memberships`
- `/admin/contact`
- `/admin/content`
- `/admin/settings`

## 10. Do not copy old architecture

The current system does **not** use:

- JWT-based admin sessions;
- an `admins` database table;
- query-parameter language switching;
- automatic registration verification;
- automatic attendance confirmations;
- automatic capacity enforcement.

Use the canonical root documents for current behavior.

## 11. Practical local setup checklist

### Step 1 — prerequisites

- Node.js 18+
- npm
- Git
- access to the intended Supabase project
- access to Vercel only when deployment work is required

### Step 2 — clone/install

```bash
git clone https://github.com/didar-Stuttgart/didar-website.git
cd didar-website
npm install
cp .env.example .env.local
```

### Step 3 — environment

Use the exact variable names in [DEPLOYMENT.md](DEPLOYMENT.md). Required server/client configuration includes Supabase URL and publishable key; admin/email operations require their respective server-side variables. Never paste real values into documentation.

### Step 4 — local admin password

```bash
node scripts/setup-admin.js
```

Store the generated value only as `ADMIN_PASSWORD_HASH` in the local environment.

### Step 5 — database

For a new project, apply `data/schema.sql` and migrations 001–014 in order. For an existing project, do not replay the entire history blindly; inspect the live database and apply only the required migration after checking its prerequisites.

Migration 012 must precede code that passes the cancellation-token hash. Migration 013 is required for re-registration after cancellation. Migration 014 is required for the admin event-image bucket.

### Step 6 — run locally

```bash
npm run dev
curl http://localhost:3000/api/health
```

### Step 7 — build/lint

```bash
npm run lint
npm run build
npm run start
```

The repository does not configure a runnable Jest/test command.

### Step 8 — admin smoke test

Open `/admin/login`, sign in, and verify dashboard/events/registrations access. Test uploads only when the `event-images` bucket is present.

### Step 9 — production boundary

Local setup never proves Production state. Verify Vercel deployment, Supabase migrations/bucket settings and real email delivery separately.
