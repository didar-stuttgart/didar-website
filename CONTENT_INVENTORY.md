# Content Inventory — Phase 1 (CMS Content Discovery)

**Date:** September 2026  
**Scope:** Complete audit of user-facing editorial content across the Didar website  
**Languages:** Persian (fa), German (de)

---

## Executive Summary

### Current State
- **Bilingual system:** Fully set up (Persian/RTL, German/LTR)
- **i18n infrastructure:** `lib/i18n.js` with 190+ translation keys, flat key-value structure
- **CMS foundation:** Basic `content` table exists (Supabase) with 6 editable fields
- **Admin panel:** `/admin/content.js` exists but covers only homepage hero + about intro
- **Content types:** Mix of hardcoded JSX, i18n translations, and database-driven (events)

### Key Finding
**Most user-facing editorial content is hardcoded as JSX or i18n entries, not in CMS.** The current CMS table handles only a tiny fraction of editable content.

### Content Distribution
| Category | Count | Location |
|----------|-------|----------|
| Hardcoded in JSX | 12 | Pages (About, Privacy, Impressum) |
| i18n translations | 190+ | `lib/i18n.js` |
| Database-driven | 5+ | Events (title_fa/de, description_fa/de, location_fa/de) |
| CMS-editable | 6 | `content` table (currently unused by frontend) |
| Config/URLs | 3 | `SocialIcons.js` |

---

## By Page

### 1. **Homepage** (`pages/index.js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Hero** | Title | "دیدار" / "Didar Stuttgart" | index.js:85-86 | fa/de | CMS_CONTENT | Hardcoded in JSX; should be in CMS |
| | Subtitle | "انجمن فرهنگی هنری اشتوتگارت" | index.js:88 | fa | CMS_CONTENT | Only shown in Persian |
| **Hero CTA** | Primary button | `home.cta_primary` | i18n:64 | fa/de | SYSTEM_I18N | Navigation link to events |
| | Secondary button | `home.cta_secondary` | i18n:65 | fa/de | SYSTEM_I18N | Navigation link to about |
| **Upcoming Events** | Section heading | `home.upcoming_events` | i18n:54 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | "View all events" button | `home.all_events` | i18n:55 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | No events fallback | `events.no_upcoming` | i18n:71 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **About Card** | Title | `home.about_section` | i18n:56 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Description | `home.about_text` | i18n:57-58 | fa/de | CMS_CONTENT | Short summary; should allow admin edit |
| | Button | `common.learn_more` | i18n:36 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Membership Card** | Title | `home.membership_section` | i18n:59 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Description | `home.membership_text` | i18n:60-61 | fa/de | CMS_CONTENT | Short summary; should allow admin edit |
| | Button | `home.membership_cta` | i18n:62 | fa/de | SYSTEM_I18N | ✓ Already i18n |

**Summary:** Hero title/subtitle hardcoded; card summaries in i18n but non-editable.

---

### 2. **About Page** (`pages/ueber-uns.js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Page Title** | Heading | `about.intro` (i18n) + hardcoded "درباره دیدار" | ueber-uns.js:15, 37 | fa/de | CMS_CONTENT | Heading hardcoded, should be i18n → CMS |
| **Mission** | Section title | `about.mission` | i18n:111 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Mission statement | `about.mission_text` | i18n:112-113 | fa/de | CMS_CONTENT | Short; should be editable |
| **About Story** | Heading | "درباره دیدار" / "Über Didar" | ueber-uns.js:37 | fa/de | CMS_CONTENT | Hardcoded; should be i18n |
| | **Persian story** (5 paragraphs) | Full article (۱۰۰۰+ words) | ueber-uns.js:41-61 | fa | CMS_CONTENT | ✗ **CRITICAL:** Long hardcoded block; not i18n |
| | **German story** (1 paragraph) | "Didar ist eine kulturelle..." | ueber-uns.js:65 | de | CMS_CONTENT | ✗ **CRITICAL:** Hardcoded; not i18n |

