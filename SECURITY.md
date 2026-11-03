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

- other application error logs include Supabase error objects;
- a future change weakens the constrained notification-failure logging described in section 20.

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


## 14. Personal-data protection investigation — 2026-11-03

Investigation 03 reviewed the deployed application source baseline and Vercel Production configuration metadata. No user records, runtime logs, credentials, Production SQL, form submissions or write RPCs were accessed. Effective Supabase Production grants/RLS/function ACLs remain **BLOCKED / NOT VERIFIED** because no enforced read-only database identity/session was available.

### Confirmed findings and boundaries

| ID | Finding | Evidence status | Production interpretation |
|---|---|---|---|
| DIDAR-PD-01 | `SUPABASE_SECRET_KEY` is configured in Vercel Production as a readable configuration value (Vercel metadata marks it `readable-secret`). | Production configuration metadata observed | **FAIL — access-control exposure risk.** This is not evidence of public internet exposure. Members permitted to read configuration values may obtain an RLS-bypassing key. |
| DIDAR-PD-02 | Public table-level SELECT on `events` has no source-level column restriction for `admin_notes`. | Repository SQL confirmed | **FAIL source / BLOCKED Production.** Direct PostgREST column exposure depends on live grants/policies. |
| DIDAR-PD-03 | Anonymous direct INSERT is granted on the three form tables with permissive INSERT policies. | Repository SQL confirmed | **FAIL source / BLOCKED Production.** This may bypass API validation/rate limiting and permit caller-supplied writable fields on new rows; it does not establish reads of existing records. |
| DIDAR-PD-04 | Public form RPCs are executable by `anon` and do not independently reproduce all API validation. | Repository migrations/functions reviewed | **FAIL source / BLOCKED Production.** Direct RPC invocation may bypass API validation/rate limiting if grants remain active. |
| DIDAR-PD-05 | Email fallback path logs complete submission payloads when notification configuration is unavailable. | Conditional source behavior confirmed | **FAIL conditional source / NOT VERIFIED runtime.** Production invocation and log contents were not inspected. |
| DIDAR-PD-06 | Reviewed admin API routes require the database-backed admin session before creating the admin client. | Application source reviewed | **PASS source only.** Does not establish runtime behavior or database policy state. |

Repository SQL intends to deny public SELECT/UPDATE/DELETE on `event_registrations`, `membership_applications`, `contact_submissions` and public access to `admin_sessions`. This is a source-level finding only; it is not proof of effective Production permissions.

The application filters `events.admin_notes` from its known public API/page payloads, but frontend filtering does not secure direct database/PostgREST access. Public event queries use `select('*')` before filtering; Production browser payloads were not fetched.

CSV exports contain personal data and administrative notes but are protected by the reviewed admin-session checks and neutralize spreadsheet formulas. Cancellation-token hashes are not returned by reviewed list/update endpoints. The cancellation RPC remains a separate bearer-token workflow: the raw token is generated from 32 random bytes, only its SHA-256 hash is stored, and a token holder can cancel the corresponding registration and receive limited details.

### Remediation order — proposed, not implemented

1. Convert `SUPABASE_SECRET_KEY` to a non-readable Vercel Secret, review who can read Production configuration, and rotate the key if prior access cannot be ruled out. Verify admin APIs after any approved rotation/deployment.
2. Prevent public direct reads of `events.admin_notes` using a safe public view or explicit safe-column query design, while preserving public event pages and admin editing.
3. Remove unnecessary direct `anon` INSERT privileges and sequence usage only after Preview validation confirms the server API path works.
4. Move public RPC execution behind validated server-side API access, or prove each retained public RPC independently enforces all required rules; then restrict `anon` EXECUTE.
5. Replace fallback payload logging with non-PII operational metadata (for example, submission ID and failure category), without changing the rule that email failure must not roll back a saved submission.

Do not read personal records or runtime logs to prove these findings. Production database verification must use a separately authorized, technically enforced read-only metadata identity/session; the ordinary unrestricted Supabase SQL Editor is not acceptable.

Preserve DIDAR's manual registration model: submissions are saved immediately, reviewed manually, and notification email failures do not roll back successful database writes. No verification email, automatic public confirmation, or automatic capacity enforcement is to be reintroduced.

No remediation was implemented by this investigation. No application code, database permissions, schema, Vercel configuration or deployment was changed.

