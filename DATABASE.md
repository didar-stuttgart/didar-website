# DATABASE

Supabase/PostgreSQL data model as implemented by the repository. SQL files describe intended schema; Production schema/storage must be verified separately.

## 1. Build order

For a new database, start with `data/schema.sql`, then apply migrations in order:

1. `migration_001_registration_verification.sql`
2. `migration_002_admin_sessions_rls.sql`
3. `migration_003_supabase_explicit_grants.sql`
4. `migration_004_cms_foundation.sql`
5. `migration_005_manual_registration_rpc.sql`
6. `migration_006_fix_rpc_error_propagation.sql`
7. `migration_007_membership_application_rpc.sql`
8. `migration_008_contact_submission_rpc.sql`
9. `migration_009_service_role_grants.sql`
10. `migration_010_recurring_events.sql`
11. `migration_011_remaining_capacity.sql`
12. `migration_012_registration_self_cancellation.sql`
13. `migration_013_allow_reregistration_after_cancel.sql`
14. `migration_014_event_image_storage.sql`

Some older migrations are not safely re-runnable. Read each file before applying it.

## 2. Core tables

### `events`

Important columns:

`id`, timestamps, `title_fa`, `title_de`, `slug`, descriptions, `event_date`, `event_time`, `location_fa/de`, `capacity`, `remaining_capacity`, `registration_deadline`, `is_recurring`, `status`, `registration_status`, deprecated `registration_open`, `image_url`, `admin_notes`.

`status` is `draft | published | archived`.

`registration_status` is `not_open | open | closed`.

Capacity and registration deadlines are informational/manual. The application does not automatically enforce capacity or close at the deadline.

### `event_registrations`

Stores submission data plus status, admin notes and cancellation token hash.

Current active-registration uniqueness is defined by migration 013:

```sql
CREATE UNIQUE INDEX event_registrations_active_email_unique
ON public.event_registrations (event_id, email)
WHERE status IS DISTINCT FROM 'cancelled';
```

Effect:

- at most one non-cancelled registration per event/email;
- a cancelled row remains as history;
- after cancellation the same email may register again, creating a new row and new cancellation token;
- multiple cancelled historical rows are allowed;
- reactivating a cancelled row while another active row exists causes the partial unique index to reject the update.

Whether the partial index is present in Production is **NOT VERIFIED** by repository inspection alone.

### `membership_applications`

Unique by email; statuses are `new | contacted | accepted | declined`.

### `contact_submissions`

Stores name, email, message and timestamp. No public read access.

### `admin_sessions`

Stores hashed admin session tokens, timestamps, expiry and user id. Public roles have no access.

### `cms_content`

Public-readable enabled CMS rows; only a small set of keys currently affect the public homepage. See [CMS_ARCHITECTURE.md](CMS_ARCHITECTURE.md).

### `organization_settings`

Editable admin settings table. Current public pages do not read these values.

## 3. RPC functions

All public write RPCs are SECURITY DEFINER with `search_path = public`.

- `insert_event_registration_manual(..., cancellation_token_hash_param)`
- `insert_membership_application_manual(...)`
- `insert_contact_submission_manual(...)`
- `cancel_event_registration_manual(token_hash_param)`

The registration insert RPC uses the 8-argument signature introduced by migration 012.

## 4. Migration 012: self-cancellation

Adds cancellation hash/timestamp fields, allows `cancelled` status, replaces the registration RPC with the 8-argument form, and adds the cancellation RPC.

Only the SHA-256 hash of the random cancellation token is stored.

## 5. Migration 013: re-registration after cancellation

Migration 013 drops the table-wide `UNIQUE(event_id,email)` constraint and replaces it with the partial unique index described above.

No application code change was required to insert a new registration after cancellation. The API continues to surface unique violations as HTTP 409.

**Production status: NOT VERIFIED.** The migration file exists in Git; that alone does not prove the index is present in Supabase Production.

## 6. Migration 014: event-image Storage

Migration 014 configures a Storage bucket:

