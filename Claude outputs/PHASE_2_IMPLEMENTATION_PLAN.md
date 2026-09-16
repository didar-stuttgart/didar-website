# PHASE 2 IMPLEMENTATION PLAN
**Date:** September 17, 2026  
**Project:** DIDAR Website Phase 2 — Design System + Public UI Shell

---

## PHASE 2 OBJECTIVE
Build the complete visual foundation and public-facing UI shell for DIDAR.
Implement responsive, accessible, bilingual (Persian/German) user interface with no functional backend changes.

---

## SCOPE

### Pages to Build
1. ✅ Home (`/`) — Hero, events teaser, about teaser, membership CTA, footer
2. ✅ Events (`/veranstaltungen`) — Upcoming and past events list
3. ✅ Event Detail (`/veranstaltungen/[slug]`) — Full event display with placeholder form area
4. ✅ About (`/ueber-uns`) — Organization information
5. ✅ Membership (`/mitglied-werden`) — Membership concept with visual form placeholder
6. ✅ Contact (`/kontakt`) — Contact form UI (visual, not yet functional)
7. ✅ Impressum (`/impressum`) — Legal info (placeholder with guidance)
8. ✅ Datenschutz (`/datenschutz`) — Privacy policy (placeholder with guidance)

### Components to Build
- Header (responsive, with mobile hamburger menu)
- Footer (links, info, copyright)
- Language switcher (Persian/Farsi | Deutsch)
- Event card component
- Form components (reusable)
- Typography system
- Spacing/layout grid
- Color palette tokens
- Responsive images/placeholders

### Design System
- CSS architecture (organized variables, layout, components)
- Color palette (cream, olive, muted tones)
- Typography scale
- Spacing/grid system
- Component library
- Responsive breakpoints
- RTL/LTR support

### Not in Phase 2
- ❌ Functional form submissions (placeholder areas only)
- ❌ Database-driven content (static data in Phase 2)
- ❌ Admin interface for editing pages
- ❌ Event creation/management UI
- ❌ Actual registration backend integration
- ❌ Authentication pages (already exist in Phase 1)

---

## TECHNICAL APPROACH

### File Structure (New Files)
```
public/
  └── images/
      └── (placeholders for logos, images)

styles/
  ├── globals.css        — CSS variables, reset, base styles
  ├── layout.css         — Layout, grid, responsive
  ├── components.css     — Component styles
  └── rtl.css            — RTL-specific adjustments

lib/
  ├── i18n.js            — Language/translation utilities
  └── eventData.js       — Mock event data for Phase 2

components/
  ├── Header.js          — Navigation, language switch
  ├── Footer.js          — Footer with links
  ├── LanguageSwitcher.js
  ├── EventCard.js       — Reusable event display
  ├── FormField.js       — Form input wrapper
  ├── Button.js          — Button component
  └── Breadcrumb.js      — Optional navigation

pages/
  ├── index.js           — Home page (rewrite)
  ├── veranstaltungen/
  │   ├── index.js       — Events list
  │   └── [slug].js      — Event detail
  ├── ueber-uns.js       — About
  ├── mitglied-werden.js — Membership
  ├── kontakt.js         — Contact
  ├── impressum.js       — Impressum
  ├── datenschutz.js     — Datenschutz
  └── _document.js       — HTML document root (for RTL/LTR)

data/
  └── mockEvents.json    — Sample event data
```

### Design System Details

**Colors (CSS Variables)**
- `--color-cream`: #fdf7f2 (background)
- `--color-text-dark`: #2c2c2c
- `--color-olive`: #556b2f (primary accent)
- `--color-sage`: #6b8e6b (secondary)
- `--color-sand`: #c9b8a3
- `--color-beige`: #e8dcc8

**Typography**
- Serif font for headings (elegant, editorial)
- Sans-serif for body (readability)
- Responsive scales (mobile → desktop)
- Proper weights and line-height

**Spacing**
- 8px base unit (8, 16, 24, 32, 48, 64...)
- Generous whitespace
- Consistent gutters

**Responsive Breakpoints**
- Mobile: 320px–767px
- Tablet: 768px–1023px
- Desktop: 1024px+

---

## LANGUAGES & I18N

### Translation Approach
- Use simple i18n object (no heavy library in Phase 2)
- Persian as primary (default locale)
- German as secondary
- Language switch in header
- Store choice in localStorage or URL param

### Pages to Translate
- All page content
- Navigation
- Button labels
- Form labels & placeholders
- Form validation messages
- Status messages

### RTL/LTR Implementation
- Use `lang` attribute on `<html>`
- CSS `direction: rtl/ltr` on appropriate containers
- Flexbox/grid-based layout (responsive to direction)
- No hardcoded left/right margins
- Mirror layout where needed

---

## CONTENT & IMAGERY

### Logo
- Use official DIDAR logo exactly
- Preserve handwritten Persian mark
- No modification or reinterpretation
- Display in header, home hero, footer

### Event Data (Phase 2)
- Mock events JSON with sample data
- Structure: id, title_fa, title_de, date, time, location, image, description_fa, description_de, status
- Minimum 2-3 upcoming events, 2-3 past events

### Images/Placeholders
- Create `public/images/` folder
- Use logo/brand assets from DIDAR
- For missing event images: clean color-block placeholders with proper sizing
- Responsive image tags

