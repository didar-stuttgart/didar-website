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

## 5. Current consumer keys and mismatch

The implemented homepage consumer is `pages/index.js` via `lib/cms-client.js` and reads:

- `homepage.hero.title` — FA and DE.
- `homepage.hero.subtitle` — FA from CMS; German uses i18n.
- `homepage.about.description` — FA and DE.

Values beginning with `[` are treated as placeholders and fall back to i18n.

Migration 004 still seeds an older About key named `homepage.about_card.description`. The current homepage reads `homepage.about.description`. Therefore the seeded About-card row is not sufficient evidence that the public homepage is using the expected CMS value. Whether Production contains the exact current key/value rows is **NOT VERIFIED**.

The current CMS editor is `/admin/content` and saves through `/api/admin/content/cms`.

## 6. Source of truth

For current behavior use:

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DATABASE.md](DATABASE.md)
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
- the actual files under `pages/`, `lib/` and `data/`
