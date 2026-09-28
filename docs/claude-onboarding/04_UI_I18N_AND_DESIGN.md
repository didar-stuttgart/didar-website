# UI, Internationalization, and Design

## Language System

### Supported Languages

- **Persian (Farsi)** — Language code: `fa` — Direction: RTL (right-to-left)
- **German (Deutsch)** — Language code: `de` — Direction: LTR (left-to-right)

### Current Language State

Retrieved via hook or context in React components:
```javascript
const currentLang = useLanguage(); // returns 'fa' or 'de'
```

### Language Switcher Component

**Location:** Header (visible on all pages)

**Appearance:** Compact pill-shaped toggle
- Two buttons: "FA" and "DE"
- Active button shows dark olive/green background with white text
- Inactive button shows light background with dark text
- Visual divider between buttons

**Behavior:**
- Clicking button changes language on current page
- Content re-renders in selected language
- RTL/LTR layout automatically updates
- Language choice persists via URL query parameter: `?lang=fa` or `?lang=de`
- Default language: German (when no query param)

### Content Localization

#### Static Text (lib/i18n.js)

All static, user-facing text is stored in `lib/i18n.js` as a multilingual object:

```javascript
const translations = {
  fa: {
    nav_home: 'خانه',
    nav_events: 'رویدادها',
    nav_about: 'درباره ما',
    // ... hundreds more
  },
  de: {
    nav_home: 'Startseite',
    nav_events: 'Veranstaltungen',
    nav_about: 'Über uns',
    // ...
  }
}
```

Components access text via:
```javascript
const text = translations[currentLang]['key'] || translations.de['key'];
```

#### Dynamic Content (Database)

Events and CMS content are stored bilingually in Supabase:

**Events table:**
```
title_fa, title_de
description_fa, description_de
location_fa, location_de
```

**CMS content table:**
```
content_fa, content_de
```

Frontend fetches data and displays the appropriate language column based on `currentLang`.

#### Specific Content Examples

**Stuttgart Spelling:**
- German: "Stuttgart"
- Persian: "اشتوتگارت" (note: THIS IS THE CORRECT SPELLING; old spelling "شتوتگارت" was incorrect and has been fixed)

This appears in:
- Footer (DIDAR office location)
- Impressum (legal imprint)
- Home page about text

---

## RTL/LTR Handling

### Persian (RTL)

When language is `fa`:
- Text flows right-to-left
- Layouts should align content to the right
- Flexbox direction may need reversing: `flex-direction: row-reverse`
- Margins/padding: be careful with left/right (may need swapped)
- Numbers and emails still render left-to-right within Persian text

### German (LTR)

When language is `de`:
- Text flows left-to-right (standard)
- Layouts align content to the left
- Standard CSS works as written
- No special RTL considerations

### CSS Strategy for Bilingual

Use inline styles or CSS classes that respond to language:

```javascript
<div style={{
  direction: currentLang === 'fa' ? 'rtl' : 'ltr',
  textAlign: currentLang === 'fa' ? 'right' : 'left',
  flexDirection: currentLang === 'fa' ? 'row-reverse' : 'row'
}}>
  Content
</div>
```

Or use data attributes with CSS:

```css
[data-lang="fa"] {
  direction: rtl;
  text-align: right;
}
[data-lang="de"] {
  direction: ltr;
  text-align: left;
}
```

---

## About Page (`/ueber-uns`)

**File:** `pages/ueber-uns.js`

**Language Equivalents:**
- German: `/ueber-uns`
- Persian: `/درباره-ما` (if Persian routing enabled)

### Page Structure (CORRECT ORDER)

1. **Header/Title** — "Über Didar" / "درباره دیدار"
2. **About Story Section** — Main text explaining DIDAR's mission and history
   - Content fetched from CMS or hardcoded in `lib/i18n.js`
   - Bilingual text
3. **Founders Section** — Comes AFTER main about text
   - Heading: "Gründer" / "بنیان‌گذاران"
   - Two founder cards displayed SIDE-BY-SIDE on desktop/tablet
   - Cards stack vertically on mobile
   - Each card contains:
     - Founder image (80–100px)
     - Founder name
     - Optional short bio or role

### Founder Implementation

**Founder Images:**
- Stored in: `public/images/Avid.jpg` and `public/images/Danial.jpg`
- Size: ~80–100px width (square or portrait)
- Format: JPEG

**Founder Cards Layout:**
```javascript
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 'var(--space-12)',
  maxWidth: '500px',
  margin: '0 auto'
}}>
  {/* Each founder card: image + name */}
</div>
```

**CSS Grid Behavior:**
- Desktop/Tablet: 2 columns (side-by-side)
- Mobile: 1 column (vertical stack)
- Responsive via `repeat(auto-fit, minmax(200px, 1fr))`

### Important: Correct Section Order

**WRONG (Old):**
```
Founder cards (left)  |  About text (right)
Vertical stacking on desktop
```

**CORRECT (Current):**
```
About Didar
[Main about text]

Gründer
[Founder 1]  [Founder 2]  (side-by-side on desktop, stacked on mobile)
```

The "About DIDAR" text comes FIRST, then "Founders" section appears AFTER.

---

## Navigation

### Main Navigation

**Location:** Header on all pages

**Items:**
- Home (Startseite / خانه)
- Events (Veranstaltungen / رویدادها)
- Membership (Mitglied werden / عضویت)
- About (Über uns / درباره‌ما)
- Contact (Kontakt / تماس)