**Summary:** About page contains two completely hardcoded, non-bilingual content blocks. This is the largest single editorial block on the site. **Must become CMS-editable.**

---

### 3. **Membership Page** (`pages/mitglied-werden.js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Page Title** | Heading | `membership.title` | i18n:116 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Intro Section** | Subheading | `membership.intro` | i18n:117 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | **Intro paragraph** | "با پیوستن به دیدار..." / "Durch die Mitgliedschaft..." | mitglied-werden.js:154-157 | fa/de | CMS_CONTENT | ✗ Hardcoded; not i18n |
| **Form Section** | Title | `membership.form_title` | i18n:119 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Intro text | `membership.form_intro` | i18n:120-121 | fa/de | CMS_CONTENT | Short; non-editable |
| | Form field labels | Various `form.*` keys | i18n:136–142 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Privacy notice block | `form.privacy_membership_notice` | i18n:147-148 | fa/de | SYSTEM_I18N | ✓ Already i18n (mixed concern) |
| **Response Time** | Text | `membership.response_time` | i18n:122-123 | fa/de | CMS_CONTENT | Non-editable; should allow SLA customization |
| | Form success message | `form.success` | i18n:154-155 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Form error message | `form.error` | i18n:156-157 | fa/de | SYSTEM_I18N | ✓ Already i18n |

**Summary:** Intro paragraph is hardcoded JSX; response-time SLA is in i18n but not editable by admins.

---

### 4. **Contact Page** (`pages/kontakt.js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Page Title** | Heading | `contact.title` | i18n:126 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Intro** | Intro text | `contact.intro` | i18n:127-128 | fa/de | CMS_CONTENT | Non-editable; should be customizable |
| **Form Section** | Title | `contact.form_title` | i18n:129 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Form field labels | `form.name`, `form.email`, `form.message` | i18n:136–142 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Privacy notice block | `form.privacy_contact_notice` | i18n:149-150 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Contact Info** | Heading | `footer.contact` | i18n:166 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Email label | "ایمیل" / "E-Mail" | kontakt.js:216 | fa/de | SYSTEM_I18N | Hardcoded; should be i18n |
| | Email address | `info@didar-stuttgart.com` | kontakt.js:218 | — | SYSTEM_I18N | Hardcoded; should be config/CMS |
| | Social heading | `footer.follow_us` | i18n:165 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Instagram link | `SOCIAL_LINKS.instagram` | SocialIcons.js:10 | — | SYSTEM_I18N | Hardcoded URL |
| | Telegram link | `SOCIAL_LINKS.telegram` | SocialIcons.js:11 | — | SYSTEM_I18N | Hardcoded URL |

**Summary:** Intro text, email label, and social URLs are hardcoded.

---

### 5. **Events List Page** (`pages/veranstaltungen/index.js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Page Title** | Heading | `events.title` | i18n:68 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Upcoming Section** | Heading | `events.upcoming` | i18n:69 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | No events fallback | `events.no_upcoming` | i18n:71 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Past Section** | Heading | `events.past` | i18n:70 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Event data | From `events` table | DB | fa/de | DYNAMIC_DATA | ✓ Stored in DB |

**Summary:** Fully i18n + database-driven. No hardcoded content. ✓ **No action needed.**

---

