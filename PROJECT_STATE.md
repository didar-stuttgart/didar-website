# PROJECT_STATE

## Current Phase
**PHASE 11 — UX/UI CORRECTION PASS** (COMPLETE, not yet deployed — local edits awaiting owner push, and one Supabase database change awaiting owner action)

## Note on this file (September 19, 2026)

This file had not been updated in the actual project folder since Phase 1 — it was stuck describing an early infrastructure stage while the real code had moved through many more phases. The up-to-date phase history was being kept only in the Claude Project's notes, not in this file. This has now been corrected: this file is synced to match the Project's notes, with one correction below (item 7).

**Correction to Item 7 below:** the note says a `components/CultureIcons.js` file was created to replace emoji icons in a homepage "Cultural Areas" section. That section does not exist in the current homepage (`pages/index.js`) — it was removed/merged into a simpler "About + Membership" layout at some point, and `CultureIcons.js` was never actually created. This is not a bug to fix; it just means Item 7 is no longer applicable to the current homepage design. No action needed unless a future redesign brings back per-category cultural icons.

## Latest Update (September 19, 2026)

### PHASE 11: 10-item focused correction pass on the current main branch

A targeted bug-fix pass (not a redesign) fixing 10 specific UX/UI issues the owner identified, in order.

**1. Persian desktop hero position (P1) — fixed.** The RTL hero rule used `margin-inline-end: auto`, which means "left" in RTL, so Persian hero text was silently moving to the physical *left* side of the photo instead of staying on the right where the photo's empty space actually is. Replaced with a single physical `margin-left: auto` rule that applies to both languages, since the photo itself never mirrors. Also found and fixed two related bugs in the same area while checking this: the hero CTA buttons had `dir="rtl"` overrides forcing them to `flex-end`, which was backwards — flexbox's `flex-start`/`flex-end` already resolve correctly per language on their own, so the overrides were removed.

**2. RTL split-content direction (P1) — fixed.** `.split-content` and `.split-image` (used by About/Membership/homepage split sections) had a hardcoded `direction: ltr` that silently overrode the correct language-aware direction inherited from the parent `.split-grid`. Removed both hardcoded rules so these sections now correctly flip to RTL in Persian.

**3. Persian copy quality (P1) — fixed.** Rewrote the four flagged unnatural/incorrect strings plus one more found during a broader review of `lib/i18n.js`: home subtitle (removed "شاهکارهای فرهنگی ایرانی"), about mission text (replaced the Arabic loanword "حوار" with proper Persian "گفتگو"), membership intro, footer/legal Impressum label, and the homepage membership-section heading. The Persian org name (`انجمن فرهنگی هنری دیدار`) and brand name (`دیدار`) were preserved everywhere as required.

**4. Event status logic (P1) — fixed, required one small database change.** The Supabase `events` table only had a single true/false `registration_open` field, which cannot distinguish "not opened yet" from "was open and is now closed" — both looked identical in the data. Asked the owner how to resolve this; they chose to add a new field. Added `registration_status` (`not_open` / `open` / `closed`) alongside the old field (which is left in place, unused, for safety). Updated the event list cards, the event detail page, the registration API's server-side gate, and the admin edit form (now a 3-option dropdown instead of a checkbox) to all use the new field consistently, so the visible status, message, and registration form/button always describe the same real state. **Owner action needed — see below.** Confirmed in code review: `registration_status` is correctly read in `components/EventCard.js` and `pages/veranstaltungen/[slug].js`.

**5. Bilingual architecture (P1) — fixed.** The site already had proper Next.js locale routing configured (`fa`/`de` in `next.config.js`) but `pages/_app.js` was ignoring it entirely, deciding which language to show from `localStorage` instead — set only after the page loaded, via client-only `useEffect`. This meant a direct link to a German page could still flash Persian content, and language selection wasn't tied to the URL at all. Rewired `_app.js` so the current language is now read directly from Next's own `router.locale` (available immediately on both server and client, no race), and the language switcher now navigates via Next's router with the new locale while staying on the same page. `localStorage` is kept only as a harmless "remember last choice" convenience; it no longer decides what's shown. No new dependencies, no routing structure changes, no Supabase changes. Confirmed in code review: `pages/_app.js` reads `router.locale`.

**6. Hero typography (P1) — fixed.** Found the actual cause of the "too much visual weight" on desktop: the hero heading/tagline/description were using the site's generic heading size tokens, which scale up to 72px / 32px / 24px on desktop — well above any reasonable hero scale. Gave the hero its own smaller desktop sizes (~48–56px title, ~22px tagline, ~18–20px description), matching the requested brand → headline → supporting sentence → CTA hierarchy. Mobile sizes were already within the requested range and were left as-is.

**7. Emoji cultural icons (P2) — superseded, see correction note above.** A homepage "Cultural Areas" section with emoji icons no longer exists on the current homepage, so there is nothing to fix here. `components/CultureIcons.js` was not created.

