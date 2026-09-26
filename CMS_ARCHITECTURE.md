# Phase 2: CMS Architecture Design (Refined)

**Date:** 2026-09-26  
**Status:** Design Finalized — Ready for Phase 3 Implementation  
**Based On:** `CONTENT_INVENTORY.md` (Phase 1)

---

## Executive Summary

**Two-table architecture** with clear CMS boundary, finalized schema, and no-JSON admin editing:

1. **`cms_content`** — All user-facing editorial content (both languages, bilingual parity enforced)
2. **`organization_settings`** — Contact/infrastructure data with structured form editing (no JSON)

**Key principle:** Non-technical admins manage all visible website text from `/admin/content` in Persian and German. No code editing, no JSON, no schema surprises.

---

## 1. EXACT CMS BOUNDARY

### Rule: What Is CMS_CONTENT (Moves to Database)

**All visible recurring text that admins would reasonably want to update without code:**

#### User-Facing Editorial Content (ALWAYS CMS)
- Long-form content (about page story, legal/policy text)
- Marketing copy (homepage summaries, introductions)
- Organization information (contact details, manager names)
- Footer/branding text

#### Specific Items → CMS

| Item | Current Location | Type | Reason |
|------|------------------|------|--------|
| **Homepage hero title** | `index.js:85` hardcoded | text | User-facing, may change seasonally |
| **Homepage hero subtitle** | `index.js:88` hardcoded | text | User-facing, organization branding |
| **About card summary** | `i18n.js:57-58` (not editable) | text | Marketing copy, non-technical admin should control |
| **Membership card summary** | `i18n.js:60-61` (not editable) | text | Marketing copy, non-technical admin should control |
| **About page story (Persian)** | `ueber-uns.js:40-61` hardcoded | rich_text | ~1000 words, only editable via code currently |
| **About page story (German)** | `ueber-uns.js:64-66` hardcoded | text | ~200 words |
| **About mission text** | `i18n.js:112-113` (not editable) | text | Can be updated by admin |
| **Membership intro paragraph** | `mitglied-werden.js:154-157` hardcoded | textarea | User-facing, should be editable |
| **Membership response time SLA** | `i18n.js:122-123` (not editable) | text | SLA that changes; should be admin-editable |
| **Contact intro text** | `i18n.js:127-128` (not editable) | text | User-facing intro; should be editable |
| **Privacy policy (all 12 sections)** | `datenschutz.js:22-244` hardcoded | rich_text | 4000+ words, critical for compliance updates |
| **Impressum legal sections (11)** | `impressum.js:22-146` hardcoded | rich_text | 3000+ words, must be updateable without code |
| **Impressum manager names** | `impressum.js:41-42` hardcoded | structured (list) | Team changes should not require code deploy |
| **Footer tagline** | `footer.js:16-18` hardcoded | text | Branding, may change |
| **Email address** | `kontakt.js:218`, `footer.js:42`, `impressum.js:32`, etc. (5 places) | text | Centralized infrastructure; currently fragmented |
| **Phone number** | `impressum.js:33` hardcoded | text | Infrastructure |
| **Address** | `impressum.js:27-28` hardcoded | text | Infrastructure, bilingual |
| **Instagram URL** | `SocialIcons.js:10` hardcoded | text | Currently centralized (good), should move to admin |
| **Telegram URL** | `SocialIcons.js:11` hardcoded | text | Same |

**Total: ~22 CMS content items** (across 65+ rows when bilingual)

---

### Rule: What Stays in SYSTEM_I18N (Code-Managed)

**UI/system strings coupled to application logic. Non-technical admin has no reason to change these.**

#### Items Remaining in `i18n.js`

| Item | Location | Reason |
|------|----------|--------|
| **Form field labels** | `form.first_name`, `form.last_name`, etc. | Coupled to form validation; changing label requires understanding form logic |
| **Form placeholders** | Same | Part of form structure |
| **Form error messages** | `form.validation_*`, `form.error` | System/validation feedback; tied to backend rules |
| **Form success messages** | `form.success` | System feedback; tied to workflows |
| **Navigation items** | `nav.home`, `nav.events`, `nav.about` | Site structure; changing requires understanding routing |
| **Button action labels** | `common.submit`, `event.register`, `contact.send` | UI chrome, tightly coupled to workflows |
| **Status badges** | `events.registration_closed`, `events.coming_soon` | Reflect system state (event status) |
| **Page title (metadata)** | `home.page_title`, `about.title` | SEO metadata; can be CMS if needed, but low priority |
| **Aria/accessibility labels** | `nav.skip_to_content`, `nav.primary` | Part of HTML structure; not user-facing text |
| **Generic "learn more" / "back" labels** | `common.learn_more`, `common.back` | Generic UI chrome used across multiple pages |
| **Event metadata labels** | `event.date`, `event.location`, `event.language` | Labels for structured data fields, not user copy |
| **Admin UI text** | Login form, admin panel labels | Internal tool UI; not customer-facing |