### 6. **Event Detail Page** (`pages/veranstaltungen/[slug].js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Event Metadata** | Title, description, location | From `events` table | DB | fa/de | DYNAMIC_DATA | ✓ Stored in DB |
| **Registration Status** | "Coming soon" badge | `event.coming_soon` | i18n:88 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | "Registration open" | `events.registration_open` | i18n:72 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | "Registration closed" | `events.registration_closed` | i18n:73 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | "Past event" | `events.past_event` | i18n:74 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Capacity Status** | "Capacity full" (hardcoded) | `{currentLang === 'fa' ? 'ظرفیت رویداد تکمیل شده است' : 'Die Veranstaltung ist ausgebucht'` | [slug].js:207–209, 237–239 | fa/de | SYSTEM_I18N | ✗ Hardcoded instead of i18n |
| | Capacity display | "حضور:" / "Anmeldungen:" | [slug].js:378 | fa/de | SYSTEM_I18N | ✗ Hardcoded instead of i18n |
| | "Event is full" (disabled form) | `{currentLang === 'fa' ? 'ظرفیت ثبت‌نام تکمیل شده است.' : 'Die Anmeldung ist bereits voll.'` | [slug].js:548–550 | fa/de | SYSTEM_I18N | ✗ Hardcoded instead of i18n |
| **Special Handling** | Book club weekly schedule note | `event.weekly_schedule_note` | i18n:98–101 | fa/de | SYSTEM_I18N | ✓ Already i18n (but hardcoded activation) |
| **Success Modal** | "Registration successful" | "ثبت‌نام موفق" / "Anmeldung erfolgreich" | [slug].js:635 | fa/de | SYSTEM_I18N | ✗ Hardcoded instead of i18n |
| | Success message | "ثبت‌نام شما با موفقیت ثبت شد..." / "Ihre Anmeldung war erfolgreich..." | [slug].js:640–642 | fa/de | SYSTEM_I18N | ✗ Hardcoded instead of i18n |
| | Email check reminder | "📧 لطفاً صندوق..." / "📧 Bitte überprüfen Sie..." | [slug].js:645–648 | fa/de | SYSTEM_I18N | ✗ Hardcoded instead of i18n |
| | Spam folder note | "اگر ایمیل را..." / "Falls Sie keine..." | [slug].js:651–654 | fa/de | SYSTEM_I18N | ✗ Hardcoded instead of i18n |

**Summary:** Event data is database-driven (✓), but several UI messages are hardcoded as inline ternaries instead of i18n keys.

---

### 7. **Privacy Policy** (`pages/datenschutz.js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Page Title** | Heading | `legal.datenschutz` | i18n:188 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **All content** | 12 sections + 100+ paragraphs | **Fully hardcoded Persian block** (22-132) + **fully hardcoded German block** (134-244) | datenschutz.js | fa/de | CMS_CONTENT | ✗ **CRITICAL:** 4000+ words, completely hardcoded |

**Example of hardcoding:**
```jsx
{currentLang === 'fa' ? (
  <div className="mt-8">
    <h2 className="mt-12">۱. معرفی</h2>
    <p className="mt-4">Didar – Hochschulgruppe...</p>
    ...
  </div>
) : (
  <div className="mt-8">
    <h2 className="mt-12">1. Einleitung</h2>
    <p className="mt-4">Didar – Hochschulgruppe...</p>
    ...
  </div>
)}
```

**Summary:** **Entire legal document is hardcoded JSX with no i18n, no database, no CMS.** Updating requires code change. **Critical blocker for any legal/policy updates.**

---

### 8. **Impressum/Legal Info** (`pages/impressum.js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Page Title** | Heading | `legal.impressum` | i18n:187 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Organization Info** | Name | "Didar – Hochschulgruppe an der Universität Stuttgart" | impressum.js:26, 88 | — | SYSTEM_I18N | Hardcoded; should be config |
| | Address | "Pfaffenwaldring 5c, 70569 Stuttgart" | impressum.js:27–28, 89–90 | — | SYSTEM_I18N | Hardcoded; should be config |
| | Email | `info@didar-stuttgart.com` | impressum.js:32, 94 | — | SYSTEM_I18N | Hardcoded; should be config |
| | Phone | "+49 155 11250722" | impressum.js:33, 95 | — | SYSTEM_I18N | Hardcoded; should be config |
| **Managers** | Names | "Danial Haghgoo" + "Sayedali Yarahmadian" | impressum.js:41–42, 102–104 | — | CMS_CONTENT | ✗ Hardcoded; should be CMS editable |
| **All legal sections** | 11 headings + 20+ paragraphs (Persian) | Fully hardcoded (22–83) | impressum.js | fa | CMS_CONTENT | ✗ **CRITICAL:** Hardcoded legal text |
| | 11 headings + 20+ paragraphs (German) | Fully hardcoded (85–146) | impressum.js | de | CMS_CONTENT | ✗ **CRITICAL:** Hardcoded legal text |

