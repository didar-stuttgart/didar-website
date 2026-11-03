# CONTENT INVENTORY — CURRENT / HISTORICAL

This file is a content audit, not a runtime source of truth.

## 1. Current implementation

Public editorial content is split among:

- `lib/i18n.js`
- page JSX
- `cms_content`
- `events` database rows
- static assets in `public/images`

The site is not fully CMS-driven.

## 2. Current CMS scope

The public homepage currently reads a small set of CMS keys documented in [CMS_ARCHITECTURE.md](CMS_ARCHITECTURE.md).

Legal pages, About page body text, most navigation/system strings and many organization details remain code-managed.

## 3. Historical findings

The original 2026 content inventory proposed moving a much larger set of content into a CMS. Those recommendations are historical and should not be read as implemented functionality.

## 4. When changing public text

- inspect the current source;
- determine whether the text is i18n, CMS, database or hard-coded;
- preserve FA/DE behavior;
- for legal text, require owner/legal review;
- do not invent organization facts.

## 5. Route/content map

| Route/content | Current source |
|---|---|
| `/` homepage | `pages/index.js` + CMS keys + events |
| `/veranstaltungen` | `pages/veranstaltungen/index.js` + events |
| `/veranstaltungen/[slug]` | `pages/veranstaltungen/[slug].js` + event row |
| `/ueber-uns` | `pages/ueber-uns.js` + founder assets |
| `/mitglied-werden` | `pages/mitglied-werden.js` + i18n |
| `/kontakt` | `pages/kontakt.js` + i18n |
| `/impressum`, `/datenschutz` | hard-coded page JSX |
| Admin content | `cms_content` through `pages/admin/content.js` + `pages/api/admin/content/cms.js` |
| Admin settings | `organization_settings` through `pages/admin/settings.js` + `pages/api/admin/settings/organization.js`; not consumed publicly |

Founders are `Avid / Avid.jpg` and `Danial / Danial.jpg`; their section remains below the main About text. Use [ARCHITECTURE.md](ARCHITECTURE.md) for the full route/API map and [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for editable content boundaries.
