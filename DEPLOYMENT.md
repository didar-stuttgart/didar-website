# DEPLOYMENT

This guide covers building, testing, and deploying the DIDAR website.

---

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (free tier sufficient)

### Initial Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/[owner]/didar-website.git
   cd didar-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Add Supabase credentials to `.env.local`:**
   - `NEXT_PUBLIC_SUPABASE_URL` — From Supabase project settings
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — From Supabase project settings
   - `SUPABASE_SECRET_KEY` — From Supabase project settings
   - `ADMIN_PASSWORD_HASH` — Will be set during admin setup

5. **Set up database:**
   - Open Supabase SQL editor
   - Run migrations in order (migration_001 through migration_009)
   - Each migration file is in `data/` directory

6. **Start development server:**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin/login

---

## Production Deployment

### Option 1: Vercel (Recommended)

Vercel provides automatic deployments from Git with zero configuration.

#### Initial Setup

1. **Push code to GitHub:**
   ```bash
   git push origin main
   ```

2. **Go to Vercel.com and sign in**

3. **Import project:**
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel automatically detects Next.js project

4. **Set environment variables:**
   - Click "Environment Variables"
   - Add each variable from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `SUPABASE_SECRET_KEY`
     - `ADMIN_PASSWORD_HASH`
   - Save and redeploy

5. **Deploy:**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Your site is live at `[project].vercel.app`

#### Ongoing Deployments

After initial setup, every git push to `main` triggers automatic deployment:

```bash
# Make changes locally
git add .
git commit -m "Update content"
git push origin main

# Vercel automatically:
# 1. Detects push to main
# 2. Builds the project
# 3. Runs tests (if configured)
# 4. Deploys to production
```

Monitor deployment status in Vercel dashboard.

### Option 2: Self-Hosted (Node.js)

For self-hosted deployments (AWS, DigitalOcean, etc.):

#### Build for Production

```bash
npm run build
npm run start
```

This starts the Next.js server on port 3000.

#### Reverse Proxy (nginx)

```nginx
server {
  listen 80;
  server_name didar-stuttgart.de www.didar-stuttgart.de;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

#### SSL Certificate (Let's Encrypt)

```bash
certbot certonly --standalone -d didar-stuttgart.de -d www.didar-stuttgart.de
```

Update nginx config to use HTTPS.

#### Process Manager (PM2)

Keep the server running even after restarts:

```bash
npm install -g pm2
pm2 start "npm run start" --name didar
pm2 startup
pm2 save
```

---

## Environment Variables

### Required Variables

| Variable | Example | Notes |
|----------|---------|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://xxxx.supabase.co | From Supabase dashboard. **Must be the same Supabase project** as the key below — see warning below. |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | eyJxxx... or sb_publishable_xxx... | From Supabase dashboard (Project Settings → API Keys). **Must belong to the same project** as the URL above. |
| SUPABASE_SECRET_KEY | eyJxxx... or sb_secret_xxx... | Keep secret! (server-only) |
| ADMIN_PASSWORD_HASH | $2b$12$xxxx... | Generated on admin setup |
| RESEND_API_KEY | re_xxxx... | Enables admin notification emails for Membership, Contact, and Event Registration forms. If unset, notifications fall back to a server console log only (form submissions still succeed either way). |
| DIDAR_NOTIFICATION_EMAIL | admin@didar-stuttgart.com | Inbox that receives the admin notification emails. |
| DIDAR_EMAIL_FROM | DIDAR Stuttgart <noreply@didar-stuttgart.com> | Optional. Defaults to `DIDAR Stuttgart <noreply@didar-stuttgart.com>` if unset. |

**Warning — Supabase URL/key project mismatch:** `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` must reference the **same** Supabase project.
If the key belongs to a different project than the URL, Supabase's API gateway rejects
every request with `"Invalid API key"`, which surfaces in this app as a generic
`500 Failed to submit application` (or equivalent) error on all forms — the app will
otherwise look correctly configured (both variables present, correct format, no startup
errors). When diagnosing a form submission failure, verify the key's embedded project
reference matches the URL's project reference before assuming any other cause.

### Optional Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| RATE_LIMIT_REQUESTS | 10 | Requests per window |
| RATE_LIMIT_WINDOW_MS | 60000 | Rate limit window in ms |
| NODE_ENV | development | Set to "production" on deploy |

### Secrets Management

**Never commit `.env.local` to Git:**

1. `.env.local` is in `.gitignore`
2. On Vercel: Use dashboard to set env variables
3. On self-hosted: Use system environment variables or `.env` file (not committed)
4. Rotate secrets periodically
5. Use separate secret for production

---

## Build & Optimization

### Build Process

```bash
npm run build
```

This:
1. Compiles Next.js app
2. Optimizes images and CSS
3. Creates `.next/` build artifacts
4. Runs any pre-deployment checks

### Build Time

- First build: ~60-120 seconds
- Incremental builds: ~30-60 seconds

### Output

```
npm run build
> next build

  ▲ Next.js 15.0.0

  ✓ Compiled successfully
  ✓ Linting and checking validity of types
  ✓ Optimizing for production
  ✓ Collecting page data
  ✓ Generating static pages (X prerendered)

