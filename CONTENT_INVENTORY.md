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

Use [ARCHITECTURE.md](ARCHITECTURE.md) for the current route map and [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for what the admin can actually edit.

## Current implementation inventory

This file is an inventory, not a roadmap. The current source-of-truth for each content class is:

| Content class | Current source |
|---|---|
| Navigation/UI labels | `lib/i18n.js` and admin i18n |
| Homepage hero/about editable subset | `cms_content` via `lib/cms-client.js` |
| Events | Supabase `events` table |
| Event images | `events.image_url` or deterministic fallback images |
| About page narrative | `pages/ueber-uns.js` |
| Founders | `pages/ueber-uns.js` with `public/images/Avid.jpg` and `public/images/Danial.jpg` |
| Membership/contact copy | page source + `lib/i18n.js` |
| Impressum/Datenschutz | hard-coded page source; owner-approved facts only |
| Organization settings | `organization_settings`, but current public pages do not consume these values |
| Repository images | `public/images` |

### Current CMS keys

Only the homepage keys listed in [CMS_ARCHITECTURE.md](CMS_ARCHITECTURE.md) are verified as public consumers in code. Other `cms_content` rows may be editable in the admin UI without changing a public page.

### Historical/proposed material

Older sections that recommend moving all legal/about/footer content into a CMS, adding content versioning, or expanding `organization_settings` are proposals, not current implementation. Keep them explicitly labeled historical if retained.
