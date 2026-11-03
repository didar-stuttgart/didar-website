# SECURITY

Implemented controls, open risks and evidence boundaries. This is not a legal compliance opinion.

## 1. Secrets

Never commit or paste secret values.

Server-only secrets include:

- `SUPABASE_SECRET_KEY`
- `ADMIN_PASSWORD_HASH`
- `RESEND_API_KEY`

Public variables begin with `NEXT_PUBLIC_`.

The repository's tracked-file/history pattern scan previously found no committed secrets; that scan was pattern-based and cannot prove absolute absence.

## 2. Admin authentication

Current implementation:

- one shared admin password;
- PBKDF2-SHA256 password hash in `ADMIN_PASSWORD_HASH`;
- 10,000 PBKDF2 iterations remain in code;
- random 32-byte session token;
- SHA-256 token hash stored in `admin_sessions`;
- 24-hour session expiry;
- HttpOnly cookie;
- SameSite=Lax;
- Secure in Production;
- failed-login throttle is 5 failures per IP per 15 minutes, in-memory per server instance;
- token material is no longer logged by the login/verify paths.

Open risks remain:

- PBKDF2 iteration count is below modern guidance and requires a deliberate credential migration;
- login throttling is not global across Vercel instances;
- one shared admin password means no per-user accountability;
- no 2FA;
- no dedicated CSRF token; current browser requests rely on the SameSite=Lax cookie policy and the existing same-origin request patterns.

## 3. Database access

Implemented boundaries:

- published events and enabled CMS content are public-read;
- personal-data tables are not publicly readable;
- public submissions use SECURITY DEFINER RPCs;
- admin APIs use the secret key only after application session validation.

Repository-level findings (Production database state remains **NOT VERIFIED**):

- `anon` has direct table-level INSERT grants on `event_registrations`, `membership_applications` and `contact_submissions`; the corresponding RLS INSERT policies use `WITH CHECK (true)`. Table-level INSERT is not restricted to only the public form fields, so caller-supplied administrative columns may also be set when the grants and policies are active.
- `anon` has EXECUTE on the public form `SECURITY DEFINER` RPCs. These functions perform inserts but do not independently enforce all Next.js business validation, including event publication and registration-open checks. Direct RPC calls therefore bypass application validation and per-instance API rate limiting.
- `events` has a table-level SELECT grant to `public`, while its RLS policy filters rows to published events. This is row-level, not column-level, protection: `admin_notes` is not excluded from direct table reads by that policy. Homepage filtering only protects the homepage payload; it does not revoke direct PostgREST/database column access.

These are confirmed in repository SQL, not confirmed in Supabase Production. Do not attempt public writes or read real records to verify them. Use read-only catalog/privilege queries against Production. Remediation requires an explicit migration plan and compatibility testing; do not apply grants/revokes or change the manual-registration workflow as part of an investigation.

## 4. Input and output handling

- Server-side validation exists for public forms and login.
- Email addresses are normalized.
- React escaping is used for page rendering.
- Email helpers escape user-controlled values.
- CSV helpers prefix spreadsheet-dangerous leading characters.

## 5. Rate limiting and abuse

Public form/cancellation APIs use an in-memory per-IP limiter.

It is best-effort only:

- default 10 requests / 60 seconds;
- per server instance;
- `x-forwarded-for` is used;
- no CAPTCHA/bot defense.

Admin login has a separate failure throttle.

## 6. Event image security

The event-image upload route:

- requires an admin session;
- accepts JPEG/PNG/WebP only;
- checks the binary signature;
- enforces 5 MB maximum;
- uploads through `SUPABASE_SECRET_KEY`;
- expects public reads but does not grant public uploads.

Migration 014 configures the bucket, but Production application of migration 014 is **NOT VERIFIED**.

## 7. Resolved homepage data exposure

The homepage now removes `admin_notes` from event data before embedding it into the public page payload.

Evidence:

- source implementation is present in the repository;
- the current Production deployment is descended from that implementation;
- the previous local build verification found no `admin_notes` occurrence in the homepage payload.

Current runtime HTTP re-verification of the live page was not completed in the last investigation because direct fetches returned cache-miss errors. Therefore the code/deployment status is **implemented and deployed; live payload not independently re-verified**.

## 8. Privacy/logging risks

Potential personal-data leakage remains possible when:

- Resend variables are missing and email helpers fall back to logging submitted data;
- error logs include Supabase error objects.

Retention periods and deletion policy are still owner/legal decisions.

The privacy policy should be reviewed against the current receipt email, cancellation mechanism, processors and retention behavior.

## 9. Dependency status

Current `package.json` specifies Next.js `^15.5.28`, matching the version used by the verified recent build/deployment.

Dependency maintenance is still an ongoing task; do not infer "secure" solely from the version string or from a successful build.

## 10. Incident basics

If credentials may be exposed:

1. rotate the affected secret;
2. update the relevant deployment environment;
3. redeploy;
4. revoke admin sessions when appropriate;
5. review recent data changes and logs.

Do not rewrite Git history as the first response to an exposed secret.

## 11. Open decisions

- raise PBKDF2 iterations / migrate hash format;
- revoke direct anon INSERT on form tables;
- decide retention/deletion policy;
- decide whether to remove dead legacy code;
- remove `/api/admin/fix-event-status` when owner-approved;
- legal/privacy review of the current email and data-handling model.

