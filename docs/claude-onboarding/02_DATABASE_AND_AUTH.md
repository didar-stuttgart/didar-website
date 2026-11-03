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