## 15. Vercel Production secret-visibility remediation attempt — Phase 05 (2026-11-03)

Phase 05 attempted the narrowly authorized in-place conversion of the existing Production `SUPABASE_SECRET_KEY` environment variable from Config/readable-secret to Secret/sensitive. The attempt was **BLOCKED** by the available safe Vercel edit interface.

### Verified result

- Production entry `Zfv3GNeII6VXkphc` is `SUPABASE_SECRET_KEY`, targets Production only, and remains `encrypted` / `config` with the `readable-secret` warning.
- Separate Preview entry `HXProF48ooiW3Uz2` remains Preview-only and `sensitive` / `secret`.
- The in-place edit API rejected `type: sensitive` without the corresponding `visibility: secret` field. The safe edit interface did not expose that field.
- No change was made; the post-check confirmed the Production entry is unchanged and exactly one Production entry exists.
- No secret value was retrieved, supplied, copied or exposed.
- No Preview variable, deployment, application code, database, Supabase setting, permission or other environment variable was modified.

The Vercel CLI fallback was not used because it requires supplying the variable value. No delete/recreate workaround was attempted.

### Status and remaining risk

**BLOCKED — remediation not applied.** Production `SUPABASE_SECRET_KEY` remains readable to Vercel users who have configuration-read access. This is an access-control exposure risk; it is not evidence that the key was publicly exposed or previously read.

The safest next step is for a Vercel project Owner to inspect whether the Dashboard offers an explicitly supported in-place Config → Secret conversion that preserves the existing value without revealing or re-entering it. If the Dashboard requires replacing/re-entering the value, stop. Do not use CLI or delete/recreate the variable as a workaround.

A coordinated key rotation may then be planned separately, after identifying the exact current Supabase key type and reviewing the supported migration/retirement procedure. Rotation, key replacement/revocation, environment changes, permission changes and deployment each require separate explicit authorization.

No deployment or runtime verification occurred in this phase. Do not mark the Production secret as protected until metadata confirms Secret/sensitive and the relevant deployment behavior is separately verified.


## 16. Production Supabase secret remediation — Phase 05 full authorization (2026-11-03)

**Overall status: BLOCKED — the Production variable is not yet protected.** This section records the authorized remediation attempt and the exact boundary where the available interfaces stopped the change.

### Credential type and use

- The existing Production value was classified internally by its format as a **new-format Supabase secret API key** (`sb_secret_` format), not a legacy JWT-formatted `service_role` key. The credential value was not emitted in tool output, documentation, or this report.
- `lib/supabase.js` reads `SUPABASE_SECRET_KEY` only in `createAdminClient()`. That client is server-side and bypasses RLS; reviewed admin API routes validate the database-backed admin session before constructing it. Public form API routes use the publishable key through `createServerClient()`.
- Supabase documents new secret keys as elevated keys that coexist with legacy keys and can be separately created and deleted. No Supabase key was created, changed, or deleted in this phase.

### Vercel configuration and attempted change

- Project: `didar-website` (`prj_dN7oXpS01Iw7ylmaJPdwKFfiPdw0`), team `didar-team`.
- Production variable ID `Zfv3GNeII6VXkphc`: `SUPABASE_SECRET_KEY`, Production only, type `encrypted`, visibility `config`, warning `readable-secret`.
- Preview variable ID `HXProF48ooiW3Uz2`: `SUPABASE_SECRET_KEY`, Preview only, type `sensitive`, visibility `secret`. Preview was not modified.
- The authenticated Vercel edit tool's schema rejects the required `visibility: secret` field before sending the request. Its supported fields do not provide a way to set that field. A previous request that set only `type: sensitive` was rejected because Secret visibility is also required. The available browser tool can inspect the open Dashboard tab but cannot navigate or interact with the edit dialog; the current tab remained on Team Overview, not the variable editor.
- No value was decrypted for display, copied into a report, or placed in a file. No variable was deleted/recreated, no value was replaced, and no Vercel or Supabase configuration was changed.

### Rotation and retirement

