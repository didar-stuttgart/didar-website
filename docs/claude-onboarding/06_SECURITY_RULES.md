# Security Rules Pointer

Read [../../SECURITY.md](../../SECURITY.md) for the current security model.

Never:

- expose secrets;
- commit `.env.local`;
- weaken admin session checks;
- reintroduce verification/automatic confirmation;
- broaden public database access casually;
- bypass the manual-review registration workflow.

Open security topics include PBKDF2 cost, in-memory rate limits, direct anon INSERT grants, missing CSP, and privacy/logging review.

The homepage `admin_notes` exposure is fixed in source and included in the current Production deployment; live payload re-verification remains NOT VERIFIED.

## Current security boundaries

- `SUPABASE_SECRET_KEY` is server-only.
- Public form RPCs are narrow SECURITY DEFINER functions.
- Public personal-data reads are blocked.
- Admin sessions are stored as hashes in `admin_sessions`.
- Public-form rate limiting is per server instance.
- Direct `anon` INSERT grants on form tables remain a hardening opportunity.
- Missing Resend configuration can cause personal submission data to be logged by the admin-email helpers; do not expose those logs.
