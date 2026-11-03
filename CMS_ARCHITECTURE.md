# CMS ARCHITECTURE — CURRENT STATUS + HISTORICAL DESIGN

This document distinguishes implemented behavior from the original CMS proposal.

## 1. Current implementation

The repository contains:

- `cms_content` table
- `organization_settings` table
- `/admin/content`
- `/admin/settings`
- `lib/cms-client.js`

Only a small set of CMS keys currently affect the public site. The public homepage currently reads:

- `homepage.hero.title`
- `homepage.hero.subtitle`
- `homepage.about.description`

Not every visible page is CMS-driven.

## 2. Current content model

Most site text remains code-managed in:

- `lib/i18n.js`
- public page JSX
- legal page JSX

Event data is stored in the `events` table.

`organization_settings` is editable in the admin UI, but current public pages do not consume these values.

## 3. Historical proposal

The older body of this file described a much larger CMS migration covering legal pages, footer data, contact information, About content and organization configuration.

That design is **proposed/historical, not implemented**. Do not assume those fields, pages or workflows exist in Production.

## 4. Current admin workflow

`/admin/content` edits rows in `cms_content` and saves immediately.

There is no general draft/publish/versioning system for CMS content.

## 5. Known mismatch

The repository still documents a CMS key mismatch between a seeded About key and the key read by the homepage. Production state of the exact CMS rows is **NOT VERIFIED**.

## 6. Source of truth

For current behavior use:

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DATABASE.md](DATABASE.md)
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
- the actual files under `pages/`, `lib/` and `data/`
