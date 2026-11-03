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

Known hardening opportunity:

- direct anon INSERT privileges still exist in repository SQL for the three public form tables even though the application uses RPCs;
- revoking those grants would narrow the public database surface, but this requires deliberate database testing and is not part of this documentation task.

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
