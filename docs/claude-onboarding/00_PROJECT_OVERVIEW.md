# Project Overview

Read [../../README.md](../../README.md) and [../../PROJECT_STATE.md](../../PROJECT_STATE.md).

Current identity: DIDAR — Iranische Kulturgemeinschaft Stuttgart / انجمن فرهنگی هنری اشتوتگارت.

Current stack: Next.js 15.5.28 Pages Router, React 18.3, Supabase/PostgreSQL, Vercel, Resend REST API, plain CSS.

Language model: Persian default/RTL, German `/de`/LTR.

Registration: manual review. Event registrants receive an acknowledgment/receipt and self-cancellation link, not an automatic confirmation.

Authentication: `ADMIN_PASSWORD_HASH` + DB-backed `admin_sessions`; no JWT/admins-table architecture.

Events: custom slugs and admin image uploads are supported.

Current Production uses `feature/event-upload-custom-slugs` commit `0b1379e...`; `main` is `0c6cb98...`.

## First-task facts

- Persian is the default locale; German is `/de`.
- Admin authentication is a DB-backed session architecture, not JWT/admin-table auth.
- Public forms use SECURITY DEFINER RPCs and save before email notification.
- Event registration is manually reviewed; receipt email is not confirmation.
- Migration 013 permits re-registration after cancellation; Production application is NOT VERIFIED.
- Migration 014 defines the `event-images` bucket; Production application is NOT VERIFIED.
- Current Production has event-mutation ISR revalidation from the feature branch; current `main` does not.
