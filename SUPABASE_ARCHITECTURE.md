# SUPABASE ARCHITECTURE

This file is a concise architecture companion. The detailed schema and migration source of truth is [DATABASE.md](DATABASE.md).

## 1. Access model

### Public/server client

Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Used for public reads and calling the public SECURITY DEFINER RPCs.

### Admin client

Uses `SUPABASE_SECRET_KEY`.

Used only on the server after application-level admin session validation.

### Browser export

`supabase` is exported from `lib/supabase.js`, but the application does not use it for admin data.

## 2. Public writes

Current form endpoints call:

- `insert_event_registration_manual`
- `insert_membership_application_manual`
- `insert_contact_submission_manual`

Cancellation uses:

- `cancel_event_registration_manual`

The repository still contains direct anon INSERT grants on form tables. That is a hardening opportunity, not the intended application write path.

## 3. Admin authentication

Current flow:

1. password checked against `ADMIN_PASSWORD_HASH`;
2. random session token created;
3. SHA-256 token hash stored in `admin_sessions`;
4. HttpOnly cookie issued;
5. every admin API checks the DB-backed session;
6. successful admin request uses `SUPABASE_SECRET_KEY`.

There is no `admins` table and no JWT session architecture.

## 4. Event image Storage

The admin uploader uses the admin Supabase client and expects a public-read bucket named `event-images`.

Migration 014 sets:

- public = true;
- 5 MB limit;
- JPEG/PNG/WebP allowlist;
- no anon/authenticated upload policy.

Whether migration 014 is applied in Production is **NOT VERIFIED**.

## 5. Registration cancellation

Migration 012 stores only the SHA-256 hash of the emailed cancellation token.

Migration 013 allows re-registration after cancellation by replacing the table-wide unique constraint with a partial unique index.

See [DATABASE.md](DATABASE.md) and [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md).

## 6. Historical design warning

Older versions of this document described direct table INSERTs, future-phase admin auth and admin-manually-sent confirmation emails. Those descriptions are historical and must not be used as the current implementation reference.

For current behavior use the canonical root documents.

## 7. RLS and grant boundary

The access model is intentionally split:

- public published-event/CMS reads use the publishable Supabase client;
- public form submissions use narrow SECURITY DEFINER RPCs;
- personal-data tables are not publicly readable;
- admin APIs validate the application session before using `SUPABASE_SECRET_KEY`;
- `admin_sessions` is server-only.

The repository still grants direct `anon` INSERT on the three form tables. That is a known hardening opportunity because it can bypass API-level validation/rate limiting. Do not change grants as part of unrelated work.

## 8. Schema-dependent operational checks

- Migration 012: verify the eight-argument `insert_event_registration_manual` function.
- Migration 013: verify `event_registrations_active_email_unique`.
- Migration 014: verify the `event-images` bucket, public-read flag, 5 MB limit and JPEG/PNG/WebP allowlist.

Repository SQL describes intended state. It does not prove live Production state.
