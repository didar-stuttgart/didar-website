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