**Total: ~120 items stay in i18n.js**

---

### Clear Rule (Non-Negotiable)

**CMS ← Any visible recurring text a non-technical admin would want to change**  
**i18n → Labels, validation messages, status text, UI chrome tightly coupled to code logic**

**When in doubt, ask:** "Would a non-technical admin reasonably want to change this without asking a developer?" If yes → CMS. If no → i18n.

---

## 2. FINALIZED CONTENT MODEL

### `cms_content` Table Schema (FINAL)

```sql
CREATE TABLE cms_content (
  -- Identification
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,              -- "homepage.hero.title"
  
  -- Metadata (for admin UI organization)
  page TEXT NOT NULL,                    -- "homepage", "about", "privacy_policy", etc.
  section TEXT NOT NULL,                 -- "hero", "story", "section_1", etc.
  item_type TEXT NOT NULL,               -- "title", "content", "description", etc.
  
  -- Content editing
  content_type TEXT NOT NULL 
    CHECK (content_type IN ('text', 'textarea', 'rich_text')),
  -- (no 'json' type; JSON goes to organization_settings with structured forms)
  
  -- Bilingual Content (REQUIRED, enforced in trigger/app logic)
  content_fa TEXT NOT NULL,              -- Persian
  content_de TEXT NOT NULL,              -- German
  
  -- Admin interface
  admin_label TEXT NOT NULL,             -- Human-readable label for admin panel
  admin_help TEXT,                       -- Admin tooltip/guidance
  
  -- Ordering (for repeatable sections like legal text)
  sort_order INT DEFAULT 0,              -- 0, 1, 2, ... for ordering sections
  
  -- Enable/disable without deleting
  is_enabled BOOLEAN DEFAULT TRUE,       -- Admin can disable old content without deleting
  
  -- Safety/audit
  is_locked BOOLEAN DEFAULT FALSE,       -- Prevents accidental edits on critical content
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Future (Phase 3+)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by TEXT,                       -- "admin@didar.de"
  updated_by TEXT                        -- "admin@didar.de"
);

CREATE UNIQUE INDEX idx_cms_key ON cms_content(key);
CREATE INDEX idx_cms_page_section ON cms_content(page, section);
CREATE INDEX idx_cms_enabled ON cms_content(is_enabled);
```

**Field Justification:**
- `key` — Unique, self-documenting, not an opaque ID
- `page`, `section`, `item_type` — Admin UI can filter/organize by these
- `content_type` — Determines which editor to show (text box, textarea, rich text)
- `content_fa`, `content_de` — Enforced bilingual; both required
- `admin_label` — Human-readable text in the admin UI (not the key)
- `admin_help` — Tooltip for admins ("This appears in the footer of every page")
- `sort_order` — Legal sections need ordering (1, 2, 3...); homepage items can be 0
- `is_enabled` — Soft delete; useful for testing/staging
- `is_locked` — Prevents accidental edits on sensitive content
- `updated_at` — Track when admin last changed it
- `created_by`, `updated_by` — Future audit trail

**Fields NOT included:**
- `version` — Too complex for Phase 2; add in Phase 3 if needed
- `content_json` — No JSON; use `organization_settings` instead

---

### `organization_settings` Table Schema (FINAL)

```sql
CREATE TABLE organization_settings (
  id BIGSERIAL PRIMARY KEY,
  
  key TEXT UNIQUE NOT NULL,              -- "contact_email", "manager_list", etc.
  
  -- For scalar/simple settings
  value_text TEXT,                       -- Email, phone, single URL
  value_text_fa TEXT,                    -- Persian (if bilingual)
  value_text_de TEXT,                    -- German (if bilingual)
  
  -- For structured data (managers, social links, etc.)
  -- Stored as JSON but edited via structured form in admin panel
  value_json JSONB,
  
  -- Admin metadata
  admin_label TEXT NOT NULL,             -- "Contact Email", "Manager List"
  admin_help TEXT,                       -- "Admin tooltip"
  is_bilingual BOOLEAN DEFAULT FALSE,    -- true if value_text_fa/de are used
  
  -- Safety
  is_locked BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_by TEXT
);

CREATE UNIQUE INDEX idx_settings_key ON organization_settings(key);
```

**Field Justification:**
- `key` — Unique identifier ("contact_email", "manager_list")
- `value_text`, `value_text_fa`, `value_text_de` — For simple strings (email, phone, address)
- `value_json` — For structured data, but admin edits via form (see section 3)
- `admin_label` — Human-readable name in admin UI
- `admin_help` — Guidance for non-technical admin
- `is_bilingual` — Indicates whether _fa/_de versions should be shown (email is not bilingual; address is)