**Behavior:**
- Responsive: collapses to hamburger menu on mobile
- Language-aware: displays in current language
- Active page highlighted

---

## Footer

**Location:** Bottom of all pages

**Content:**
- DIDAR organization info
- Office location: Stuttgart
- Links to social media (if any)
- Copyright notice
- Language switcher (usually present)
- Link to Impressum (legal)
- Link to Datenschutz (privacy)

**RTL/LTR:** Footer layout should respect current language direction

**Padding:**
- Reduced padding in current implementation: `var(--space-8) 0 var(--space-4)` (was previously `var(--space-12) 0 var(--space-6)`)

---

## Responsive Design

### Breakpoints

Next.js and CSS use standard breakpoints (no custom breakpoints specified):

- **Mobile:** < 640px
- **Tablet:** 640px – 1024px
- **Desktop:** > 1024px

### Key Responsive Components

#### Events Grid
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column

#### Founder Cards
- Desktop/Tablet: 2 columns (side-by-side)
- Mobile: 1 column (stacked)

#### Forms
- Full width on all devices
- Input fields stack vertically

---

## Design System

### Colors

**Primary Palette:**
- Dark Olive/Green (active states, primary buttons)
- Light background (off-white or cream)
- Dark text (charcoal or black for readability)

**Semantic Colors:**
- Success: Green
- Error: Red
- Warning: Orange/Yellow
- Info: Blue

### Typography

**Font Stack:** (assumes standard web fonts)
- Headings: Sans-serif (system fonts or Google Fonts)
- Body: Sans-serif (system fonts or Google Fonts)

**Sizes:**
- H1: Large, 28–32px
- H2: Medium, 20–24px
- H3: Small, 16–20px
- Body: 14–16px
- Small: 12–14px

### Spacing System

Consistent spacing scale using CSS variables:
```css
--space-4: 4px
--space-6: 6px
--space-8: 8px
--space-12: 12px
--space-16: 16px
--space-24: 24px
--space-32: 32px
```

### Spacing Usage

- Margins between sections: `var(--space-16)` to `var(--space-24)`
- Padding inside containers: `var(--space-12)` to `var(--space-16)`
- Gap in grids/flexbox: `var(--space-12)`

---

## Styling Files

### Stylesheets

- `styles/global.css` — Global styles, resets, CSS variables
- `styles/components.css` — Component-specific styles
- Inline styles: Many components use inline `style` prop for dynamic/responsive layouts

### CSS Variables

Defined in global stylesheet:
```css
:root {
  --space-4: 4px;
  --space-6: 6px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  
  --color-primary: #[green];
  --color-text: #[dark];
  --color-bg: #[light];
}
```

---

## Pages and Routes

### Public Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | `pages/index.js` | Home page |
| `/veranstaltungen` | `pages/veranstaltungen/index.js` | Event listing |
| `/veranstaltungen/[slug]` | `pages/veranstaltungen/[slug].js` | Event detail + registration form |
| `/mitglied-werden` | `pages/mitglied-werden.js` | Membership application |
| `/kontakt` | `pages/kontakt.js` | Contact form |
| `/ueber-uns` | `pages/ueber-uns.js` | About page with founders |
| `/impressum` | `pages/impressum.js` | Legal imprint |
| `/datenschutz` | `pages/datenschutz.js` | Privacy policy |

### Admin Pages

| Route | File | Purpose |
|-------|------|---------|
| `/admin` | `pages/admin/index.js` | Admin dashboard |
| `/admin/login` | `pages/admin/login.js` | Admin login |
| `/admin/events` | `pages/admin/events/index.js` | Event management |
| `/admin/events/[slug]` | `pages/admin/events/[slug].js` | Edit event |
| `/admin/registrations` | `pages/admin/registrations.js` | Registration dashboard |
| `/admin/memberships` | `pages/admin/memberships.js` | Membership dashboard |
| `/admin/settings` | `pages/admin/settings.js` | Settings (organization info, etc.) |

---

## Accessibility

### General Principles

- Semantic HTML (proper heading hierarchy, alt text for images)
- Color contrast: WCAG AA compliant (4.5:1 for body text)
- Keyboard navigation: All interactive elements keyboard-accessible
- Forms: Labels, error messages, required indicators

### Images

- Event images: alt text describing event
- Founder images: alt text naming founder
- Decorative images: `alt=""` (empty)

### Forms

- Input labels associated with fields (via `<label for="id">`)
- Error messages positioned near fields
- Required fields marked with asterisk or `required` attribute

---

## Language-Specific Conventions

### Persian Formatting

- Uses Persian numerals (۰۱۲۳۴۵۶۷۸۹) OR Arabic numerals (0123456789) — current implementation uses Arabic numerals for consistency
- Dates: Day/Month/Year order (Persian calendar or Gregorian)
- Currency: if needed, uses Persian Rial symbol

### German Formatting

- Uses German numerals (0–9)
- Dates: typically DD.MM.YYYY format
- Uses German keyboard characters (ß, ü, ö, ä)

---

## Key Implementation Files

- `lib/i18n.js` — All translations and language logic
- `pages/ueber-uns.js` — About page with founders section
- `pages/index.js` — Home page
- `components/Header.js` — Navigation and language switcher
- `components/Footer.js` — Footer with location and legal links
- `styles/global.css` — Global styles and CSS variables
- `styles/components.css` — Component styles