**Summary:** All legal/contact info is hardcoded in JSX. Organization info should be config. Manager names and legal content should be CMS-editable.

---

### 9. **Header Component** (`components/Header.js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Logo** | Logo image alt | "دیدار" / "Didar" | Header.js:56–57 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Logo text | Same | Header.js:67 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Navigation** | Home | `nav.home` | i18n:21 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Events | `nav.events` | i18n:22 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | About | `nav.about` | i18n:23 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Membership | `nav.membership` | i18n:24 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Contact | `nav.contact` | i18n:25 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Language toggle** | Label | `nav.languages` | i18n:30 | fa/de | SYSTEM_I18N | ✓ Already i18n |

**Summary:** Fully i18n. ✓ **No action needed.**

---

### 10. **Footer Component** (`components/Footer.js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Brand Section** | Organization name | "دیدار" / "Didar" | Footer.js:14 | fa/de | SYSTEM_I18N | Partially i18n (hardcoded ternary) |
| | Tagline | "انجمن فرهنگی هنری دیدار — شتوتگارت" / "Iranische Kulturgemeinschaft Stuttgart" | Footer.js:16–18 | fa/de | CMS_CONTENT | ✗ Hardcoded; should be i18n/CMS |
| **Social Section** | Heading | `footer.follow_us` | i18n:165 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Instagram | Label "Instagram" + `SOCIAL_LINKS.instagram` | Footer.js:26, SocialIcons.js:10 | — | SYSTEM_I18N | URL hardcoded |
| | Telegram | Label "Telegram" + `SOCIAL_LINKS.telegram` | Footer.js:32, SocialIcons.js:11 | — | SYSTEM_I18N | URL hardcoded |
| **Contact Section** | Heading | `footer.contact` | i18n:166 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Email | `info@didar-stuttgart.com` | Footer.js:42 | — | SYSTEM_I18N | Hardcoded; should be config |
| | Contact link | `nav.contact` | i18n:25 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Legal Section** | Impressum link | `footer.impressum` | i18n:168 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Privacy link | `footer.datenschutz` | i18n:169 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| **Copyright** | Text | `footer.copyright` with `{{year}}` param | i18n:170–171, 184 | fa/de | SYSTEM_I18N | ✓ Already i18n |

**Summary:** Most items are i18n; tagline is hardcoded; organization name uses ternary; email/social URLs hardcoded.

---

### 11. **Event Card Component** (`components/EventCard.js`)

| Section | Item | Current Text / Identifier | File | Language | Classification | Notes |
|---------|------|----------|------|----------|---|---|
| **Event Display** | All event data | From `events` table | DB | fa/de | DYNAMIC_DATA | ✓ Database-driven |
| | Category | From `category_fa`/`category_de` | DB | fa/de | DYNAMIC_DATA | ✓ Database-driven |
| | Language | From `event_language_fa`/`event_language_de` | DB | fa/de | DYNAMIC_DATA | ✓ Database-driven |
| **Status Labels** | "Coming soon" | `event.coming_soon` | i18n:88 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | "Registration closed" | `events.registration_closed` | i18n:73 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | "Location TBD" | `events.location_tbd` | i18n:76 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | "Learn more" link | `common.learn_more` | i18n:36 | fa/de | SYSTEM_I18N | ✓ Already i18n |
| | Telegram note | `event.telegram_note` | i18n:102–105 | fa/de | SYSTEM_I18N | ✓ Already i18n |

**Summary:** Fully database-driven + i18n. ✓ **No action needed.**

---

### 12. **Social Icons/Links** (`components/SocialIcons.js`)

