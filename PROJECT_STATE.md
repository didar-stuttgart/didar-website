# PROJECT STATE

Evidence-based project snapshot as of 2026-11-03.

Status labels:

- **Verified** — direct evidence supports the statement.
- **Implemented, not runtime-verified** — source/deployment evidence exists, but the relevant live behavior was not exercised.
- **NOT VERIFIED** — requires Production/Supabase/Resend evidence.
- **Known issue** — intentionally documented and not changed.

## 1. Current system

Bilingual DIDAR site, Persian default / German `/de`, Next.js 15.5.28 Pages Router, Supabase, Resend, Vercel.

Registration is manual-review:

- save submission immediately;
- notify admin;
- event registrants receive an acknowledgment/receipt;
- admin contacts people manually;
- no automated confirmation of attendance;
- no automatic capacity enforcement.

## 2. Verified from repository/deployment evidence

| Area | Status |
|---|---|
| Repository default branch | Verified: `main` |
| Application source baseline before the documentation-only security update | `9ea770d147750a4ef5be00aefbe2e9549e27772a` |
| Current Production deployment | Verified: READY deployment `dpl_J8HS2NmhbCVyv8LzradmqpgGooZZ` |
| Current Production source | Verified: branch `main`, commit `9ea770d147750a4ef5be00aefbe2e9549e27772a` |
| Next.js version | Verified: `^15.5.28` in `package.json` |
| Custom event slug implementation | Verified in source |
| Event image upload implementation | Verified in source |
| Event image Storage migration file | Verified in repository |
| Event mutation revalidation helper | NOT PRESENT in current `main` / Production source snapshot |
| Registration self-cancellation flow | Verified in source |
| Partial unique index migration for re-registration | Verified in repository SQL |
| Homepage `admin_notes` stripping | Verified in source |

## 3. Current Production/source relationship

The current READY Production deployment uses branch `main` at commit `9ea770d147750a4ef5be00aefbe2e9549e27772a`, matching the current GitHub default-branch HEAD at the time of this snapshot.

The file `lib/revalidate-event-pages.js` is not present in this `main` snapshot, and the current admin event API files do not import a revalidation helper. Do not describe event-mutation ISR revalidation as implemented in the current Production source without new evidence.

## 4. NOT VERIFIED

- migration 013 is applied to Supabase Production;
- migration 014 is applied to Supabase Production;
- `event-images` bucket exists and is correctly configured in Production;
- current inbox delivery for a fresh email test;
- current rendered HTTP payload for homepage/event detail after the latest deployment;
- live behavior of the known event auto-open issue;
- exact Vercel log retention;
- current Supabase backup retention/restore posture.

## 5. Known issues — do not change casually

1. Event detail may auto-open `registration_status='not_open'`.
2. Closed-registration 409 is surfaced as the duplicate-registration message.
3. Capacity-status counts legacy `verified` rows and is therefore ineffective for the current manual model.
4. Recurring events without a date are classified as upcoming.
5. `registration_deadline` is stored but unused.
6. Registration CSV event column reads `reg.event` and is empty.
7. `/api/admin/fix-event-status` is a hard-coded legacy admin endpoint.
8. Direct anon INSERT grants remain in repository SQL; public form RPCs are also executable by `anon`.
9. The `events` table grant/RLS combination is row-restricted but not column-restricted; `admin_notes` is not excluded from direct table reads by the policy.
10. PBKDF2 remains at 10,000 iterations.
11. No global login throttle or CAPTCHA.
12. No CSP.
13. Event mutation revalidation helper is absent from current `main` / Production source snapshot.
14. Some legacy/dead code remains.

## 6. Owner decisions pending

- password-hash migration strategy;
- verify Production database grants/RLS/RPC ACLs read-only, then decide whether to revoke direct anon INSERT and public RPC EXECUTE;
- prevent public direct reads of `events.admin_notes` without breaking public event reads;
- personal-data retention/deletion policy;
- privacy/legal review of current receipt email and processors;
- remove the hard-coded fix endpoint;
- remove legacy/dead code;
- decide how `organization_settings` should drive public content;
- resolve the remaining CMS key mismatch documented in [CMS_ARCHITECTURE.md](CMS_ARCHITECTURE.md).

## 7. Canonical documentation

Authoritative:

- [README.md](README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DATABASE.md](DATABASE.md)
- [FORMS.md](FORMS.md)
- [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md)
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [SECURITY.md](SECURITY.md)
- this file

Supplementary files intentionally point back to this set instead of maintaining independent architectural claims.


## 8. Security investigation snapshot — 2026-11-03

Repository findings (source-confirmed; live Supabase status **NOT VERIFIED**):