### Content Guidance
- Home hero: Use placeholder text (marked as editable)
- About: Cultural presentation (use approved project context, no career framing)
- Membership: Explain concept and purpose
- Contact/Impressum/Datenschutz: Placeholder guidance (needs owner info)

---

## ACCESSIBILITY & QUALITY

### Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- `<nav>`, `<main>`, `<footer>` landmarks
- `<button>` for buttons (not `<div>`)
- Form `<label>` associations
- Alt text on all images

### Keyboard Navigation
- Tab order logical
- Focus visible on all interactive elements
- No keyboard traps
- Skip links if needed

### Color & Contrast
- WCAG AA minimum (4.5:1 for text)
- No color-only meaning
- Text not light gray on light background

### Mobile-First
- Build mobile first, enhance for larger screens
- Touch targets ≥44px
- No horizontal scroll
- Readable font sizes

### Testing
- Browser testing (Chrome, Firefox, Safari)
- Mobile device testing (iOS/Android)
- Keyboard navigation testing
- Responsive layout testing at breakpoints

---

## IMPLEMENTATION SEQUENCE

### Step 1: Setup Design System (Files: styles/*, globals)
1. Create CSS variables (colors, typography, spacing)
2. Reset and base styles
3. Layout/grid system
4. Responsive utilities
5. RTL/LTR support

### Step 2: Create Reusable Components (Files: components/*)
1. Header (with mobile menu)
2. Footer
3. Language switcher
4. Button, FormField, EventCard
5. Breadcrumb (optional)

### Step 3: Implement i18n Utilities (Files: lib/i18n.js, lib/eventData.js)
1. Create translation object (Persian + German)
2. Language context/provider
3. useTranslation hook
4. Mock event data

### Step 4: Build Public Pages (Files: pages/*)
1. Update _app.js for global layout
2. Create _document.js for document root
3. Home page (hero, events, about teaser, membership CTA)
4. Events list page
5. Event detail page
6. About page
7. Membership page
8. Contact page (visual form)
9. Impressum & Datenschutz (placeholders)

### Step 5: Integration & Polish
1. Language switching works end-to-end
2. Responsive layouts tested
3. RTL/LTR rendering verified
4. Keyboard navigation checked
5. Build succeeds, no lint errors
6. Performance reviewed

---

## NOT DOING IN PHASE 2

✗ Database-driven content (hard-coded mock data only)
✗ Form backend integration (visual form only)
✗ Admin interface for managing content
✗ Authentication pages (already exist)
✗ Real event images (placeholders OK)
✗ Analytics/tracking
✗ Heavy JavaScript interactions
✗ Changing Phase 1 API infrastructure
✗ Adding new dependencies beyond Next.js/React

---

## DELIVERABLES

By end of Phase 2:
1. ✅ Complete responsive design system (CSS variables, typography, spacing)
2. ✅ 8 public pages with full navigation
3. ✅ Header (desktop + mobile hamburger)
4. ✅ Footer
5. ✅ Language switcher (Persian ↔ German)
6. ✅ RTL/LTR layout support
7. ✅ Reusable component library
8. ✅ Mock event data
9. ✅ Responsive image system
10. ✅ Clean, accessible HTML
11. ✅ Passing build (`npm run build`)
12. ✅ Passing lint (`npm run lint`)
13. ✅ No new dependencies
14. ✅ All Phase 1 infrastructure unchanged

---

## TESTING CHECKLIST

- [ ] Home page loads and displays correctly
- [ ] All 8 pages accessible and render without errors
- [ ] Language switcher toggles Persian ↔ German
- [ ] All page content properly translated
- [ ] RTL layout correct for Persian
- [ ] LTR layout correct for German
- [ ] Mobile layout responsive (320px, 480px, 768px, 1024px)
- [ ] No horizontal scroll on mobile
- [ ] Touch targets ≥44px
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus states visible on all interactive elements
- [ ] Form placeholders present (not yet functional)
- [ ] Images load and scale responsively
- [ ] Header logo and branding correct
- [ ] Footer links present and correct
- [ ] Color contrast WCAG AA
- [ ] `npm run build` succeeds
- [ ] `npm run lint` succeeds
- [ ] No new console errors
- [ ] No Phase 1 files modified (except _app.js, index.js)

---

## EFFORT ESTIMATE

- Design system & components: 2-3 hours
- Page implementation: 4-5 hours
- i18n & language system: 1-2 hours
- Testing & refinement: 2-3 hours
- **Total: 9-13 hours** (can vary based on image handling and polish)

---

## SUCCESS CRITERIA

✅ Phase 2 is complete when:
1. All 8 pages render cleanly with responsive layouts
2. Language switching works end-to-end (Persian ↔ German)
3. RTL/LTR layout rendering is correct
4. Header (mobile & desktop) and footer present on all pages
5. Keyboard navigation functional
6. No Phase 1 infrastructure modified
7. Build and lint pass without errors
8. No new external dependencies added
9. Ready for Phase 3 (form backend integration)

---

## Next Phase (Phase 3 — Not Yet)
Will integrate form submissions, admin interface, and data display.

---

**Plan Created:** 2026-09-17 23:47 UTC  
**Status:** Ready to implement  
**Next Step:** Begin Phase 2 implementation