- id/name: `event-images`
- public reads: enabled
- file size limit: 5 MB
- MIME allowlist: JPEG, PNG, WebP
- no public upload/update/delete policy is created

The upload endpoint uses `createAdminClient()` and therefore the server-side secret key.

**Production status: NOT VERIFIED.** The migration file exists in Git; the Production bucket must be confirmed in Supabase.

## 7. Permissions

The repository SQL currently defines:

- `events`: table-level SELECT for `public` and `authenticated`, with RLS restricting rows to published events; the policy does not restrict columns, so `admin_notes` remains requestable through direct table access unless a separate column/view restriction exists in the live database;
- personal-data tables: direct `anon` INSERT grants and SECURITY DEFINER RPCs, with RLS policies blocking public SELECT/UPDATE/DELETE;
- admin APIs: server-only secret-key access after application session validation;
- `admin_sessions`: no grants to public/anon/authenticated; server-side service-role access.

The direct form-table INSERT grants are broader than the application path requires and may allow caller-supplied administrative fields at insertion time. Public RPC execution also bypasses Next.js validation and API rate limiting unless SQL independently enforces the relevant rules. These are source-level findings only; Production ACL/RLS/function state is **NOT VERIFIED**. See [SECURITY.md](SECURITY.md).

## 8. Production verification boundary

Repository SQL is not proof of live Supabase state. Before depending on a migration, verify the relevant table, function, index or bucket in Production.

In particular, migrations 013 and 014 are **NOT VERIFIED** as applied to Production in this documentation task.

## 9. Safe schema changes

1. Add a numbered migration.
2. Update `schema.sql` where appropriate.
3. Apply the migration before deploying dependent code.
4. Verify the resulting schema/RPC signature.
5. Update this document and [DEPLOYMENT.md](DEPLOYMENT.md).

## 10. Detailed table/reference notes

### events

Important behavior-bearing columns:

- `status`: `draft | published | archived`.
- `registration_status`: `not_open | open | closed`.
- `registration_open`: deprecated compatibility column; the current application uses `registration_status`.
- `capacity`: positive integer or NULL; not enforced.
- `remaining_capacity`: non-negative integer or NULL; manually edited and displayed.
- `registration_deadline`: stored but not enforced.
- `is_recurring`: affects categorisation together with `event_date`.
- `image_url`: saved public image URL/path.
- `admin_notes`: admin-only field; homepage strips it before embedding event data.

### event_registrations

Columns include `event_id`, names, `email`, `phone`, `telegram_id`, `comment`, `status`, `admin_notes`, `cancellation_token_hash` and `cancelled_at`. The event foreign key uses `ON DELETE CASCADE`.

Migration 001 also left legacy verification columns/status values in the schema. They are not part of the current public workflow.

### membership_applications

`id`, timestamps, `first_name`, `last_name`, `email`, `phone`, `telegram_id`, `additional_info`, `status`, `admin_notes`. Email is unique.

### contact_submissions

`id`, `created_at`, `name`, `email`, `message`, `read`. There is no public read path. The admin UI can list/delete rows.

## 11. RPC signatures and privilege model

Current public write functions are SECURITY DEFINER with `search_path = public`:

- `insert_event_registration_manual(event_id_param, first_name_param, last_name_param, email_param, phone_param, telegram_id_param, comment_param, cancellation_token_hash_param)` -> BIGINT id; EXECUTE granted to `anon`.
- `insert_membership_application_manual(first_name_param, last_name_param, email_param, phone_param, telegram_id_param, additional_info_param)` -> BIGINT id; EXECUTE granted to `anon`.
- `insert_contact_submission_manual(name_param, email_param, message_param)` -> BIGINT id; EXECUTE granted to `anon`.
- `cancel_event_registration_manual(token_hash_param)` -> outcome row; EXECUTE granted to `anon`.

Migration 012 replaces the earlier seven-argument event-registration function. Code using the cancellation-token field requires the eight-argument version.

## 12. Grants/RLS boundary

The repository SQL intentionally gives `anon` direct INSERT capability on the three public form tables while blocking public SELECT/UPDATE/DELETE with grants/RLS. The application uses the SECURITY DEFINER RPCs rather than direct inserts.