| Item | Value | File | Language | Classification | Notes |
|------|-------|------|----------|---|---|
| Instagram URL | `https://www.instagram.com/didar_stuttgart/` | SocialIcons.js:10 | — | SYSTEM_I18N | Hardcoded; used as single source of truth |
| Telegram URL | `https://t.me/Didar_stuttgart` | SocialIcons.js:11 | — | SYSTEM_I18N | Hardcoded; used as single source of truth |
| Website URL | `https://didar-stuttgart.com/` | SocialIcons.js:12 | — | SYSTEM_I18N | Defined but not used; placeholder |

**Summary:** All hardcoded but centralized in one component. Good practice, but should move to config or CMS.

---

## Content Table Status (Supabase)

### Current Schema (`Claude outputs/content-table.sql`)

```sql
CREATE TABLE content (
  id BIGSERIAL PRIMARY KEY,
  homepage_hero_title_fa TEXT,
  homepage_hero_subtitle_fa TEXT,
  homepage_hero_title_de TEXT,
  homepage_hero_subtitle_de TEXT,
  about_intro_fa TEXT,
  about_intro_de TEXT,
  -- 6 fields total
);
```

### Current Admin Panel (`pages/admin/content.js`)
- ✓ Can edit: `homepage_hero_title_fa/de`, `homepage_hero_subtitle_fa/de`, `about_intro_fa/de`
- ✗ API endpoint exists (`pages/api/admin/content/index.js`) but **frontend does NOT use the CMS table**
- ✗ Homepage still uses hardcoded JSX instead of fetching from CMS

### Current Gaps
1. **Frontend not reading from CMS:** Even though the database table exists, no page fetches from `content` table in `getStaticProps` or `getServerSideProps`.
2. **Table is incomplete:** Only 6 fields; needs ~50+ fields for all editable content.
3. **Admin panel is incomplete:** Only covers 2 sections of 1 page.
4. **No audit trail:** No created_by, updated_by, change_log, or version history.

---

## Content Classification Summary

### By Category

#### CMS_CONTENT (60+ items)
Editorial text that admins should edit without code:
- About page (entire story sections)
- Privacy policy (all 12 sections)
- Impressum (legal text + manager names)
- Membership intro + response time SLA
- Contact intro
- Homepage about/membership card summaries
- Organization info (address, email, phone, name)
- Footer tagline
- Event descriptions (database-driven ✓)
- Social media URLs (currently hardcoded)

#### SYSTEM_I18N (190+ items)
UI/system strings that remain in code:
- Form field labels
- Button labels
- Navigation items
- Status messages (mostly moved to i18n, some hardcoded)
- Error/success messages
- Page titles/headings
- Form placeholders
- Privacy policy notices

#### DYNAMIC_DATA (5+ fields)
Generated from database:
- Event metadata (title_fa/de, description_fa/de, location_fa/de, category_fa/de, event_language_fa/de)
- Registration data
- Membership applications
- Contact submissions

#### UNCLEAR (0 items)
No items require clarification.

---

## Hardcoded Content Hotspots (Priority)

### 🔴 CRITICAL (Legal/Policy)
1. **Privacy Policy (datenschutz.js:22–244)**
   - 4000+ words hardcoded as JSX ternary
   - No way to update without code change
   - Requires CMS for any compliance updates
   - **Action:** Move all 12 sections to CMS table

2. **Impressum (impressum.js:22–146)**
   - 3000+ words hardcoded
   - Legal/organizational info (manager names, address, contact)
   - No way to update manager list without code change
   - **Action:** Move to CMS + create config for organization details

### 🟠 HIGH (User-Facing)
3. **About Page (ueber-uns.js:40–67)**
   - 1000+ words split between Persian/German hardcoded blocks
   - Core mission/history text
   - Admin requests likely for updates
   - **Action:** Move to CMS; create separate sections for story

4. **Membership Intro (mitglied-werden.js:154–157)**
   - 50-word hardcoded intro paragraph
   - Duplicated in database description elsewhere
   - **Action:** Move to CMS or use existing field