## 4A. Response security headers

`next.config.js` currently sets these headers for all paths:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

There is no CSP configured in the current repository. Treat header changes as security-sensitive and verify them in a rendered browser/network response.


## 12. Security investigation — repository findings (2026-11-03)

The following findings were checked against the current `main` source and SQL. **Source-confirmed does not mean Production-exploitable**: live PostgreSQL grants, RLS policies, function definitions and ownership have not yet been inspected.

| ID | Finding | Source status | Production status |
|---|---|---|---|
| DIDAR-SEC-01 | Direct anonymous INSERT on the three form tables | Confirmed | NOT VERIFIED |
| DIDAR-SEC-02 | Anonymous EXECUTE on public form SECURITY DEFINER RPCs | Confirmed | NOT VERIFIED |
| DIDAR-SEC-03 | Public table-level SELECT can include `events.admin_notes` for published rows | Confirmed | NOT VERIFIED |
| DIDAR-SEC-04 | Public API rate limiting is in-memory and per server instance | Confirmed | Source behavior confirmed; live abuse impact not tested |
| DIDAR-SEC-05 | SECURITY DEFINER functions use `search_path = public`; ownership/schema hardening is not established | Confirmed configuration; exploitability not established | NOT VERIFIED |
| DIDAR-SEC-06 | Anonymous cancellation RPC is protected by a high-entropy bearer token hash | Confirmed design; review item, not a demonstrated vulnerability | NOT VERIFIED |

### DIDAR-SEC-01 — Direct anonymous INSERT

Migration 003 grants `INSERT` on all three form tables to `anon`; the corresponding RLS INSERT policies permit rows with `WITH CHECK (true)`. The grant is table-level, not restricted to a column allowlist. If active in Production, an anonymous caller may supply writable administrative columns at INSERT time (for example, registration/application status, `admin_notes`, or contact `read`). This does not grant UPDATE or SELECT on existing personal-data rows.

### DIDAR-SEC-02 — Public form RPC execution

Migrations 005–008 and 012 grant `anon` EXECUTE on the form insert functions and cancellation function. The current insert functions are SECURITY DEFINER. The event-registration, membership and contact insert functions do not independently reproduce all Next.js validation and business rules. If the grants are active in Production, direct RPC calls can bypass API validation and the API's per-instance rate limiter. The cancellation function is a separate token-based workflow: the caller must possess the random cancellation token; do not classify it as equivalent to unauthenticated form insertion.

### DIDAR-SEC-03 — Published event column exposure

Migration 003 grants `SELECT` on the `events` table to `public` and `authenticated`. The RLS policy limits visible rows to `status = 'published'`, but does not limit columns. The table contains `admin_notes`. The homepage removes that field from its own public payload, but that application-level filtering does not prevent a direct table query from requesting the column. Production exposure depends on the live grant and policy state and whether the column contains sensitive content; no live records were read.

### Evidence boundary and next step

The current Production deployment is READY and uses the same `main` commit recorded below. Supabase Production catalog/ACL/RLS state is **NOT VERIFIED**. The next safe step is a read-only metadata review of table grants, column privileges, RLS policies, function ACLs/owners/configuration, schema CREATE privileges and migration history. Do not perform INSERT/UPDATE/DELETE, call public write RPCs, read personal records, or modify Production during that review.

### Remediation direction — not authorized or implemented

- Remove unnecessary direct `anon` table INSERT privileges and associated sequence privileges, after verifying all callers and the current API path.
- Restrict public RPC execution to the server role and have the validated Next.js APIs call them with server-side credentials, **or** retain narrowly scoped public RPCs only if their SQL validation is independently sufficient. Choose only after reviewing runtime dependencies and preserving the manual workflow.
- Prevent public reads of `events.admin_notes` using a safe column-level/view design; keep the public event fields required by the site.
- Preserve manual review: submissions are stored immediately, admin review remains manual, no email verification or automatic attendance confirmation, and email notification failure must not roll back a saved submission.
- Do not implement any remediation until the read-only Production findings are reviewed and a separate implementation plan is approved.

## 13. Production verification boundary — Supabase Dashboard review (2026-11-03)

The authenticated Supabase Dashboard session identified the DIDAR Production project (`pvvjkypwsbcjiqogrmta`). The SQL Editor was visible, but its execution interface did not enforce a read-only database role or read-only transaction/session. No SQL was entered or executed. No credentials or application records were accessed.

This is a deliberate safety stop: a query being syntactically read-only (for example, a catalog `SELECT`) is not equivalent to an enforced read-only execution boundary when the SQL Editor session can also run unrestricted statements.

Accordingly, effective Production table/column privileges, RLS policies, function ACLs/owners/configuration, migration history, indexes and Storage metadata remain **NOT VERIFIED**. Dashboard project health is not evidence of these controls.

A future Production review requires a separately authorized, technically enforced read-only database identity/session. It should be limited to the required catalog and metadata visibility, with no write privileges and no access to application records. Do not use the ordinary unrestricted SQL Editor session for this investigation. Do not open connection details or expose credentials as a workaround.

No Production database, application, GitHub source code or deployment changes were made during this review.