| ID | Finding | Source status | Production status |
|---|---|---|---|
| DIDAR-SEC-01 | Direct anonymous INSERT on three public form tables | Confirmed | NOT VERIFIED |
| DIDAR-SEC-02 | Anonymous EXECUTE on public form SECURITY DEFINER RPCs | Confirmed | NOT VERIFIED |
| DIDAR-SEC-03 | Table-level public SELECT may include `events.admin_notes` for published rows | Confirmed | NOT VERIFIED |
| DIDAR-SEC-04 | Public API rate limiting is per-instance/in-memory | Confirmed | Source behavior confirmed |
| DIDAR-SEC-05 | SECURITY DEFINER search_path/owner hardening | Configuration confirmed; exploitability not established | NOT VERIFIED |
| DIDAR-SEC-06 | Cancellation RPC is public but requires a high-entropy bearer token | Design review item | NOT VERIFIED |

The current Production deployment was independently read as READY and is tied to application commit `9ea770d147750a4ef5be00aefbe2e9549e27772a`. The subsequent GitHub commits in this review changed documentation only; no application code was changed. This does not prove the state of Supabase grants, RLS, function ACLs, function owners or applied migrations.

No Production database writes, public write-RPC calls, personal-record reads, code changes or deployments were performed as part of this investigation. The next step is a read-only Supabase catalog/metadata review; see [SECURITY.md](SECURITY.md).

## 9. Supabase Production verification boundary — 2026-11-03

An authenticated Chrome Dashboard session identified the DIDAR Production project (`pvvjkypwsbcjiqogrmta`). The SQL Editor interface was visible, but it did not enforce a read-only database role or read-only transaction/session. No SQL was entered or executed. This was a deliberate stop because the execution interface also permits unrestricted statements.

Effective Production grants, RLS, column privileges, RPC ACLs/owners/configuration, migration history, indexes and Storage metadata remain **NOT VERIFIED**. A future review requires a separately authorized, technically enforced read-only database identity/session; no credentials, connection details or application records should be accessed as a workaround.

No Production database, application code, GitHub application source or deployment changes were made during this review. This documentation update does not change the application deployment baseline.


## 10. Personal-data protection investigation — 2026-11-03

Investigation 03 reviewed the deployed application source baseline and Vercel Production configuration metadata. No user records, runtime logs, credentials, Production SQL, form submissions or write RPCs were accessed. Effective Supabase Production grants/RLS/function ACLs remain **BLOCKED / NOT VERIFIED** because an enforced read-only database identity/session was unavailable.

Key results:

- **FAIL — Vercel configuration access risk:** `SUPABASE_SECRET_KEY` is configured as a readable Production configuration value (`readable-secret`). This is not evidence of public internet exposure, but Vercel members with configuration-read access may obtain a key that bypasses RLS. Remediation proposed: make it a non-readable Secret, review configuration access, and rotate if prior access cannot be ruled out.
- **FAIL — source-level potential exposure:** `events` has public table-level SELECT without a source-level column restriction for `admin_notes`. Frontend filtering does not prevent direct PostgREST column reads. Live applicability remains BLOCKED.
- **FAIL — source-level write-boundary risks:** `anon` has direct INSERT grants on the three form tables and EXECUTE grants on public form RPCs. If active, these can bypass API validation/rate limiting; direct table INSERT may permit caller-supplied writable administrative fields on new rows. This does not establish anonymous reads of existing user records.
- **FAIL — conditional PII logging:** the email fallback path logs complete submission payloads when notification configuration is unavailable. Production runtime invocation/log contents were not inspected.
- **PASS — source-level admin API gate:** reviewed admin routes validate the database-backed admin session before creating the admin client. This is not a runtime verification.

The repository SQL intends to deny public reads/updates/deletes on registration, membership and contact tables, and public access to admin sessions. Effective Production grants, RLS, column privileges, function ACLs, views, Storage metadata and browser payloads remain **NOT VERIFIED**.

Proposed remediation order: (1) protect the Supabase secret in Vercel and review configuration access; (2) prevent direct public reads of `events.admin_notes`; (3) remove unnecessary direct anonymous table INSERT after Preview validation; (4) restrict public RPC execution after moving calls behind validated server APIs; (5) remove PII from fallback logs. No remediation was implemented.

All changes must preserve manual submission/review behavior and the rule that notification email failure does not roll back a saved submission. Production verification must use an enforced read-only metadata identity/session, not the unrestricted SQL Editor. See [SECURITY.md](SECURITY.md), section 14, for evidence and verification boundaries.

This was a documentation-only update. No application code, database permissions, Vercel configuration or deployment was changed.