- **Rotation: NOT PERFORMED.** The current credential is confirmed to be a new-format Supabase secret key. Supabase supports creating an additional named secret key while the existing key remains valid; this permits a coordinated migration without revoking the working key first.
- The required safe sequence remains: create a replacement secret in Supabase; add it as a Vercel Production Secret; create a Production deployment; verify public pages and admin functions; then delete the old Supabase secret only after successful verification. The available connected tools do not expose Supabase API-key management, and the open browser integration is read-only, so key creation and Vercel Secret configuration could not be completed safely in this execution.
- **Old credential retired: NO.** The existing credential remains active and configured as before.

### Deployment and application verification

- The previously observed Production deployment `dpl_J8HS2NmhbCVyv8LzradmqpgGooZZ` remains `READY`, tied to commit `9ea770d147750a4ef5be00aefbe2e9549e27772a`. This deployment predates this remediation attempt and does not contain a protected replacement configuration.
- Recent production-target documentation deployments were returned as `CANCELED`; no deployment was initiated as part of this blocked credential change.
- Public website HTTP behavior, admin login, admin events/content/settings, database-backed session behavior, manual registration/membership/contact submissions, and actual administrative notification delivery were **NOT VERIFIED** during this phase. No fake public submissions or database writes were performed.

### Recovery and next action

Keep the current working credential active until the replacement is configured and tested. Use an interface that supports creating a new Supabase secret key and setting Vercel visibility to Secret, then deploy and verify before retiring the existing key. If a failed deployment occurs, preserve the old key and previous READY deployment for recovery. Do not claim remediation complete until the Production variable metadata shows Secret, a new Production deployment is READY and uses it, application behavior is verified, and old-key retirement is separately confirmed.

