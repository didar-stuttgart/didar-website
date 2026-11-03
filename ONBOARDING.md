# DIDAR Website — Onboarding

This is a concise onboarding guide. The nine canonical root documents are the technical source of truth.

## 1. First read

1. [README.md](README.md)
2. [ARCHITECTURE.md](ARCHITECTURE.md)
3. [PROJECT_STATE.md](PROJECT_STATE.md)
4. [DATABASE.md](DATABASE.md)
5. [DEPLOYMENT.md](DEPLOYMENT.md)

## 2. System

DIDAR is a bilingual Persian/German cultural organization website.

Current stack:

- Next.js 15.5.28 Pages Router
- React 18.3
- Supabase/PostgreSQL
- Vercel
- Resend REST API
- plain CSS

There is one admin account and no public user account system.

## 3. Registration model

Public submissions are stored immediately for manual admin review. There is no verification-token workflow, automatic approval, or automatic capacity enforcement.

Event registrants receive an acknowledgment/receipt and self-cancellation link.

## 4. Language routing

- Persian: default locale, no URL prefix.
- German: `/de`.
- Direction is set by `pages/_app.js`.
- Do not reintroduce query-param language routing.

## 5. Admin authentication

Login uses `ADMIN_PASSWORD_HASH`, creates a DB-backed session in `admin_sessions`, and sets an HttpOnly `session_token` cookie.

Do not resurrect the removed in-memory/JWT architecture from historical documents.

## 6. Events

Events support custom slugs and admin image uploads. Images resolve through `lib/event-image.js`.

The current Production deployment also revalidates public event paths after successful event create/update/archive mutations.

## 7. Safe work pattern

Before changing anything:

- inspect the actual implementation;
- inspect Git status/diff;
- make the smallest focused change;
- preserve manual registration;
- preserve FA/DE and RTL/LTR;
- verify UI changes in a browser;
- keep secrets out of code and documentation.

## 8. Practical first-task workflow

For a new developer or AI coding agent, use this sequence:

1. Read [PROJECT_STATE.md](PROJECT_STATE.md) for the current evidence and known issues.
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) for the request path you will touch.
3. Read the relevant source file before changing documentation or code.
4. If the change depends on Supabase, read the migration that introduced the behavior.
5. Make the smallest focused change and review the complete diff.
6. For UI work, render both Persian and German where the route supports both.
7. For public forms, verify the database write separately from email delivery.
8. Keep secrets and personal-data exports out of Git.

### Local smoke test

After environment setup:

```bash
npm install
npm run dev
```

Check `/`, `/de`, `/veranstaltungen`, a published event, `/kontakt`, `/mitglied-werden` and `/admin/login`. The health endpoint is `GET /api/health`.

### Where to work by task

- Event image/detail mismatch: `lib/event-image.js`, event pages, ISR/revalidation.
- Registration/cancellation/re-registration: registration APIs + migrations 012/013.
- Event uploads/slugs: admin event APIs + `lib/event-slug.js` + migration 014.
- Email: `lib/admin-email.js` and `lib/registration-receipt-email.js`.
- Admin auth: auth APIs + `lib/admin-auth.js` + `lib/session-store-db.js`.
- CMS: `cms_content` + `lib/cms-client.js` + admin content page/API.
- Legal pages: owner-approved facts only; legal interpretation must be evidence-based and never invented.