5. **Event Detail Messages ([slug].js:207–654)**
   - 6 hardcoded bilingual messages (capacity, success modal, etc.)
   - Scattered as inline ternaries, not i18n
   - **Action:** Move all to i18n keys

### 🟡 MEDIUM (Organization)
6. **Contact Info (hardcoded in 3+ places)**
   - Email: `info@didar-stuttgart.com` (Header, Footer, Contact page, Impressum)
   - Phone: `+49 155 11250722` (Impressum only)
   - Address: in Impressum only
   - **Action:** Move to centralized config file or CMS

7. **Social Links (SocialIcons.js)**
   - 3 URLs hardcoded; used as single source of truth (✓ good)
   - Should move to config or CMS for admin updates
   - **Action:** Move to config or admin panel

---

## Existing Admin Functionality

### Admin Panel Status
- **Location:** `/admin/content.js`, `/api/admin/content/index.js`
- **Auth:** Session-based (checks `/api/auth/verify`)
- **Database:** Uses `content` table (Supabase)
- **Editable fields:** 6 (only homepage hero + about intro)
- **Current state:** ✓ Working but **incomplete and unused**

### Frontend Integration
- ❌ **Homepage does NOT fetch from CMS:** Uses hardcoded JSX instead of querying `content` table
- ❌ **Admin panel has no effect:** Can save changes to database, but frontend ignores them
- ❌ **No form validation or audit trail**

---

## i18n System Assessment

### Current Setup (`lib/i18n.js`)
- ✓ 190+ translation keys in flat key-value structure
- ✓ Supports Persian (fa/RTL) and German (de/LTR)
- ✓ Used throughout components via `t(key, lang, params)`
- ✓ Supports parameter substitution (e.g., `{{year}}`)
- ✓ Enforces bilingual parity (both languages required)

### Gaps
- ❌ Some hardcoded messages not in i18n (event detail success modal, capacity status, etc.)
- ❌ Cannot be edited by admins (purely code-based)
- ❌ No fallback/default handling for missing keys
- ❌ Flat structure lacks hierarchy (works, but not scalable for 200+ keys)

### Assessment
**i18n is well-implemented for UI/system text.** However, it should not be used for editorial content (about page, privacy policy) that admins need to edit.

---

## Database Schema Assessment

### Events Table (✓ Good)
- Bilingual fields: `title_fa/de`, `description_fa/de`, `location_fa/de`
- Supports custom fields: `category_fa/de`, `event_language_fa/de`
- ✓ Extensible; can add `category_fa/de`, etc. as needed

### Content Table (⚠ Incomplete)
- Only 6 fields (homepage hero + about intro)
- ❌ Does NOT cover: privacy policy, impressum, contact intro, membership intro, footer tagline, social links
- ❌ No audit trail (created_by, updated_by, updated_at)
- ❌ Frontend never queries it

### Missing Table: Organization Config
- **Needed for:** Email, phone, address, name, manager list, social links
- **Currently:** Hardcoded in 5+ places
- **Recommendation:** Create `organization_settings` table or add fields to `content` table

---

## Summary: Content-to-CMS Mapping