Build complete. Preparing for production
```

---

## Database Migrations

### Applying Migrations

When deploying:

1. **Ensure migrations are applied to production database:**
   - Log into Supabase dashboard for production project
   - Open SQL editor
   - Run each migration file in order (001-009)
   - Verify no errors

2. **Test in staging first:**
   - Create separate Supabase project for staging
   - Apply migrations there
   - Test thoroughly before production

3. **Backup before major changes:**
   - Take Supabase backup before applying new migrations
   - Supabase automatically backs up daily

### Migration Checklist

- [ ] Backup production database
- [ ] Apply migration to staging
- [ ] Test staging site thoroughly
- [ ] Apply migration to production
- [ ] Verify production site works
- [ ] Document what changed (commit message)

---

## Health Checks

### Endpoint

**GET** `/api/health`

Returns:
```json
{
  "status": "ok",
  "timestamp": "2026-09-27T15:54:00Z"
}
```

### Monitoring

Use health endpoint to monitor uptime:

```bash
# Every 5 minutes, check health
*/5 * * * * curl -f https://didar-stuttgart.de/api/health || alert

# Or use external monitoring:
# - Vercel Monitoring (built-in)
# - UptimeRobot (free tier)
# - Pingdom
# - New Relic
```

---

## Performance Monitoring

### Vercel Analytics

Vercel provides built-in performance monitoring:
- Page load times
- User experience metrics
- Real-world usage data
- Deploy history

### Google Lighthouse

Run locally:
```bash
npm install -g @lighthouse-cli/cli
lighthouse https://didar-stuttgart.de
```

Targets:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

---

## Rollback

If deployment breaks the site:

### Vercel

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "Redeploy"
5. Site reverts to previous version

### Git

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard [commit-hash]
git push origin main --force
```

---

## Updating Dependencies

### Check for Updates

```bash
npm outdated
```

### Update Safely

```bash
# Update patch versions (safe)
npm update

# Update minor versions (test first)
npm install next@latest

# Verify still works
npm run dev
npm run build

# Commit and deploy
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

---

## Environment-Specific Settings

### Development (.env.local)

- Supabase development project
- Local admin password
- Verbose logging
- RATE_LIMIT disabled or very high

### Staging (.env.staging)

- Supabase staging project
- Staging admin password
- Normal rate limiting
- Production-like settings

### Production (.env or Vercel)

- Supabase production project
- Strong admin password (changed regularly)
- Normal rate limiting
- Performance optimizations
- Error tracking

---

## Admin Setup

### First-Time Admin

1. **Generate password hash:**
   ```bash
   # On your local machine
   npm run generate-admin-hash
   # Or manually create PBKDF2 hash of your password
   ```

2. **Set ADMIN_PASSWORD_HASH in environment:**
   - Local: Add to `.env.local`
   - Vercel: Add to environment variables
   - Self-hosted: Add to `.env`

3. **Deploy with new hash**

4. **Visit admin login:**
   - http://localhost:3000/admin/login (local)
   - https://didar-stuttgart.de/admin/login (production)

5. **Log in with password**

6. **Change password:**
   - Not yet implemented; contact owner to update ADMIN_PASSWORD_HASH

---

## Maintenance

### Regular Tasks

| Task | Frequency | Steps |
|------|-----------|-------|
| Monitor uptime | Daily | Check `/api/health` |
| Review errors | Daily | Check Vercel logs |
| Backup database | Weekly | Verify Supabase backups |
| Review registrations | Weekly | Check admin dashboard |
| Update dependencies | Monthly | npm outdated, update, test |
| Security audit | Quarterly | Review access, passwords, secrets |

### Logs

**Vercel:**
- Go to dashboard → Deployments → Logs
- View request logs, errors, warnings

**Self-hosted:**
- Check application stdout/stderr
- Use PM2: `pm2 logs didar`

---

## Troubleshooting Deployments

### Build Fails on Vercel

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Test locally first:** `npm run build`
4. **Common issues:**
   - Missing env variables
   - Incompatible dependency versions
   - TypeScript errors (if enabled)

### Site Down After Deployment

1. **Check Vercel status page** for platform issues
2. **Redeploy previous version** if needed
3. **Check logs** for error messages
4. **Verify database** connection still works
5. **Clear cache** (Vercel does this automatically)

### Database Connection Fails

1. **Verify connection string** in env variables
2. **Check Supabase** project is running
3. **Test locally** with same connection string
4. **Check IP allowlist** (if configured)

---

## Related Documentation

- **ARCHITECTURE.md** — Technical architecture overview
- **SECURITY.md** — Security best practices
- **DATABASE.md** — Database setup and schema