**8. Lazy-image loading CSS (P2) — fixed.** `img[loading='lazy']:loaded` was not a real CSS selector, so the shimmer loading animation never actually turned off — it ran forever on every lazy image (wasted battery/CPU, and ignored motion preferences), even though the loaded photo visually covers it. Replaced with a short, finite animation (runs twice, then stops on its own) that's skipped entirely for anyone with "reduce motion" turned on in their system settings.

**9. Email/domain inconsistency (P1) — found and fixed.** Found 6 public occurrences: `contact@didar-stuttgart.de` (Kontakt page, Footer) and `info@didar-stuttgart.com` (Impressum, Datenschutz, already correct). Asked the owner which is correct; they confirmed `info@didar-stuttgart.com`. Updated Kontakt and Footer to match. Also wrapped the email address in `dir="ltr"` everywhere it appears inside Persian (RTL) text, so it doesn't get visually reordered.

**10. Conflicting CSS cleanup (P2) — one genuine conflict found and fixed.** Audited all 5 stylesheets for the flagged selectors. `.form-group` and `.form-label` were defined twice — once in `components.css`, once (slightly different, with its own font-size) in `enhancements.css`. Since `enhancements.css` loads later, its version was the one silently winning; removed the dead duplicate from `components.css` rather than the active one, so the visible design is unchanged. Confirmed in code review: `components.css` now only contains a comment noting the removal, and `enhancements.css` holds the one active copy. No other genuine duplicates found among `.container-split`, `.split-grid`, `.split-content`, hero rules, or button rules — those exist in one place each already.

**Files changed:** `styles/enhancements.css`, `styles/components.css`, `lib/i18n.js`, `components/EventCard.js`, `pages/veranstaltungen/[slug].js`, `pages/api/registrations/submit.js`, `pages/api/admin/events/index.js`, `pages/api/admin/events/[slug].js`, `pages/admin/events/index.js`, `pages/admin/events/[slug].js`, `pages/kontakt.js`, `components/Footer.js`, `pages/impressum.js`, `pages/datenschutz.js`, `pages/_app.js`, `pages/index.js`, `data/schema.sql`, `scripts/tmp/insert_events.js`
**Files created:** `Claude outputs/migration-registration-status.sql` (the SQL for the owner to run) — `components/CultureIcons.js` was NOT created (see Item 7 correction above)
**Files deleted:** none

**Verification:** `npx next lint` — 0 errors (same pre-existing warnings as before, no new ones). `npx next build` — same environment-only failure as every previous phase (`Failed to load SWC binary for linux/x64`; this cloud sandbox lacks the Windows-matching binaries the owner's real machine has). Type-checking and linting both completed successfully before hitting that wall. Verified by careful code review and by tracing through the CSS cascade/load order for the conflicting-rule findings; could not visually render the site at the requested breakpoints in this session.

**Owner action required (in order):**
1. **Run one SQL snippet in Supabase** to add the new event registration-status field. Open your Supabase project → SQL Editor → New query → paste the contents of `Claude outputs/migration-registration-status.sql` → Run. This is safe and does not delete anything; it only adds a new field and fills it in sensibly from the old one.
2. In the admin panel, for any event where registration was already open and has since ended, change its "وضعیت ثبت‌نام" (registration status) dropdown from the old checkbox behavior to explicitly "بسته شده" (closed) — the migration cannot know this on its own, since the old data didn't record it.
3. Review the diff, then commit and push to `main` as usual — Vercel will auto-build and deploy.

**Remaining known items:**
- The old `registration_open` boolean column is still in the database, unused by the app now. Safe to leave; can be dropped later once confirmed nothing else depends on it.
- Real pixel-level rendering at the requested breakpoints (1440/1280/1024/390/375/320px) was not verified in this session — same tooling limitation as every previous phase; all fixes were verified by source-level review instead.

---

## PHASE 12 — CODEBASE CLEANUP AUDIT (September 19, 2026)

A housekeeping pass at the owner's request ("check the folder, remove anything not needed, update anything needed, do a full audit"), done by inspecting the actual files directly (the local shell tool on the owner's computer was unavailable for parts of this session, so `git status` could not be run — findings below come from reading file contents directly).

