# SECURITY

What is actually implemented, what is only a manual procedure, and what is a known gap. Verified against the repository and the production site on 2026-10-17. Nothing here is a legal opinion or a guarantee of compliance; legal pages (Impressum, Datenschutz) need owner-reviewed, evidence-based legal review.

**Never write secret values into this repository, into documentation, or into chat/tickets.** Secrets are referred to by variable name only.

Related: [DATABASE.md](DATABASE.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [FORMS.md](FORMS.md) · [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

Legend — **Implemented** (in code, checked) · **Manual** (procedure/dashboard setting) · **Gap** (known weakness or unverified).

## 1. Secrets and configuration

| Item | Status |
|---|---|
| `.env.local` is git-ignored (`.gitignore` covers `.env`, `.env*.local`, `.env.production`, `.env.development`, `.env*.secret`, `*.pem`, `*.key`, `.sessions.json`, `*.csv`, `*.xlsx`) | Implemented |
| `.env.example` contains only placeholders | Implemented (checked) |
| Pattern scan of all tracked files and of the Git history for Supabase/Resend/JWT-style keys and private keys (2026-10-17) found no secrets; `.env`/`.env.local` were never committed. Only placeholder strings appear in docs. The scan is pattern-based and cannot prove absence | Implemented / limited evidence |
| `SUPABASE_SECRET_KEY` only read server-side in `lib/supabase.js`; not prefixed `NEXT_PUBLIC_` | Implemented |
| `RESEND_API_KEY` only read server-side | Implemented |
| Key rotation, separate prod/dev secrets, who has dashboard access | Manual / NOT VERIFIED |
| `scripts/tmp/insert_events.js` and `update-event-descriptions.sh` read secrets from `.env.local` / environment (not stored in them) | Implemented; scripts are one-offs (see [PROJECT_STATE.md](PROJECT_STATE.md)) |

## 2. Admin authentication and sessions

Implemented (`lib/admin-auth.js`, `lib/session-store-db.js`, `pages/api/auth/*`, `lib/api-middleware.js`):
- One admin account. Password checked against `ADMIN_PASSWORD_HASH` = `salt:hash`, **PBKDF2-SHA256, 10,000 iterations**, 64-byte key, 16-byte random salt. `scripts/setup-admin.js` enforces a password of ≥ 12 characters with upper/lower/digit/special.
- Login creates a random 32-byte token, stores only its SHA-256 in `admin_sessions` (24 h expiry) and sets cookie `session_token; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`.
- Every `/api/admin/*` route calls `requireAdminSession` (cookie → hash → lookup → expiry check; any error = denied). Expired sessions are deleted when presented. Logout deletes the row.
- `admin_sessions` has RLS with a deny-all policy and no grants to `anon`/`authenticated`; only the service role reads/writes it.
- Unauthenticated calls to admin APIs return 401 (checked on production for `/api/admin/events`).

Fixed on 2026-10-17 (uncommitted until deployed; tested locally): the session cookie gets `Secure` when `NODE_ENV=production` (items 1 below); login is throttled (5 failures per IP per 15 min → HTTP 429, `lib/login-throttle.js`, in-memory per instance); password comparison is constant-time; session-token and cookie-header logging was removed from `login`, `verify`. Remaining gaps / owner decisions:
1. *(Fixed in code, takes effect on deploy; production cookie flags NOT VERIFIED)* `Secure` flag.
2. PBKDF2 iteration count (10,000) is far below current guidance. Raising it needs a hash-format change and a new `ADMIN_PASSWORD_HASH` — owner decision.
3. Login throttle is in-memory per serverless instance, so it slows guessing but is not a global limit.
4. Auth logging no longer prints token material. Older Vercel logs may still contain 16-character token prefixes; sessions last 24 h, so they have expired.
5. No CSRF token; protection relies on `SameSite=Lax` and JSON-only endpoints.
6. Single shared password: no per-user accountability, no password-change feature, no 2FA.
7. Sessions are not revoked on logout from other devices; "revoke all" is a manual SQL delete (§8).

## 3. Database access control

See [DATABASE.md](DATABASE.md#5-permissions-and-access-boundaries) for the full matrix. Summary:
- RLS enabled on all tables; public reads limited to published events and enabled CMS rows; personal-data tables are not readable by `anon`. Implemented (per repo SQL; production state NOT re-verified).
- Public writes go through `SECURITY DEFINER` RPCs executable by `anon`; admin work uses the secret key. Implemented.
- **Gap:** `anon` still has direct `INSERT` on `event_registrations`, `membership_applications`, `contact_submissions` (grant + permissive policy), so the API's validation/rate-limit can be bypassed by someone holding the public key. The RPCs make this unnecessary; consider revoking.
- Fixed in code 2026-10-17: the home page strips `admin_notes` from embedded event data (local build verified: 0 occurrences in `/` and `/de`). Production still serves the old payload until deployed; values were empty on 2026-10-17.
- `getStaticProps` of the event page attempts a database `UPDATE` with the publishable key (see [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md#8-known-issues-documented-not-fixed)).

## 4. Input handling

- Server-side validation on all three forms and login (`lib/validation.js`); trimming; lower-cased emails; length limits (see [FORMS.md](FORMS.md)). Implemented.
- SQL injection: all database access uses the Supabase client / RPC parameters; no string-built SQL in the application. Implemented.
- XSS: React escapes rendered values; `dangerouslySetInnerHTML` is not used in `pages/` or `components/`. Emails: `escapeHtml()` is applied to user-supplied values in the admin notification and receipt templates. Implemented. (CMS values are rendered as text by React.)
- CSV exports prefix cells starting with `=`, `+`, `-`, `@`, tab or CR with `'` (`lib/csv.js`; unit-tested).
- Client-side checks (including the repeat-email comparison and the membership privacy checkbox) are UX only.

## 5. Abuse protection

- Public forms and the cancel endpoint: in-memory per-IP limiter (default 10 requests/60 s) shared across those endpoints. It resets on restart and is per server instance, so it limits casual abuse only. No CAPTCHA/bot protection. `x-forwarded-for` is trusted as sent.
- Registrations require an open, published event and respect unique `(event_id, email)`.
- Cancellation tokens: 256-bit random, only the SHA-256 is stored; format-checked (43 URL-safe chars) before any query; opening the link never mutates; invalid/unknown tokens return a uniform `404 invalid`.

## 6. Transport, headers, cookies, storage

- HTTPS on Vercel; `next.config.js` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`; Vercel adds HSTS (observed `max-age=63072000`). No Content-Security-Policy (Gap, optional).
- Cookies: only the admin `session_token` (admin users). No tracking/analytics cookies are set by the code. Browser storage: `localStorage['didar-lang']` (language choice) only.
- Fonts are self-hosted by `next/font` at build time (no Google request from the visitor's browser). External links (Instagram, Telegram) are plain outbound links.

## 7. Privacy and third parties

- **Collected data:** registrations (name, email, optional phone/Telegram/comment, event), membership applications (name, email, optional phone/Telegram/additional info), contact messages (name, email, message). The repeat-email field is never stored or sent. No IP addresses are stored by the application.
- **Processors:** Supabase (storage), Vercel (hosting, logs), Resend (email). Each admin notification contains the full submission; event registrants additionally receive a receipt email addressed to them.
- **Privacy policy:** `pages/datenschutz.js` is hard-coded and was **not** changed when the receipt email was introduced. Whether it fully describes the acknowledgment email, Resend, retention and deletion is an owner/legal question (NOT VERIFIED; open item).
- **Retention/deletion:** no retention periods or deletion tooling exist; no admin delete function; deletion is manual SQL in Supabase. Backups follow Supabase.
- **Logs contain personal data in two cases:** the "console fallback" of `lib/admin-email.js` (when Resend variables are missing) prints the full submission, and a few error logs print Supabase error objects.
- Exports (`registrations.csv`, `memberships.csv`) contain personal data; keep them out of Git (ignored) and shared drives.

## 8. Incident steps

**Admin session/password possibly exposed**
1. Generate a new password hash (`node scripts/setup-admin.js`), update `ADMIN_PASSWORD_HASH` in Vercel, redeploy.
2. Revoke sessions: `delete from admin_sessions;` in the Supabase SQL editor.
3. Check recent changes to events/content; restore from backup if needed.

**Supabase keys exposed:** rotate the publishable and secret keys in Supabase, update Vercel variables and `.env.local`, redeploy, review access logs.

**Resend key exposed:** revoke in the Resend dashboard, create a new key, update `RESEND_API_KEY`, redeploy.

**A secret was committed:** do not just delete the file. Rotate the secret first; history rewriting is a separate, deliberate owner decision.

**Personal data leak suspected:** identify the scope, preserve logs, inform the owner immediately; notification duties under GDPR are a legal matter for the owner.

## 9. Dependencies

`npm audit --omit=dev` (2026-10-17): 4 findings, none applied yet. **`next` 15.5.25 is affected by two ISR/SSG cache-poisoning advisories (GHSA-4jqv-mc3x-m676, GHSA-mcj8-r9mp-w47p), patched in 15.5.27+; 15.5.28 exists and stays within the `^15.0.0` range.** The site uses ISR, so upgrading `next` is the priority. Also: `postcss` 8.4.31 (nested in `next`, fixed ≥ 8.5.30), `sharp` 0.35.4 (fixed 0.35.5), `source-map-js` 1.2.1 (fixed 1.2.2). Upgrade with `npm install next@15.5.28`, run `npm run build`, test locally, then deploy; this has not been done. The `resend` package is declared but unused.

## 10. Checklist before changing anything security-relevant

- [ ] No secret printed or committed
- [ ] RLS/grants unchanged unless the change is the point; review with [DATABASE.md](DATABASE.md)
- [ ] Admin API still returns 401 without a session
- [ ] Email failures still never roll back a saved submission
- [ ] Manual-registration model preserved

## 11. Open decisions (analysed 2026-10-17, nothing applied)

- **Direct anon INSERT.** `data/schema.sql` / migration 003 grant `INSERT` on the three form tables to `anon` with `WITH CHECK (true)` policies. Application code never inserts directly: all three submit endpoints call the RPCs (`insert_event_registration_manual`, `insert_membership_application_manual`, `insert_contact_submission_manual`), which are `SECURITY DEFINER` with `search_path = public` and executable by `anon`. So the table grants are not needed by the current implementation. Narrowest change: `REVOKE INSERT ON` the three tables (and `USAGE` on their id sequences) `FROM anon`, and drop the three `public_insert_*` policies. Risks: function owner must keep rights (RPCs run as owner, normally unaffected); `capacity-status` reads `event_registrations` with the anon client and already fails/returns nothing useful because anon has no SELECT. Test on a Supabase branch/staging first: submit each form, then confirm a direct anon REST insert returns 401/403. Production grants NOT VERIFIED (migrations 007/008 comments suggest production may already differ from `schema.sql`).
- **Password hash.** Format is `salt:hash` (hex), PBKDF2-SHA256, 10,000 iterations hard-coded in `lib/admin-auth.js`. Backward-compatible plan: accept two formats, `salt:hash` (legacy, 10k) and `pbkdf2$<iterations>$salt$hash`; keep legacy verification, generate new format in `scripts/setup-admin.js` with ≥ 600,000 iterations; set the new `ADMIN_PASSWORD_HASH` in Vercel only after the code supporting both formats is live; then revoke sessions. Login takes noticeably longer (hundreds of ms) and the handler is already per-request. Needs owner approval and a locally generated hash; no credentials belong in the repo.
- **Dependencies.** See §9. Upgrade `next` first; the rest follow via `npm audit fix` (review lockfile diff).
- **CSP.** Needed by the site: own scripts (Next bundles plus inline `__NEXT_DATA__`/bootstrap scripts, so `script-src` needs `'unsafe-inline'` unless nonces are added, which Pages Router static pages do not support), many inline `style=` attributes (`style-src 'unsafe-inline'`), self-hosted fonts via `next/font` (`font-src 'self'`), event images from `/images/*`, and possibly arbitrary https URLs entered as `image_url` in the admin (`img-src 'self' data: https:`), `connect-src 'self'` (the browser only calls own `/api`; Supabase and Resend are server-side only), `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. Staged plan: ship as `Content-Security-Policy-Report-Only`, browse all public and admin pages in FA and DE, check the console for violations, then enforce.
- **`/api/admin/fix-event-status`.** A hard-coded one-off for the slug `e2e-capacity-test-temp-2026-09-25`; no UI or code references it (only docs). It is admin-gated and POST-only. Recommendation: remove in a separate approved change (it adds attack surface for no ongoing purpose).