---

## 3. ORGANIZATION SETTINGS — STRUCTURED EDITING (NO JSON)

### Rule: Non-Technical Admins Never Edit Raw JSON

**For each setting, the admin panel shows the appropriate form:**

#### A. Scalar Settings (Email, Phone, Address)

**Database:**
```
key: "contact_email"
value_text: "info@didar-stuttgart.com"
admin_label: "Email Address"
is_bilingual: false
```

**Admin UI:**
```
Email Address
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[info@didar-stuttgart.com          ]
```

**Address (bilingual):**
```
key: "contact_address"
value_text_fa: "[Persian address]"
value_text_de: "[German address]"
admin_label: "Address"
is_bilingual: true
```

**Admin UI:**
```
Address
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Persian:
[Pfaffenwaldring 5c, 70569 Stuttgart]

German:
[Pfaffenwaldring 5c, 70569 Stuttgart]
```

#### B. Repeatable Items (Managers, Social Links)

**NOT raw JSON editing.** Instead: Form with Add/Remove buttons.

**Example: Manager List**

**Database:**
```
key: "organization_managers"
value_json: [
  {
    "id": "mgr_1",
    "name": "Danial Haghgoo",
    "role": "Co-founder",
    "email": "danial@didar.de"
  },
  {
    "id": "mgr_2",
    "name": "Sayedali Yarahmadian",
    "role": "Co-founder",
    "email": "sayedali@didar.de"
  }
]
admin_label: "Team Members"
is_bilingual: false
```

**Admin UI (Actual Form, Not JSON Editor):**
```
Team Members
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Danial Haghgoo           ] Name
[Co-founder              ] Role
[danial@didar.de         ] Email
[Edit] [Delete]

[Sayedali Yarahmadian    ] Name
[Co-founder              ] Role
[sayedali@didar.de       ] Email
[Edit] [Delete]

[+ Add Manager]
```

**Implementation:** Use a reusable form component for list editing (add/remove/edit rows). Backend converts form data to JSON for storage.

**Example: Social Links**

**Database:**
```
key: "social_links"
value_json: {
  "instagram": "https://www.instagram.com/didar_stuttgart/",
  "telegram": "https://t.me/Didar_stuttgart"
}
```

**Admin UI:**
```
Social Media Links
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Instagram:
[https://www.instagram.com/didar_stuttga...]

Telegram:
[https://t.me/Didar_stuttgart               ]

[Save]
```

---

## 4. DRAFT VS. PUBLISH — SINGLE CLEAR WORKFLOW

### Chosen Workflow: **Immediate Publish with On-Demand Invalidation**