**Fixed:**
- Removed `data/mockEvents.json` — dead file, no longer imported anywhere; all event data comes from Supabase now.
- Removed the broken `"export": "node scripts/export-registrations.js"` line from `package.json` — that script file does not exist (registration/membership CSV export now happens through the admin panel's own export buttons, `pages/api/admin/registrations/export.js` and `pages/api/admin/memberships/export.js`).
- Synced this file (`PROJECT_STATE.md`) into the actual project folder for the first time since Phase 1 — it had been silently stuck describing Phase 1 in the folder while later phases were only recorded in the Claude Project's notes. Going forward this file should be the copy kept in the folder itself.
- Removed ~30 leftover one-off status/report files (`ADMIN_CONTENT_FIX.md`, `PHASE_1_COMPLETE.md`, `BEFORE_AFTER_COMPARISON.md`, and similar, both at the project root and inside `Claude outputs/`) — these were historical AI session notes, not anything the running website needs. Kept `README.md`, `SECURITY.md`, `SETUP_GUIDE.md`, `SUPABASE_ARCHITECTURE.md`, and `PROJECT_STATE.md` as the real reference docs, and kept every `.sql` migration file in `Claude outputs/` (including the still-pending `migration-registration-status.sql`) since those are not just notes.

**Confirmed correct, no change needed:**
- `.gitignore` properly excludes `.env.local` and other secret files — no credentials at risk of being committed.
- `registration_status` (Phase 11 item 4) is correctly wired through `components/EventCard.js` and `pages/veranstaltungen/[slug].js`.
- `pages/_app.js` correctly reads `router.locale` (Phase 11 item 5).
- The `.form-group`/`.form-label` duplicate CSS fix (Phase 11 item 10) is correctly in place.

**Also generated during this pass:** `ONBOARDING.md` and `ARCHITECTURE.md`, written directly into the project folder — a plain-language onboarding guide and a technical architecture reference, respectively, for anyone new taking over the project.

**Critical bug found and fixed:** the admin panel's login (`pages/api/auth/login.js`, via `lib/session-store.js`) and every admin data API route (`/api/admin/stats`, `/events`, `/registrations`, `/memberships`, `/content`, `/settings`, via `lib/api-middleware.js`) were checking two separate, disconnected in-memory session stores. A session created at login was invisible to every admin data endpoint, so after logging in, the admin dashboard and every admin page likely failed to load their data with "Unauthorized." Fixed by pointing `lib/api-middleware.js` at the same session store used by login/logout/verify (`lib/session-store.js`), removing the now-dead duplicate session-tracking code from `lib/admin-auth.js` (its password-hashing functions were kept — only the session code was removed), and updating the unused `lib/middleware.js` helper to reference the correct store and cookie name for consistency, in case it's used later. Full details in `ARCHITECTURE.md`, section 4.

**Owner action needed for this fix:** please log in to the admin panel once after this is deployed and confirm the dashboard stats and each admin section (Events, Registrations, Memberships, Content, Settings) load data correctly — this could not be tested live in this session (no way to run the dev server from here).

## Previous Phase History

### PHASE 10 — BRAND/VISUAL CONSISTENCY PASS (COMPLETE, implemented by owner)
Replaced the logo everywhere with the official asset, fixed Instagram/Telegram links and icons, rebuilt the homepage hero (desktop two-zone layout, separate mobile composition, Vazirmatn/Lalezar typography), integrated 6 previously-unused images, standardized the Persian org/brand name.

### PHASE 9.2 — FINAL POLISH PASS (COMPLETE, implemented by owner)
Fixed the redundant homepage title, safely removed 4 verified-dead CSS classes, fixed a live-verified RTL footer bug, added `overflow-wrap: break-word` as a defensive mobile safeguard, and did a source-level mobile/RTL audit.

### PHASE 9.1 — LIVE PRODUCTION QA AUDIT & TARGETED FIXES (COMPLETE, implemented by owner)
Fixed 3 P1 issues found by auditing the live deployed site: hydration errors from unpinned timezone in date formatting, a CSS flexbox stretch bug on the "coming soon" badge, and hardcoded non-mirroring directional arrows.

### PHASE 9 — UX HIERARCHY, NAVIGATION & ACCESSIBILITY PASS (COMPLETE, deployed and confirmed live)
Rebuilt homepage hero hierarchy and structure, fixed header/nav semantics and mobile menu styling, added accessibility fixes (focus states, alt text, aria labels), added event card metadata display, switched to 3-column grids, optimized logo assets (since superseded by Phase 10's official logo).

### PHASE 8 — BUG FIXES (VERIFICATION COMPLETE)
Content API integrated with Supabase; events table created and populated.

### Completed Phases (from prior sessions)
- **Phase 7:** QA audit and production verification
- **Phase 6:** Privacy & legal compliance
- **Phase 3C:** UI/UX enhancements
- **Phase 3B:** Admin dashboard
- **Phases 1-3A:** Public pages, forms, setup

---

## Technical Details (carried over)

### Events Data Flow
1. **Build Time (getStaticProps):** Next.js calls Supabase directly during build, returns published/future events, builds static HTML.
2. **Runtime (Browser):** Pre-rendered HTML served; no client-side API calls needed.
3. **Cache Revalidation:** Every 1 hour (`revalidate: 3600`), or immediately on redeploy.

### Events Registration Status (as of Phase 11)
- `registration_status` (`not_open` | `open` | `closed`) is now the source of truth for what's shown to visitors and what the registration API allows.
- `registration_open` (old boolean) still exists in the database but is no longer read anywhere in the app.

### Bilingual Routing (as of Phase 11)
- Language is driven by Next.js's own locale routing (`next.config.js`: locales `fa`/`de`, default `fa`), read via `router.locale` in `pages/_app.js`.
- `localStorage` only remembers the last choice for convenience; it never overrides what a URL asks for.

### Security (RLS Policies)
- Publishable key in frontend code: limited by RLS.
- Admin key on server: full database access for management.
- Public can only SELECT published events; cannot write.

### Deployment Status
- Phases 9, 9.1, 9.2, 10 confirmed implemented/deployed.
- Phase 11 (UX correction pass) and Phase 12 (this cleanup) are sitting as local edits in the connected working folder awaiting the Supabase SQL step and owner review/push.
