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

The intended repository model is:

- `events`: public SELECT of published rows;
- personal-data tables: public INSERT/RPC path but no public SELECT/UPDATE/DELETE;
- admin APIs: server-only secret-key access after application session validation;
- `admin_sessions`: service-role only.

A known hardening opportunity is revoking direct `anon` INSERT grants on the three form tables while keeping the RPCs. Do not change that casually; see [SECURITY.md](SECURITY.md).

## 8. Production verification boundary

Repository SQL is not proof of live Supabase state. Before depending on a migration, verify the relevant table, function, index or bucket in Production.

In particular, migrations 013 and 014 are **NOT VERIFIED** as applied to Production in this documentation task.

## 9. Safe schema changes

1. Add a numbered migration.
2. Update `schema.sql` where appropriate.
3. Apply the migration before deploying dependent code.
4. Verify the resulting schema/RPC signature.
5. Update this document and [DEPLOYMENT.md](DEPLOYMENT.md).
