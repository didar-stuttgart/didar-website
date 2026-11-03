# Architecture Pointer

Read [../../ARCHITECTURE.md](../../ARCHITECTURE.md) for the current architecture, routes, rendering, authentication and API boundaries.

Key facts:

- Next.js Pages Router.
- Persian default locale; German `/de`.
- DB-backed admin sessions.
- Public form RPCs.
- Admin APIs use `SUPABASE_SECRET_KEY`.
- Event images resolve through `lib/event-image.js`.
- Current Production contains event-mutation ISR revalidation.