**NOT** "Save to draft, then publish" (too confusing for non-technical users).  
**NOT** "Immediate but wait 1 hour" (feels slow; they don't know if it worked).

### The Workflow

```
Admin Flow:
===========

1. Admin opens /admin/content
   └─ Sees "Contact Email: info@didar-stuttgart.com"

2. Admin edits field
   └─ Types "support@didar-stuttgart.com"

3. Admin clicks "Save"
   ├─ Backend: Validates and saves to cms_content table
   ├─ Backend: Triggers on-demand ISR via Next.js revalidate()
   └─ UI shows: "✓ Saved. Changes live now. (or in ~1 hour if auto-refresh)"

4. Admin refreshes /admin/content or navigates away
   └─ Sees the updated value

5. Admin checks the website (or tells a colleague to check)
   └─ Sees "support@didar-stuttgart.com" in footer (live within 30 seconds)

Frontend Flow:
==============

1. Build time (getStaticProps or ISR)
   └─ Fetches CMS: SELECT * FROM cms_content WHERE key IN (...)
   
2. During ISR revalidation (triggered by admin save)
   ├─ Re-fetches CMS
   ├─ Re-renders page
   └─ Updates cache (CDN + Next.js cache)

3. Next request to the page (within 30 seconds of revalidate call)
   └─ Serves updated HTML

4. If admin doesn't trigger revalidate
   ├─ ISR falls back to automatic refresh at interval (default: 1 hour)
   └─ Changes appear eventually (within 1 hour)
```

### Implementation Details

**Admin API endpoint (`/api/admin/content/save`):**
```javascript
// POST /api/admin/content/save
{
  "key": "contact_email",
  "content_fa": "support@didar.de",
  "content_de": "support@didar.de"
}

// Response:
{
  "success": true,
  "message": "Saved. Changes live now.",
  "revalidated": true
}

// Backend also:
await revalidatePath('/');           // Invalidate homepage
await revalidatePath('/kontakt');    // Invalidate contact page
// etc. based on which key was edited
```

**Admin Panel UI:**
```
[Email Address        ] [Save]
  ↓ (After clicking Save)
[✓ Saved. Live now.]  (green, auto-hides after 3 seconds)
```

### Why This Workflow

✓ **Simple:** Click Save → see changes  
✓ **Fast:** Changes live within 30 seconds  
✓ **Predictable:** No confusion about "draft" vs "published"  
✓ **Safe:** Changes are saved before invalidating (not vice versa)  
✓ **Fallback:** If invalidate fails, auto-refresh kicks in within 1 hour

---

## 5. MIGRATION MAPPING

### Principle: Preserve All Existing Content Exactly

For each item, create a mapping:
```
Current Location → CMS Key → Persian Value → German Value → Frontend Consumer
```

### Complete Migration Mapping Table

#### Homepage

| Current Source | CMS Key | Persian Value | German Value | Frontend Consumer |
|---|---|---|---|---|
| `pages/index.js:85` | `homepage.hero.title` | "دیدار" | "Didar Stuttgart" | `index.js` h1 |
| `pages/index.js:88` | `homepage.hero.subtitle` | "انجمن فرهنگی هنری اشتوتگارت" | (German only, no subtitle) | `index.js` subtitle para |
| `i18n.js:57-58` | `homepage.about_card.title` | (from i18n) | (from i18n) | `index.js` about card h2 |
| `i18n.js:57-58` | `homepage.about_card.description` | (from i18n) | (from i18n) | `index.js` about card p |
| `i18n.js:60-61` | `homepage.membership_card.title` | (from i18n) | (from i18n) | `index.js` membership card h2 |
| `i18n.js:60-61` | `homepage.membership_card.description` | (from i18n) | (from i18n) | `index.js` membership card p |

#### About Page

| Current Source | CMS Key | Persian Value | German Value | Frontend Consumer |
|---|---|---|---|---|
| `i18n.js:109` | `about.intro.heading` | (from i18n) | (from i18n) | `ueber-uns.js` h1 |
| `i18n.js:111-113` | `about.mission.title` | (from i18n) | (from i18n) | `ueber-uns.js` h2 |
| `i18n.js:111-113` | `about.mission.text` | (from i18n) | (from i18n) | `ueber-uns.js` p |
| `ueber-uns.js:37, 39-61` | `about.story.title` | "درباره دیدار" | "Über Didar" | `ueber-uns.js` h3 |
| `ueber-uns.js:40-61` | `about.story.content` | (5 paragraphs, ~1000 words) | (1 paragraph, ~200 words) | `ueber-uns.js` JSX render as HTML |

#### Membership Page

| Current Source | CMS Key | Persian Value | German Value | Frontend Consumer |
|---|---|---|---|---|
| `mitglied-werden.js:154-157` | `membership.intro.text` | "با پیوستن به دیدار..." | "Durch die Mitgliedschaft..." | `mitglied-werden.js` p.mt-4 |
| `i18n.js:122-123` | `membership.response_time.text` | (from i18n) | (from i18n) | `mitglied-werden.js` p.mt-8 |

#### Contact Page

| Current Source | CMS Key | Persian Value | German Value | Frontend Consumer |
|---|---|---|---|---|
| `i18n.js:127-128` | `contact.intro.text` | (from i18n) | (from i18n) | `kontakt.js` p.mt-4 |

#### Privacy Policy

| Current Source | CMS Key | Persian Value | German Value | Frontend Consumer |
|---|---|---|---|---|
| `datenschutz.js:28` | `privacy_policy.section_1.title` | "۱. معرفی" | "1. Einleitung" | `datenschutz.js` h2 |
| `datenschutz.js:29-31` | `privacy_policy.section_1.content` | (2 paragraphs) | (2 paragraphs) | `datenschutz.js` p rendering |
| ... (repeat for sections 2–12) | `privacy_policy.section_2.title` ... `privacy_policy.section_12.content` | ... | ... | ... |

#### Impressum

| Current Source | CMS Key | Persian Value | German Value | Frontend Consumer |
|---|---|---|---|---|
| `impressum.js:24-30` | `impressum.org_info.title` | "مسئولان و تماس" | "Verantwortliche Ansprechpartner" | `impressum.js` h2 |
| `impressum.js:26-28` | `impressum.org_info.name_address` | "Didar – Hochschulgruppe an der Universität Stuttgart\nPfaffenwaldring 5c\n70569 Stuttgart, Deutschland" | (same) | `impressum.js` address block |
| `impressum.js:36-43` | `impressum.org_info.managers_section_title` | "مسئولان" | "Sprecherinnen und Sprecher" | `impressum.js` h2 |
| — | `organization_settings` key: `organization_managers` | `[{name: "Danial Haghgoo", ...}, ...]` (JSON) | (same JSON, shared) | `impressum.js` list render |
| `impressum.js:45` | `impressum.section_1.title` | "توضیحات حقوقی" | "Rechtlicher Hinweis" | `impressum.js` h2 |
| `impressum.js:46-48` | `impressum.section_1.content` | (3 paragraphs) | (3 paragraphs) | `impressum.js` p rendering |
| ... (repeat for sections 2–11) | `impressum.section_2.title` ... `impressum.section_11.content` | ... | ... | ... |

#### Footer

| Current Source | CMS Key | Persian Value | German Value | Frontend Consumer |
|---|---|---|---|---|
| `footer.js:16-18` | `footer.tagline` | "انجمن فرهنگی هنری دیدار — شتوتگارت" | "Iranische Kulturgemeinschaft Stuttgart" | `footer.js` p in brand section |

#### Organization Settings

| Current Source | Settings Key | Type | Value | Frontend Consumers |
|---|---|---|---|---|
| `kontakt.js:218`, `footer.js:42`, `impressum.js:32` (5 places) | `organization_settings.contact_email` | scalar | "info@didar-stuttgart.com" | `Footer`, `Contact page`, `Impressum` |
| `impressum.js:33` | `organization_settings.contact_phone` | scalar | "+49 155 11250722" | `Impressum` |
| `impressum.js:27-28` | `organization_settings.contact_address` | scalar (bilingual) | De: "Pfaffenwaldring 5c..." | `Impressum` |
| `impressum.js:41-42` | `organization_settings.organization_managers` | list (JSON) | `[{name, role, email}, ...]` | `Impressum` (list) |
| `SocialIcons.js:10` | `organization_settings.social_instagram_url` | scalar | "https://www.instagram.com/didar_stuttgart/" | `Footer`, `Contact page`, `EventCard` |
| `SocialIcons.js:11` | `organization_settings.social_telegram_url` | scalar | "https://t.me/Didar_stuttgart" | `Footer`, `Contact page`, `EventCard` |

**Total CMS rows to migrate: ~65 content items**  
**Total organization_settings rows to migrate: ~8 settings**

---

## 6. FRONTEND CONSUMPTION

### Rule: Graceful Fallback Always

Frontend pages fetch CMS data during build time (getStaticProps or ISR). If a key is missing, the component falls back to a safe value.

### Pattern: CMS Hook

**Create a reusable hook (`lib/useCMS.js`):**

```javascript
/**
 * Hook: Fetch CMS content for a page
 * @param {string[]} keys - Array of content keys to fetch
 * @param {string} lang - Language ('fa' or 'de')
 * @returns {Object} - { [key]: content_value, ... }
 */
export async function getCMSContent(keys, lang) {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('cms_content')
      .select('key, content_fa, content_de')
      .in('key', keys)
      .eq('is_enabled', true);
    
    if (error || !data) {
      console.warn('CMS fetch error:', error);
      return {};  // Return empty; components will use fallback
    }
    
    // Transform to { key: content_value }
    const result = {};
    data.forEach(row => {
      result[row.key] = lang === 'fa' ? row.content_fa : row.content_de;
    });
    return result;
  } catch (err) {
    console.error('CMS fetch exception:', err);
    return {};  // Safe fallback
  }
}

/**
 * Helper: Get value with fallback
 */
export function getCMSValue(cms, key, fallback) {
  return cms[key] || fallback || `[Missing: ${key}]`;
}
```

### Pattern: Page Usage

**Before (Hardcoded):**
```javascript
// pages/kontakt.js
function Contact({ currentLang }) {
  const intro = currentLang === 'fa'
    ? 'سوالات یا پیشنهادات دارید؟'
    : 'Haben Sie Fragen?';
  return <p>{intro}</p>;
}
```

**After (CMS + Fallback):**
```javascript
// pages/kontakt.js
import { getCMSContent, getCMSValue } from '@/lib/useCMS';
import { t } from '@/lib/i18n';

export async function getStaticProps({ locale }) {
  const cmsContent = await getCMSContent(['contact.intro.text'], locale);
  return {
    props: { cmsContent },
    revalidate: 3600,
  };
}

function Contact({ cmsContent, currentLang }) {
  // Prefer CMS; fall back to i18n; fall back to safe message
  const intro = getCMSValue(
    cmsContent,
    'contact.intro.text',
    t('contact.intro', currentLang)
  );
  
  return <p>{intro}</p>;
}
```

### Fallback Priority

```
1. CMS value (if available and not empty)
2. i18n value (for backward compatibility during transition)
3. Safe placeholder (e.g., "Missing content" or key name)
```

### No Secrets Exposed

**Rule:** CMS content is public. No admin passwords, API keys, or sensitive data.

**Verification:**
- Frontend fetches via public `SELECT` on `cms_content` (RLS allows all SELECT)
- Organization settings are also public (contact info is meant to be visible)
- Sensitive admin data is NOT in either table (e.g., no passwords)

### Caching Strategy

**ISR (Incremental Static Regeneration):**
- Default revalidation: 1 hour
- On admin save: On-demand revalidation (immediate, via `revalidatePath()`)
- Fallback: Auto-refresh every 1 hour even if admin doesn't trigger it

**Frontend caching:**
```javascript
export async function getStaticProps({ locale }) {
  const cms = await getCMSContent([...], locale);
  return {
    props: { cms },
    revalidate: 3600,  // 1 hour
  };
}
```

---

## 7. RICH TEXT

### Requirement: Non-Technical Admin Can Edit

**Not** a full WYSIWYG with 50 toolbar buttons.  
**Not** raw HTML with `<div>` and `<span>` tags.

### Chosen Approach: Markdown Editing + HTML Storage

**Why Markdown:**
- Simple syntax: `**bold**`, `*italic*`, `# Heading`, `- List item`
- Non-technical users can learn it in 5 minutes
- Version-control friendly (text-based, diffs are readable)
- Portable (if we move off this platform later)

**Why HTML Storage:**
- Renders consistently on all devices
- Sanitized on output (security)
- Easy to cache

### Implementation

**Admin Panel:**
```
Privacy Policy - Section 1: Introduction
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Markdown Editor (Persian):
┌─────────────────────────────────────┐
│ # معرفی                             │
│                                     │
│ این سند توضیح می‌دهد که ما چگونه │
│ اطلاعات شما را...                  │
│                                     │
│ **مهم:** این سیاست در سپتامبر...    │
└─────────────────────────────────────┘

Preview (Persian):
┌─────────────────────────────────────┐
│ معرفی                               │
│                                     │
│ این سند توضیح می‌دهد که ما چگونه  │
│ اطلاعات شما را...                  │
│                                     │
│ مهم: این سیاست در سپتامبر...       │
└─────────────────────────────────────┘

[Same for German]

[Save]
```

**Storage in Database:**
```sql
INSERT INTO cms_content (key, content_fa, content_de, content_type)
VALUES (
  'privacy_policy.section_1.content',
  '# معرفی\n\nاین سند توضیح می‌دهد...', -- Markdown
  '# Einleitung\n\nDieses Dokument erklärt...', -- Markdown
  'rich_text'
);
```

**Frontend Rendering:**
```javascript
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

function PrivacyPolicy({ cms, currentLang }) {
  const markdown = currentLang === 'fa'
    ? cms['privacy_policy.section_1.content']
    : cms['privacy_policy.section_1.content'];
  
  // Define heading component mappings (Map # to h2, ## to h3, etc.)
  const componentOverrides = {
    h1: (props) => <h2 {...props} />,
    h2: (props) => <h3 {...props} />,
  };
  
  return (
    <div className="privacy-section">
      <ReactMarkdown components={componentOverrides}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
```

**Security:**
- ReactMarkdown sanitizes by default
- DOMPurify as additional layer if needed
- No raw HTML input from admin (only markdown)

### Admin Help Text

In the CMS admin panel, include:
```
admin_help: "Use markdown formatting:
  **bold text**
  *italic text*
  # Heading 1
  ## Heading 2
  - List item
  
Don't use HTML. Markdown is easier and safer."
```

---

## 8. ADMIN UX & INFORMATION ARCHITECTURE

### Admin Panel URL: `/admin/content`

### Proposed Structure & Navigation

```
ADMIN CONTENT PANEL
═══════════════════════════════════════════════════════════════════

[< Back] [Didar Admin] [Logout]

Content Editor
──────────────────────────────────────────────────────────────────

Page Selector:
┌─ Homepage            (current)
│  ├─ Hero Section
│  ├─ About Card
│  └─ Membership Card
├─ About Page
│  ├─ Introduction
│  ├─ Mission
│  └─ Story
├─ Membership Page
├─ Contact Page
├─ Privacy Policy
├─ Impressum
├─ Footer
└─ Organization Settings
   ├─ Contact Info
   ├─ Team Members
   └─ Social Links
```

### Actual Admin Panel Layout (Per Page)

**Example: Homepage**

```
◀ Sections    HOMEPAGE    [Save Draft] [Publish Now]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▼ Hero Section
  ┌─────────────────────────────────────────────────────┐
  │ Title (appears in h1 on hero)                       │
  │                                                     │
  │ Persian:                                            │
  │ [دیدار                              ] (max 100 chars) │
  │                                                     │
  │ German:                                             │
  │ [Didar Stuttgart                    ] (max 100 chars) │
  │                                                     │
  │ Subtitle (Persian only)                             │
  │                                                     │
  │ Persian:                                            │
  │ [انجمن فرهنگی هنری اشتوتگارت      ] (max 150 chars) │
  │                                                     │
  │ German:                                             │
  │ [                                  ] (N/A)          │
  └─────────────────────────────────────────────────────┘

▼ About Card
  ┌─────────────────────────────────────────────────────┐
  │ Title                                               │
  │                                                     │
  │ Persian:                                            │
  │ [درباره دیدار                       ]               │
  │                                                     │
  │ German:                                             │
  │ [Über Didar                        ]                │
  │                                                     │
  │ Description (marketing copy)                        │
  │                                                     │
  │ Persian:                                            │
  │ [دیدار یک انجمن فرهنگی هنری است   ]               │
  │                                                     │
  │ German:                                             │
  │ [Didar ist eine kulturelle...      ]                │
  └─────────────────────────────────────────────────────┘

▼ Membership Card
  ... (same structure as About Card)
```

**Example: Privacy Policy**

```
◀ Sections    PRIVACY POLICY    [Save] [Publish]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sections: [Section 1 ▼] [Section 2] [Section 3] ... [Section 12]

▼ Section 1: Introduction
  ┌─────────────────────────────────────────────────────┐
  │ Title (e.g., "Introduction" or "معرفی")             │
  │                                                     │
  │ Persian:                                            │
  │ [۱. معرفی                          ]                │
  │                                                     │
  │ German:                                             │
  │ [1. Einleitung                     ]                │
  │                                                     │
  │ Content (rich text, Markdown editor)                │
  │                                                     │
  │ Persian:                                            │
  │ ┌─────────────────────────────────────────────────┐ │
  │ │ # معرفی                                         │ │
  │ │                                                 │ │
  │ │ این سند توضیح می‌دهد که ما چگونه...          │ │
  │ │                                                 │ │
  │ │ **مهم:** اطلاعات...                            │ │
  │ └─────────────────────────────────────────────────┘ │
  │                                                     │
  │ German:                                             │
  │ ┌─────────────────────────────────────────────────┐ │
  │ │ # Einleitung                                    │ │
  │ │                                                 │ │
  │ │ Dieses Dokument erklärt, wie wir...            │ │
  │ │                                                 │ │
  │ │ **Wichtig:** Informationen werden...           │ │
  │ └─────────────────────────────────────────────────┘ │
  │                                                     │
  │ Admin help: "Use markdown formatting. Don't use HTML." │
  └─────────────────────────────────────────────────────┘

[Previous Section] [Next Section]
[Save] [Publish]
```

**Example: Organization Settings → Contact Info**

```
◀ Settings    ORGANIZATION SETTINGS    [Save]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Contact Info] [Team Members] [Social Links]

▼ Contact Information
  ┌─────────────────────────────────────────────────────┐
  │ Email Address                                       │
  │ [info@didar-stuttgart.com             ]             │
  │                                                     │
  │ Phone Number                                        │
  │ [+49 155 11250722                     ]             │
  │                                                     │
  │ Address (bilingual)                                 │
  │                                                     │
  │ Persian:                                            │
  │ [Pfaffenwaldring 5c, 70569 Stuttgart ]              │
  │                                                     │
  │ German:                                             │
  │ [Pfaffenwaldring 5c, 70569 Stuttgart ]              │
  │                                                     │
  │ [Save]                                              │
  └─────────────────────────────────────────────────────┘
```

**Example: Organization Settings → Team Members (Structured Form)**

```
◀ Settings    ORGANIZATION SETTINGS    [Save]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Contact Info] [Team Members] [Social Links]

▼ Team Members
  ┌─────────────────────────────────────────────────────┐
  │                                                     │
  │ Manager #1                                          │
  │ ┌────────────────────────────────────────────────┐  │
  │ │ Name:  [Danial Haghgoo            ]            │  │
  │ │ Role:  [Co-founder                ]            │  │
  │ │ Email: [danial@didar.de           ]            │  │
  │ │ [Edit] [Delete]                                │  │
  │ └────────────────────────────────────────────────┘  │
  │                                                     │
  │ Manager #2                                          │
  │ ┌────────────────────────────────────────────────┐  │
  │ │ Name:  [Sayedali Yarahmadian      ]            │  │
  │ │ Role:  [Co-founder                ]            │  │
  │ │ Email: [sayedali@didar.de         ]            │  │
  │ │ [Edit] [Delete]                                │  │
  │ └────────────────────────────────────────────────┘  │
  │                                                     │
  │ [+ Add Team Member]                                 │
  │ [Save]                                              │
  └─────────────────────────────────────────────────────┘
```

### Key Features

1. **Language toggle:** Each section shows Persian and German side-by-side for short items; tabbed for long items
2. **Character count:** For text fields with max length (e.g., "123 / 150 characters")
3. **Rich text preview:** For markdown editors, show live preview
4. **Help text:** Admin tooltips on every field
5. **Save feedback:** "✓ Saved. Changes live now." notification
6. **Disabled state:** Form is disabled while saving
7. **Validation:** Client-side (required fields); server-side (format validation)

---

## 9. FINAL CHECKLIST

### Decisions Finalized ✓

| Decision | Chosen | Status |
|----------|--------|--------|
| CMS Boundary | All visible recurring text → CMS; form labels/validation → i18n | ✓ FINAL |
| Data Model | Key-value (`cms_content` + `organization_settings`) | ✓ FINAL |
| Schema | Exact fields defined above | ✓ FINAL |
| Organization Settings | No JSON editing; structured forms only | ✓ FINAL |
| Draft vs. Publish | Save → Publish immediately; on-demand ISR | ✓ FINAL |
| Migration | Mapping table above preserves all content | ✓ FINAL |
| Frontend Pattern | getStaticProps fetch → fallback to i18n → safe placeholder | ✓ FINAL |
| Rich Text | Markdown editing + HTML rendering | ✓ FINAL |
| Admin UX | Page-based navigation; bilingual side-by-side/tabbed | ✓ FINAL |

### No Unresolved Decisions
All architectural choices above are final and ready for Phase 3 implementation.

---

## PHASE 3 IMPLEMENTATION SCOPE

### Exact Tables to Create

```sql
-- Table 1: cms_content
CREATE TABLE cms_content (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  item_type TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'textarea', 'rich_text')),
  content_fa TEXT NOT NULL,
  content_de TEXT NOT NULL,
  admin_label TEXT NOT NULL,
  admin_help TEXT,
  sort_order INT DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP DEFAULT TIMEZONE('utc', NOW()),
  created_by TEXT,
  updated_by TEXT
);

-- Table 2: organization_settings
CREATE TABLE organization_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value_text TEXT,
  value_text_fa TEXT,
  value_text_de TEXT,
  value_json JSONB,
  admin_label TEXT NOT NULL,
  admin_help TEXT,
  is_bilingual BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT TIMEZONE('utc', NOW()),
  updated_by TEXT
);

-- Enable RLS
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "public_read_cms" ON cms_content FOR SELECT USING (true);
CREATE POLICY "public_read_settings" ON organization_settings FOR SELECT USING (true);

-- Admin only writes (checked in app code)
CREATE POLICY "block_public_write_cms" ON cms_content FOR INSERT, UPDATE, DELETE USING (false);
CREATE POLICY "block_public_write_settings" ON organization_settings FOR INSERT, UPDATE, DELETE USING (false);
```

### Exact Frontend Pages to Migrate

| Page | File | Content to Fetch | Current Source |
|------|------|------------------|---|
| Homepage | `pages/index.js` | 6 CMS keys (hero, about card, membership card) | Hardcoded JSX + i18n |
| About | `pages/ueber-uns.js` | 5 CMS keys (intro, mission, story) | Hardcoded JSX |
| Membership | `pages/mitglied-werden.js` | 2 CMS keys (intro, response time) | Hardcoded JSX + i18n |
| Contact | `pages/kontakt.js` | 1 CMS key (intro) | i18n |
| Privacy Policy | `pages/datenschutz.js` | 24 CMS keys (12 sections × title + content) | Hardcoded JSX |
| Impressum | `pages/impressum.js` | 22 CMS keys (11 sections × title + content) + 8 settings (email, phone, address, managers) | Hardcoded JSX + organization_settings |
| Footer | `components/footer.js` | 1 CMS key (tagline) + 3 organization_settings (email, social URLs) | Hardcoded JSX + SocialIcons.js |

### Exact Admin Areas to Build

| Area | File | New Functionality |
|------|------|---|
| Admin Content Panel | `/pages/admin/content.js` (expand) | Form-based editing for all CMS pages/sections |
| Admin API | `/pages/api/admin/content/index.js` (replace) | CRUD endpoints for cms_content and organization_settings |
| Organization Settings Editor | (new sub-page in admin) | Structured form editing for contact info, managers, social links |

### What Will Remain in Code (NOT Moving to CMS)

| Item | Location | Reason |
|------|----------|--------|
| Form field labels | `lib/i18n.js` | Coupled to form validation |
| Form error messages | `lib/i18n.js` | System/validation feedback |
| Navigation items | `lib/i18n.js` | Site structure; changing requires routing updates |
| Button labels | `lib/i18n.js` | UI chrome |
| Status messages | `lib/i18n.js` | System state (e.g., "event is full") |
| Accessibility text | `lib/i18n.js` | Part of HTML structure |

---

## Document Status

✓ **Phase 2 Architecture FINALIZED**  
✓ **All 9 points resolved**  
✓ **Ready for Phase 3 implementation**

**Next Step:** Proceed to Phase 3 (Implementation). Use this architecture as the definitive guide.

---

## End of Architecture Document