This is a known hardening opportunity: revoking direct `anon INSERT while retaining the RPC EXECUTE grants would narrow the database surface. Do not change it as part of ordinary feature work.

`admin_sessions` has no public grants; the server uses `SUPABASE_SECRET_KEY`.

## 13. Schema drift and production verification

Repository schema is not proof of live schema. The repository historically contains columns/configuration that were added directly in Production before being represented in `schema.sql`. Before relying on a migration-dependent field/function/index/bucket, verify it in the target Supabase project.

For migration 013, verify:

``sql
select indexname, indexdef
from pg_indexes
where tablename = 'event_registrations'
  and indexname = 'event_registrations_active_email_unique';
``

For migration 014, verify the Storage bucket and its public/size/MIME settings in the target Supabase project. The migration file alone is not evidence of live state.

## 14. Troubleshooting

| Symptom | First check |
|---|---|
| Registration 500 after deployment | migration 012 RPC signature and `SUPABASE/Resend` environment configuration |
| Registration 409 duplicate | active row already exists for the same event/email; a cancelled row alone should not block after migration 013 |
| Re-registration still blocked after cancellation | migration 013 index may not be applied in Production |
| Upload returns 503 | `event-images` bucket missing/not public or Storage upload failure |
| Admin API returns 401 | `session_token`, `admin_sessions` and `SUPABASE_SECRET_KEY` |
| Form returns 429 | per-instance rate limiter has reached its configured threshold |

Backups, retention and deletion policies are not defined by this repository; record Production/Supabase evidence before making operational claims.

## 11A. Database-dependent application touchpoints

| Behavior | Source |
|---|---|
| Event registration insert | `pages/api/registrations/submit.js` |
| Self-cancellation | `pages/api/registrations/cancel.js` |
| Membership insert | `pages/api/memberships/submit.js` |
| Contact insert | `pages/api/contact/submit.js` |
| Admin session store | `lib/session-store-db.js`, `admin_sessions` |
| Admin event CRUD | `pages/api/admin/events/index.js`, `pages/api/admin/events/[slug].js` |
| Event image Storage | `pages/api/admin/events/upload-image.js`, migration 014 |
| CMS content | `pages/api/admin/content/cms.js`, `cms_content` |
| Organization settings | `pages/api/admin/settings/organization.js`, `organization_settings` |

When a schema change affects one of these paths, inspect both the application source and the numbered migration before deployment.


## 15. Security review notes — 2026-11-03

This section records repository-level facts only. It does not assert that the same grants or policies are active in Supabase Production.

### Direct form-table INSERT

Migration 003 grants table-level `INSERT` to `anon` on:

- `event_registrations`
- `membership_applications`
- `contact_submissions`

The RLS INSERT policies in `schema.sql` use `WITH CHECK (true)`. Because the grant is table-level, it is not limited to the fields shown in the public forms. If active in Production, callers may be able to set writable administrative fields while creating a row. This is not permission to read or update existing rows.

### Public RPCs

The current repository grants `anon` EXECUTE on the public form SECURITY DEFINER functions:

- `insert_event_registration_manual`
- `insert_membership_application_manual`
- `insert_contact_submission_manual`

The functions do not independently implement every validation/business rule enforced by the Next.js APIs. Direct invocation may therefore bypass application validation and API rate limiting if the grants are active. The cancellation RPC is a distinct token-based operation and must be evaluated separately.

### Published event column access

Migration 003 grants table-level SELECT on `events` to `public` and `authenticated`. RLS limits rows to published events but does not restrict columns. Since `events.admin_notes` is an administrative column, the repository's grant/policy combination does not itself prevent a direct query from requesting it. Homepage response filtering is not a substitute for database-level column protection.

### Production verification status

The live Supabase grants, column privileges, RLS policies, RPC ACLs/definitions/owners and migration history are **NOT VERIFIED**. Verify them using catalog-only SELECT queries. Do not test by inserting rows, invoking write RPCs, or reading personal-data records in Production.
