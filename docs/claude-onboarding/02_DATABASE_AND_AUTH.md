# Database and Authentication Pointer

Read [../../DATABASE.md](../../DATABASE.md) and [../../SECURITY.md](../../SECURITY.md).

Current admin authentication:

- `ADMIN_PASSWORD_HASH`
- PBKDF2-SHA256
- `admin_sessions`
- SHA-256 session-token hashes
- HttpOnly `session_token` cookie

There is no `admins` table and no JWT session store.

Important recent migrations:

- 012: cancellation token + cancellation RPC
- 013: re-registration after cancellation
- 014: event-image Storage bucket configuration

Production application of 013/014 is NOT VERIFIED.

## Migration-specific checks

Before modifying registration code:

- confirm migration 012's eight-argument RPC exists in the target database;
- confirm migration 013's partial unique index if re-registration behavior matters;
- never infer Production migration state from Git alone.

Before modifying admin auth:

- inspect `lib/admin-auth.js` for password/session behavior;
- inspect `lib/session-store-db.js` for DB session behavior;
- keep `SUPABASE_SECRET_KEY` server-only.
