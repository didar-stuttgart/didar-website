# DEPLOYMENT

Setup, environment, deployment, migrations, verification and recovery. Verified against the repository on 2026-10-17. Where something can only be confirmed in a dashboard (Vercel, Supabase, Resend), it is marked NOT VERIFIED.

Related: [README.md](README.md) · [DATABASE.md](DATABASE.md) · [SECURITY.md](SECURITY.md) · [FORMS.md](FORMS.md)

## 1. Current setup

- **Hosting:** Vercel (production response headers show `server: Vercel`, region `fra1`; project under the Vercel team `didar-team`). Domain: `www.didar-stuttgart.com` (the apex redirects with HTTP 308).
- **Deploy trigger:** pushing to the GitHub repository `didar-Stuttgart/didar-website` branch `main` deploys to production (observed: a push on 2026-10-17 deployed immediately). Branch/preview behaviour and exact Vercel project settings are NOT VERIFIED.
- **Database:** one Supabase project (PostgreSQL). There is **no staging environment** known to the repository.
- **Email:** Resend, sending domain `didar-stuttgart.com` (return-path `rsend.didar-stuttgart.com`); the domain must stay verified in Resend.
- **Build output:** standard `next build`; no custom `vercel.json` in the repository.

## 2. Environment variables

Set them in Vercel (Project → Settings → Environment Variables) and locally in `.env.local` (never committed). Names verified by searching the code; **never put values in documentation, tickets or chat**.

| Variable | Required | Used by | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | `lib/supabase.js` | the code throws at import time without it |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | `lib/supabase.js` | must belong to the **same** project as the URL, otherwise every request fails with "Invalid API key" (appears as generic 500s on all forms) |
| `SUPABASE_SECRET_KEY` | yes (admin) | `createAdminClient()` | server-only; bypasses RLS; admin login/sessions and all `/api/admin/*` need it |
| `ADMIN_PASSWORD_HASH` | yes (admin) | `pages/api/auth/login.js` | `salt:hash` from `node scripts/setup-admin.js`; the script enforces ≥ 12 chars with upper/lower/digit/special |
| `RESEND_API_KEY` | for email | `lib/admin-email.js`, `lib/registration-receipt-email.js` | missing → receipt skipped; admin notifications fall back to logging submitted data to the console |
| `DIDAR_NOTIFICATION_EMAIL` | for admin email | `lib/admin-email.js` | recipient of all admin notifications (currently didar.stuttgart@gmail.com per project configuration) |
| `DIDAR_EMAIL_FROM` | no | both email libs | default `Didar Stuttgart <noreply@didar-stuttgart.com>` |
| `NEXT_PUBLIC_APP_URL` | no | `lib/registration-cancellation.js` | base URL for cancellation links, default `https://www.didar-stuttgart.com`. A preview deployment that does not set it will still emit production links |
| `RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW_MS` | no | `lib/rate-limit.js` | defaults 10 and 60000 |

`NODE_ENV` / `VERCEL_ENV` appear in `.env.example` but are not read by the application code. `.env.example` still carries some outdated comments ("Phase 3+/Phase 5"); the table above is authoritative. After changing any variable in Vercel, redeploy for it to take effect.

