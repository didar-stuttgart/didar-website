# DEPLOYMENT

Deployment, environment variables, migration ordering and verification.

## 1. Current deployment model

- Hosting: Vercel.
- Repository: `didar-Stuttgart/didar-website`.
- Default branch: `main`.
- Standard production workflow: changes merged to `main` are deployed by the connected Vercel project.
- There is no repository-defined staging Supabase environment.

### Current Production evidence

As of the documentation audit:

- Vercel project: `didar-website`
- Production deployment: `dpl_9H4DxWc3hT44yfK5giN2g5DhvGaJ`
- source branch: `feature/event-upload-custom-slugs`
- source commit: `0b1379e471c9a9a03053bcacc5ceae58250ec91e`
- state: READY
- aliases include `www.didar-stuttgart.com`

This is **not the same commit as `main`**. The latest production deployment includes the event mutation revalidation helper that is not yet in `main`.

## 2. Environment variables

Never document actual values.

Required names:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `ADMIN_PASSWORD_HASH`
- `RESEND_API_KEY` for email
- `DIDAR_NOTIFICATION_EMAIL` for admin email
- `DIDAR_EMAIL_FROM`
- optional `NEXT_PUBLIC_APP_URL`
- optional `RATE_LIMIT_REQUESTS`
- optional `RATE_LIMIT_WINDOW_MS`

After changing Vercel environment variables, redeploy.

## 3. Local checks

```bash
npm install
cp .env.example .env.local
npm run lint
npm run build
npm run start
```

The build requires working Supabase variables because pages are generated against the database.

There is no runnable automated Jest suite configured in `package.json`.

## 4. Migration ordering

Code that depends on a migration must not be deployed before the migration is applied in the target database.

The repository contains migrations 001–014. Migration 012 is especially important because it changes the registration RPC signature.

### Migration 013

Purpose: allow re-registration after cancellation.

Production status: **NOT VERIFIED** in this documentation task.

### Migration 014

Purpose: configure the `event-images` Storage bucket.

Expected bucket configuration:

- name/id `event-images`
- public reads
- 5 MB file limit
- JPEG/PNG/WebP allowlist
- no anon/authenticated upload policy

Production status: **NOT VERIFIED**.

The upload endpoint itself checks the bucket at runtime and returns 503 if it is missing or not public.

## 5. Normal deployment procedure

1. Review source and current Git status.
2. Run the relevant lint/build checks.
3. Apply any required DB/Storage migration before deploying dependent code.
4. Commit and push/merge the intended branch.
5. Wait for Vercel READY state.
6. Run post-deploy checks.

## 6. Post-deploy verification

Minimum checks:

1. `GET /api/health`.
2. Home page FA/DE.
3. Events list and a published event detail page.
4. Admin login and a protected admin API.
5. One controlled form submission if the change touches forms.
6. Resend delivery evidence for email changes.
7. Vercel runtime logs for errors.

For UI changes, source inspection is insufficient; verify the rendered page.

HTTP 201 from a form endpoint is not proof that an email reached an inbox.

## 7. Event image rollout

Before using the admin uploader against Production:

1. Verify whether `event-images` exists in the Production Supabase project.
2. If missing, review/apply `data/migration_014_event_image_storage.sql`.
3. Verify public-read, size and MIME settings.
4. Do not add public upload/update/delete policies.
5. Upload an image with an authenticated admin session and confirm the resulting `events.image_url`.

This documentation task does not claim the bucket is live.

## 8. Rollback

Code rollback should prefer a Vercel rollback or `git revert`.

Database changes have no automatic down-migration in this repository. Migration 012 is not backward-compatible with pre-012 registration code without restoring the older RPC deliberately.

## 9. Current verification limits

- Production deployment state is verified through the Vercel integration.
- Live rendered HTTP verification was not completed in the previous investigation because direct fetches returned cache-miss errors.
- Migration 013/014 application to Supabase Production remains NOT VERIFIED.

## 10. Migration application procedure

This repository has no migration runner; SQL files in `data/` are applied manually in Supabase.

For a dependent code change:

1. Read the migration and confirm its ordering assumptions.
2. Confirm access to the intended Supabase project.
3. Verify a current backup exists according to the project's actual Supabase plan.
4. Apply the migration in the Supabase SQL editor.
5. Run a targeted verification query for the new column/function/index/bucket.
6. Only then deploy dependent application code.
7. Record the migration and verification result in project documentation.

For migration 012, verify that the live registration RPC accepts the ⟦BT`cancellation_token_hash_param⟦BT` eighth argument before deploying code that sends it.

For migration 013, verify the partial unique index ⟦BT`event_registrations_active_email_unique⟦BT`.

For migration 014, verify the ⟦BT`event-images⟦BT` bucket is public-read, capped at 5 MB and limited to JPEG/PNG/WebP. Do not create public upload/update/delete policies.

## 11. Troubleshooting

| Symptom | Checks |
|---|---|
| All forms fail with 500 | Supabase URL/publishable key, Vercel function logs, current RPCs |
| Registration fails after a deploy | migration 012 signature, duplicate constraint, form logs |
| Re-registration after cancellation still gives 409 | migration 013 is likely missing from the target DB |
| Admin login fails | ⟦BT`ADMIN_PASSWORD_HASH⟦BT`, ⟦BT`SUPABASE_SECRET_KEY⟦BT`, ⟦BT`admin_sessions⟦BT`, login throttle/cookie |
| Admin API returns Unauthorized | session cookie expiry or DB session validation failure |
| Event image upload returns 503 | bucket existence/public flag/Storage upload result |
| Public event data is stale | ISR cache; confirm Production includes event-mutation revalidation when applicable |
| Email is missing | Resend logs, function logs, sender/domain configuration; HTTP 201 is not delivery evidence |

Never put credentials, tokens, raw environment values or exported personal data into troubleshooting output or documentation.

## 12. Recovery and rollback

- **Application code:** prefer Vercel rollback/redeploy of a known-good deployment or a normal ⟦BT`git revert⟦BT`. Do not rewrite shared history.
- **Database:** migrations have no general automatic down-migration. A code rollback across migration 012 requires deliberate compatibility work because migration 012 replaces the previous registration RPC signature.
- **Storage:** do not remove the ⟦BT`event-images⟦BT` bucket or its data merely to roll back application code. First determine whether Production actually depends on it.
- **Secrets:** rotate compromised credentials at the provider, update Vercel environment variables, redeploy, and invalidate affected sessions where applicable.

No rollback should be assumed safe without checking the migration's actual effects and the current live state.

## 13. Routine maintenance

Useful recurring checks:

- review Resend delivery/error status when forms are active;
- review Vercel function logs for repeated auth/form failures;
- review Supabase backups and restore posture according to the actual plan;
- remove stale ⟦BT`admin_sessions⟦BT` rows if operationally needed;
- keep CSV exports outside Git and uncontrolled shared folders because they contain personal data;
- review dependency updates with a local build before Production.
