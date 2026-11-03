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

## Practical source map

Use these source files directly:

- Routing/i18n: `next.config.js`, `pages/_app.js`, `lib/i18n.js`.
- Public forms: `pages/api/registrations/submit.js`, `pages/api/memberships/submit.js`, `pages/api/contact/submit.js`.
- Auth: `pages/api/auth/*.js` + `lib/admin-auth.js` + `lib/session-store-db.js`.
- Events: `pages/veranstaltungen/[slug].js`, `pages/api/admin/events/*.js`, `lib/event-slug.js`, `lib/event-image.js`.
- Database contract: `data/schema.sql` + relevant numbered migration.
- Production-only current revalidation: `lib/revalidate-event-pages.js` on the deployed feature commit.