| Content Type | Current Location | Should Be | CMS Table | Priority |
|----|----|----|----|-----|
| Homepage hero title | JSX (index.js:85) | CMS | `content.homepage_hero_title_fa/de` | HIGH |
| Homepage hero subtitle | JSX (index.js:88) | CMS | `content.homepage_hero_subtitle_fa/de` | HIGH |
| About page story | JSX (ueber-uns.js:40–67) | CMS | New: `content.about_story_fa/de` | CRITICAL |
| Privacy policy | JSX (datenschutz.js) | CMS | New: `content.privacy_policy_fa/de` | CRITICAL |
| Impressum legal | JSX (impressum.js) | CMS | New: `content.impressum_legal_fa/de` | CRITICAL |
| Impressum managers | JSX (impressum.js:41–42) | CMS | New: `content.managers` (JSON) | HIGH |
| Membership intro | JSX (mitglied-werden.js:154–157) | CMS | New: `content.membership_intro_fa/de` | MEDIUM |
| Contact intro | i18n (i18n.js:127–128) | CMS | New: `content.contact_intro_fa/de` | MEDIUM |
| About summary | i18n (i18n.js:57–58) | CMS | New: `content.home_about_text_fa/de` | MEDIUM |
| Membership summary | i18n (i18n.js:60–61) | CMS | New: `content.home_membership_text_fa/de` | MEDIUM |
| Email address | JSX (multiple files) | Config | New: `organization_email` | MEDIUM |
| Phone number | JSX (impressum.js) | Config | New: `organization_phone` | MEDIUM |
| Address | JSX (impressum.js) | Config | New: `organization_address` | MEDIUM |
| Organization name | JSX (footer.js, impressum.js) | Config | New: `organization_name_fa/de` | MEDIUM |
| Footer tagline | JSX (footer.js:17–18) | CMS | New: `content.footer_tagline_fa/de` | MEDIUM |
| Instagram URL | JSX (SocialIcons.js:10) | Config | New: `social_instagram` | LOW |
| Telegram URL | JSX (SocialIcons.js:11) | Config | New: `social_telegram` | LOW |
| Event capacity messages | JSX (veranstaltungen/[slug].js) | i18n | Move to `i18n.js` | MEDIUM |
| Success modal text | JSX ([slug].js) | i18n | Move to `i18n.js` | MEDIUM |

---

## Blockers & Recommendations

### Current Blockers
1. **CMS table not used by frontend** — Admin changes don't appear on site
2. **No content versioning** — Can't track who changed what or rollback
3. **Hardcoded legal content** — Compliance updates require code deployment
4. **Fragmented contact info** — Email/phone in 5 places; update requires editing all

### Phase 1 Recommendations (Inventory Only)
This phase is discovery only. **Do NOT implement yet.** But for Phase 2 planning:

1. **Expand `content` table** to ~50 fields (all major editorial content)
2. **Create `organization_settings` table** for contact info, manager list, social links
3. **Migrate legal pages** (privacy policy, impressum) from JSX to CMS
4. **Move event detail messages** from hardcoded ternaries to i18n
5. **Update admin panel** to cover all CMS table fields with rich-text editor support
6. **Add frontend logic** to fetch from CMS on every build (or via `getStaticProps`)
7. **Add audit trail** (created_by, updated_by, timestamps)
8. **Consider CDN caching** for CMS content to avoid build delays

---

## Appendix: File Map

### Pages
- `pages/index.js` — Homepage
- `pages/ueber-uns.js` — About
- `pages/mitglied-werden.js` — Membership
- `pages/kontakt.js` — Contact
- `pages/veranstaltungen/index.js` — Events list
- `pages/veranstaltungen/[slug].js` — Event detail
- `pages/datenschutz.js` — Privacy policy
- `pages/impressum.js` — Impressum/Legal
- `pages/registrations/verify.js` — Registration confirmation (not detailed here)

### Components
- `components/Header.js` — Top navigation
- `components/Footer.js` — Footer
- `components/EventCard.js` — Event card (repeating)
- `components/SocialIcons.js` — Social media links

### Admin
- `pages/admin/content.js` — CMS editor UI
- `pages/api/admin/content/index.js` — CMS API (GET/POST)
- `pages/admin/login.js` — Admin login
- `pages/api/auth/verify.js` — Session verification
- `pages/api/auth/login.js`, `logout.js` — Auth endpoints

### Data & Config
- `data/schema.sql` — Database schema (events, registrations, memberships, contact)
- `Claude outputs/content-table.sql` — CMS table definition
- `lib/i18n.js` — Translation keys (190+ strings)
- `lib/supabase.js` — Supabase client
- `next.config.js` — Next.js config (locale routing)

---

## Document Control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-09-26 | Claude Code | Initial content inventory |

**End of Inventory**