Evidence references: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Supabase key migration](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys), and [Vercel environment variables](https://vercel.com/docs/environment-variables).


## 17. Phase 05D execution closeout — 2026-11-03

**Overall status: BLOCKED.** The documentation reconciliation was merged to `main` in commit `e172f48ea7ebfdb18475b650d57810b993ab9dd7` (PR #5). This merge did not trigger or request a Production deployment.

### Rechecked Production configuration

A fresh Vercel environment metadata read (without decrypting values) confirms:

- `SUPABASE_SECRET_KEY` Production entry `Zfv3GNeII6VXkphc`: target `production`, type `encrypted`, visibility `config`, security issue `readable-secret`.
- `SUPABASE_SECRET_KEY` Preview entry `HXProF48ooiW3Uz2`: target `preview`, type `sensitive`, visibility `secret`, no security issue.
- No environment variable was changed and no value was decrypted or supplied.

### Execution boundary

- The connected Vercel edit action still has no `visibility` input; its schema cannot submit the required Config-to-Secret visibility change. The earlier unsupported edit attempt was not repeated.
- The connected Supabase actions expose no secret API-key create/delete operation. The connected browser integration exposes tab reading only, not Dashboard interaction. No Management API credential with key-management scope is available through the connected integrations.
- No replacement Supabase key was created. No Vercel Production value was replaced. The existing key remains configured and was not retired.
- No Production deployment was initiated. The previously observed READY deployment predates this remediation and is not evidence of the new credential configuration.
- Application verification (public routes, admin login, admin sections, database-backed admin operations) remains **NOT VERIFIED** for a replacement credential. No test submissions or user records were created or modified. Actual notification email delivery remains **NOT VERIFIED**.

### Required safe continuation

Use a supported Supabase Dashboard/Management API path to create a second new-format secret key while retaining the current key; configure that replacement as a Vercel Production Secret using an interface that explicitly supports Secret visibility; deploy and verify the public and admin paths; then retire the old key and verify retirement metadata. Preserve the existing Preview variable and all manual submission workflows. Do not claim resolution until all four gates—Production Secret metadata, new READY deployment, application verification, and old-key retirement—are independently PASS.


## 18. Phase 05E access and execution update — 2026-11-03

**Overall status: BLOCKED.** Fresh metadata was read without decrypting environment values.

### Current state

- GitHub `main` HEAD: `11ef0cc708b6c2495a8f2a91837d437755cb0051`.
- Production `SUPABASE_SECRET_KEY` entry `Zfv3GNeII6VXkphc`: Production, `encrypted` / `config`, `readable-secret`.
- Preview `SUPABASE_SECRET_KEY` entry `HXProF48ooiW3Uz2`: Preview, `sensitive` / `secret`, unchanged.
- Latest Production deployment `dpl_7RAFEr3sFX1E5AXYFAMSkzJv78wF` on documentation commit `11ef0cc708b6c2495a8f2a91837d437755cb0051`: `CANCELED`.
- Previous known-good Production deployment `dpl_J8HS2NmhbCVyv8LzradmqpgGooZZ`: `READY`, application commit `9ea770d147750a4ef5be00aefbe2e9549e27772a`.

### Access capability

- Vercel authenticated account is a team `OWNER`; team-role authorization is not the blocker. The connected Vercel environment API supports listing, creating and editing variables, but the edit operation schema does not expose Secret visibility and no delete-variable operation is available. The connected browser interface is read-only.
- The connected Supabase integration identifies the active DIDAR Production project `pvvjkypwsbcjiqogrmta`, but exposes no project secret API-key create/delete operation. The connected browser interface is read-only and currently shows the SQL Editor, not an API-key management form.
- No Supabase Management API token or key-management permission was made available through the connected integrations. No secret value was requested, decrypted, copied, or recorded.

### Incidental empty placeholder requiring cleanup

During capability testing, a Vercel create-variable call created an unintended empty-value placeholder:
- Name: `DUMMY`
- Variable ID: `BLJwGaFJm5594d6h`
- Target: Production
- Type/visibility: `sensitive` / `secret`
- Value: empty
- It is not referenced by application code and no deployment was made using it.

The connected Vercel integration has no delete-variable action, so this placeholder could not be removed through the available tool. Delete this exact `DUMMY` variable in Vercel Project → Settings → Environment Variables. Do not change the two `SUPABASE_SECRET_KEY` entries as part of that cleanup.

### Rotation and verification
No replacement Supabase key was created, no Production secret was installed, no new successful Production deployment was made, and the existing Supabase key was not retired. Public and admin application behavior under a replacement credential remains **NOT VERIFIED**. The prior READY deployment remains the recovery point. Do not revoke the old key until a replacement deployment and application verification pass.

Owner action required: create a second Supabase secret key in the DIDAR Production project's API Keys settings while retaining the old key; then configure the replacement directly in Vercel as a Production-only Secret. Do not send the value through chat, email, GitHub, logs, or screenshots. Once the owner confirms those Dashboard actions are complete, verify metadata, deploy, test, and retire the old key only after successful application verification.

## 19. Phase 05F non-destructive verification and owner decision — 2026-11-03

**Scope decision:** key rotation is intentionally deferred by the owner, not an implementation failure. Do not create, replace, modify, reconfigure, change visibility of, or revoke either existing `SUPABASE_SECRET_KEY` entry. This decision supersedes earlier sections that proposed owner key-rotation actions; those sections remain historical records of prior attempts.

### Environment metadata — rechecked without decrypting values

- **DUMMY cleanup — PASS:** a fresh complete environment-variable listing contains no `DUMMY` entry; `hiddenProductionEnvCount=0`. The previously documented placeholder ID `BLJwGaFJm5594d6h` is absent. No variable was deleted or changed in this verification run.
- **Production key — unchanged:** ID `Zfv3GNeII6VXkphc`, target `production`, type `encrypted`, visibility `config`, security issue `readable-secret`.
- **Preview key — unchanged:** ID `HXProF48ooiW3Uz2`, target `preview`, type `sensitive`, visibility `secret`, no reported security issues.
- Neither value was decrypted or displayed. No Supabase API key was created, replaced, modified, or revoked. Key rotation is **INTENTIONALLY DEFERRED BY OWNER DECISION**.
- **Remaining configuration risk — FAIL / OPEN:** Production configuration-read access may expose the elevated Supabase secret. This metadata finding is not evidence of public internet exposure or proof of prior access. The owner explicitly chose to retain this configuration for now.

### Deployment state

- **Documentation-only Production deployments — CANCELED:** at the initial deployment check, the newest record was `dpl_52mC3UXw8eac9uCZUxJ2Z7PrnhLy` on docs commit `ac637b1784d02006227cf754aa29d066d1a83dc4`. The two focused documentation commits recorded below also produced canceled Production deployment records; none became READY.
- **Latest READY Production deployment — PASS:** `dpl_J8HS2NmhbCVyv8LzradmqpgGooZZ`, source commit `9ea770d147750a4ef5be00aefbe2e9549e27772a` (`main`). Its deployment metadata lists the production aliases `www.didar-stuttgart.com` and `didar-stuttgart.com`. A final read of READY deployments confirmed this remains the latest READY Production deployment.
- No deployment was manually initiated by this verification. The READY deployment predates this review and does not demonstrate that the Production key visibility risk is resolved.

### Website and application verification

- **Runtime error scan — PASS (limited):** Vercel reported no grouped runtime errors for the project in the preceding seven-day window.
- **Public routes and rendered UI — NOT VERIFIED:** attempted page retrieval through the available web interface failed; outbound DNS/network access from the execution container was unavailable. The connected browser integration is read-only and cannot navigate or interact with the site.
- **Admin login, events, content, settings, session behavior, and unauthenticated access boundaries — NOT VERIFIED:** no interactive browser access was available. No login attempts, form submissions, database writes, or other application-data changes were performed.
- **Notification email delivery — NOT VERIFIED:** no email was sent as part of this read-only check. A clean grouped runtime-error summary is not proof of email delivery or absence of unaggregated application issues.

### Other security findings reviewed

The existing source-level findings documented in sections 12 and 14 remain open; effective Production database grants, RLS, column privileges, RPC ACLs/owners, migration state, and browser payloads remain **NOT VERIFIED**. No SQL was executed and no database permission was changed.

- **Additional configuration review item — NOT VERIFIED:** Production `ADMIN_PASSWORD_HASH` is also listed with Vercel `config` visibility. This metadata alone does not establish who can read it or whether it has been accessed. No environment variables other than the explicitly protected key entries were changed; assess its least-privilege visibility separately before any configuration change.
- The environment listing reported no other Vercel `securityIssues` flags beyond the Production `SUPABASE_SECRET_KEY` `readable-secret` finding and showed no hidden Production environment entries.
- No code, database, environment variable, deployment, or application data was modified during this verification.

**Phase 05F status:** DUMMY cleanup **PASS**; both existing key entries **UNCHANGED / PASS**; key rotation **INTENTIONALLY DEFERRED BY OWNER DECISION**; latest READY deployment identified **PASS**; live public/admin functionality **NOT VERIFIED**; Production secret visibility risk remains **FAIL / OPEN**.


## 20. Phase 07 focused application fixes and local verification — 2026-11-03

**Scope status: IMPLEMENTED and locally verified. Production runtime verification remains NOT VERIFIED.** This section records the focused fixes after the earlier Phase 06 source finding; it does not revise the historical Phase 05/06 records.

### Fix A — notification logging

All fallback, non-2xx provider-response, and thrown-request paths in `lib/admin-email.js` now emit only a fixed log message with a submission identifier, notification type, normalized failure category, and (when available) numeric HTTP status. They do not log submitted names, email addresses, phone numbers, messages, event details, raw Resend bodies, API keys, headers, or thrown error objects/messages.

The four notification functions still catch their own notification failures. Their existing callers invoke them only after a successful database write or completed cancellation, so a notification failure continues not to roll back the manual submission workflow. No public confirmation email or automated registration behavior was added.

### Fix B — database-backed session creation

`pages/api/auth/login.js` now requires `createSession(token) === true` before clearing login-throttle state, setting `session_token`, or returning a successful login. A false return or thrown session-creation failure returns the existing generic HTTP 500 response and does not expose the underlying database detail through the handler log. `lib/session-store-db.js`, password hashing, expiry, and cookie attributes are unchanged.

### Verification and boundaries

- **PASS — focused checks:** an isolated temporary harness exercised all four notification functions for missing configuration, provider rejection, and thrown requests; it asserted that logs contained only the normalized metadata. It also exercised login success plus session-creation false and throw cases, confirming no success cookie or throttle reset on either failure path.
- **PASS — lockfile install and lint:** `npm ci --no-audit --no-fund` completed from `package-lock.json`; `npm run lint` completed with only the repository's existing warnings (13 warnings, no lint errors).
- **PASS — production build:** `npm run build` compiled and generated the build output using temporary local-only placeholder public Supabase values. No real Supabase credentials, database, or application data were used. A temporary output-tracing-root setting was needed solely because an unrelated parent lockfile caused Next to traverse an inaccessible parent directory; that setting was removed afterward.
- **PASS — production dependency audit completed:** `npm audit --omit=dev --json` reported 3 low and 5 moderate findings, with no high or critical finding. The reported chain starts at direct dependency `resend@3.5.0`; the available automated fix is the semver-major `resend@6.37.0`, which is outside this focused fix and was not applied.
- **NOT VERIFIED:** Production deployment, runtime form submission, live Resend delivery, and Production log contents were not exercised. No Production environment variable, Supabase key, database schema/permission/data, or deployment was changed.

## 21. Phase 08 closeout and security work pause — 2026-11-03

**Owner decision:** pause further security investigation and remediation for now. This section records the current evidence and unresolved risks; it does not authorize or imply that any open item has been fixed. Resume only when the owner explicitly requests it.

### Phase 08 implementation and verification

| Check | Status | Evidence |
|---|---|---|
| Lint command compatibility | **PASS** | `package.json` changes the lint script from `next lint` to `eslint .`; commit `fb6a97bd1b40971e7ae995358771567f41caff87`. |
| Dependency installation | **PASS** | `npm ci` completed in the isolated checkout. |
| Lint | **PASS** | `npm run lint` completed with 13 existing warnings and 0 errors. |
| Isolated local build | **FAIL / ENVIRONMENT BLOCKED** | `npm run build` could not fetch Google Fonts through `next/font` because the isolated environment returned `EACCES`. No environment-specific workaround or build configuration change was committed. |
| Vercel Preview deployment | **PASS** | Preview deployment for `fb6a97b` reported READY and its alias pointed to the requested Preview URL. This is evidence of a successful Vercel build/deployment, not visual QA. |
| PR #7 source/diff | **PASS — review only** | PR remains open and mergeable at HEAD `fb6a97b`; diff contains the four Phase 07 files plus the `package.json` lint-script change. Reported security fixes remain present; no introduced secrets or submission data were found in the final diff/secret scan. |
| Authenticated Preview visual QA | **NOT VERIFIED** | Preview remains protected by Vercel Authentication. No authorized session was available; authentication was not bypassed. |
| Production behavior and personal-data access controls | **NOT VERIFIED** | No Production database query, personal-record read, form submission, write RPC, permission change, environment change, or Production deployment was performed. |

### Current security posture and unresolved items

- The Phase 07 PII-safe notification logging and database-session-creation checks remain **implemented and locally verified**. Their Production runtime behavior and actual email delivery remain **NOT VERIFIED**.
- Earlier production dependency audit evidence remains: 3 low and 5 moderate findings, 0 high and 0 critical, in the existing Resend dependency chain. A disposable Resend 6.37.0 resolution/audit exercise reported no production audit findings, but this was not an application compatibility test and no Resend upgrade was made.
- The Production `SUPABASE_SECRET_KEY` remains configured with Vercel `config` visibility and the `readable-secret` warning. This is a configuration-read access risk for authorized Vercel users, not evidence of public internet exposure or prior access. The owner's earlier decision to defer key rotation remains in force; do not change or rotate the key without a new explicit authorization.
- Production `ADMIN_PASSWORD_HASH` visibility remains a separate **NOT VERIFIED** least-privilege review item.
- Repository-confirmed anonymous INSERT grants on the three form tables, public execution of form SECURITY DEFINER RPCs, and possible direct access to `events.admin_notes` remain **source-confirmed / Production NOT VERIFIED**. They do not establish that existing personal records have been read or exposed.
- Effective Production grants, RLS, column privileges, RPC ACLs/owners/configuration, applied migrations, Storage configuration, public runtime payloads, admin runtime access boundaries, and actual notification delivery remain **NOT VERIFIED**.
- Existing authentication hardening limitations remain: one shared admin password, PBKDF2-SHA256 at 10,000 iterations, no 2FA, and per-instance login throttling. Public form rate limiting is also per-instance/in-memory; CAPTCHA/bot defense is absent. CSP is not configured.
- No evidence in the reviewed reports establishes a personal-data breach. Equally, the incomplete Production verification does not establish that no breach or unauthorized access has occurred.

### Pause boundary

No further security work is requested at this time. Do not continue the Production metadata investigation, change database grants/RLS/RPCs, alter Vercel environment variables, rotate/revoke Supabase keys, upgrade Resend, change authentication, or deploy security changes unless the owner explicitly reopens the work.

If the owner later resumes, the highest-priority verification remains a technically enforced read-only Supabase metadata review that does not access application records, followed by an authorized Preview QA session. Preserve DIDAR's manual submission/review model and all existing production recovery options.