## 3. Local development and checks

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev                  # FA: http://localhost:3000  DE: http://localhost:3000/de
npm run lint                 # warnings only at the time of writing (img elements, hook deps)
npm run build                # needs working Supabase env vars and network access
```

- A cold `next build` can take several minutes on slow machines (a warm cache took ~10 s of compilation plus page generation on 2026-10-17).
- **Automated tests:** none are runnable. `__tests__/auth.test.js` imports `@jest/globals`, but Jest is neither a dependency nor configured and `package.json` has no `test` script. Verification today is manual (see §6).
- Never point a local `.env.local` at the production Supabase project when testing destructive actions; there is no staging database.

## 4. Deploying

1. Make sure `npm run build` passes locally.
2. If the change needs a database migration, **apply it to production first** (§5).
3. Commit and push to `main` (or merge a PR); Vercel builds and deploys automatically.
4. Run the post-deploy checks (§6).

Code that depends on a migration must not go out before the migration is applied. On 2026-10-17 the receipt-email code (which calls the 8-argument `insert_event_registration_manual`) was pushed before migration 012 existed in production; every event registration returned 500 until the migration was applied manually. Keep this ordering rule.

## 5. Database migrations

There is no migration runner. Migrations are plain SQL files in `data/` that are pasted into the Supabase SQL editor.

1. Confirm a recent backup exists (Supabase dashboard; plan/retention NOT VERIFIED).
2. Read the file; check whether it is re-runnable (most newer ones use `IF NOT EXISTS`, `DROP … IF EXISTS`, `BEGIN/COMMIT`).
3. Run it in the SQL editor of the **production** project.
4. Verify, for example:
   ```sql
   select proname, pronargs from pg_proc
   where proname in ('insert_event_registration_manual','cancel_event_registration_manual',
                     'insert_membership_application_manual','insert_contact_submission_manual');
   select column_name from information_schema.columns
   where table_name = 'event_registrations' order by 1;
   ```
   (`insert_event_registration_manual` must show 8 arguments after migration 012.)
5. Then deploy the dependent code.

Full order for a new database and the effect of each file: [DATABASE.md](DATABASE.md#1-how-to-build-a-database-from-scratch). There are no "down" migrations.

## 6. Post-deployment verification checklist

1. `GET /api/health` → `200 {"status":"healthy",…}` (reads the `events` table; `503` on failure).
2. Home page in FA (`/`) and DE (`/de`): hero text, events present; language toggle keeps the route.
3. An event detail page renders; a registration form appears only for `open` events.
4. Submit **one** registration with an address you control (events registrations are permanent and the address cannot be reused for that event): expect the success modal, a row in Supabase, the admin notification email, the receipt email (check Spam), and that the cancel link opens the confirmation page (do not click confirm unless you intend to cancel).
5. Membership and contact forms: one test each with your own address (membership addresses are unique and permanent).
6. Admin: login, dashboard numbers, registrations list. 
7. Check the Vercel function logs for errors and Resend → Emails for delivery. HTTP 201 from an API **does not prove** an email was delivered.
8. For email-related changes, open the received message in Gmail → "Show original" and confirm SPF/DKIM/DMARC pass.

## 7. Troubleshooting production

| Symptom | Where to look |
|---|---|
| All forms return 500 | Vercel function logs; "Invalid API key" → Supabase URL/key mismatch (§2) |
| Only event registration returns 500 | RPC signature vs. code (§4); duplicate/unique errors are 409 not 500 |
| Admin cannot log in | `ADMIN_PASSWORD_HASH` set? `SUPABASE_SECRET_KEY` valid? logs from `/api/auth/login` |
| No notification email | `RESEND_API_KEY`/`DIDAR_NOTIFICATION_EMAIL` set? Resend dashboard; domain verification; logs contain `[Admin Email]` lines (a "console fallback" line means the variables are missing) |
| Receipt email missing | `[Receipt Email]` log lines; Spam; Resend dashboard |
| Page content stale | ISR windows (60 s event page, up to 1 h home/list) |
| Build fails on Vercel | build log; Supabase env vars present at build time (pages are pre-rendered against the database) |

## 8. Rollback and recovery

- **Code:** in Vercel, promote/redeploy an earlier successful deployment (standard Vercel feature; not exercised for this project) or `git revert` the offending commit and push. Prefer `git revert`; do **not** rewrite `main`'s history.
- **Database:** no automated rollback. Migration 012 is not backward compatible with the pre-012 code (it drops the 7-argument RPC), so rolling code back past that point requires restoring the old function from `migration_006` in SQL — do this only deliberately and re-test registration.
- **Data:** Supabase backups (dashboard). Test restores are NOT VERIFIED.
- **Secrets compromised:** see [SECURITY.md](SECURITY.md#8-incident-steps).

## 9. Regular maintenance

| Task | How often |
|---|---|
| Check `DIDAR_NOTIFICATION_EMAIL` inbox and Spam | daily while forms are active |
| `npm audit` / dependency updates (test locally with `npm run build` first) | monthly |
| Review Supabase backups and Resend domain status | quarterly |
| Delete expired rows from `admin_sessions` (`delete from admin_sessions where expires_at < now()`) | occasionally; nothing cleans them automatically except on a failed login-validation of that specific expired token |
