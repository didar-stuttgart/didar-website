# PROJECT STATE

Snapshot of what works, what is unverified, and what is open. Last audit: 2026-10-17. The code is the source of truth; if this file and the code disagree, fix this file.

Related: [README.md](README.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DATABASE.md](DATABASE.md) · [FORMS.md](FORMS.md) · [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md) · [ADMIN_GUIDE.md](ADMIN_GUIDE.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [SECURITY.md](SECURITY.md)

Status words: **Verified** (tested in a real run) · **Implemented, not verified** (in code, not exercised end to end) · **Planned** (not built) · **Blocked** (needs owner action) · **Known issue** (documented, intentionally not changed).

## 1. Current system

Bilingual site (FA default, DE under `/de`), Next.js 15 Pages Router, Supabase, Resend, Vercel (deploys on push to `main`). Registration is **manual**: submissions are saved at once, the admin is notified by email, the admin contacts people. No verification token, no capacity enforcement, no confirmation requirement. Event registrants additionally receive an acknowledgment/receipt email with a self-cancel link (it is not a confirmation of a place).

## 2. Verified

| Area | Evidence |
|---|---|
| Event registration → DB row → admin email → receipt email → self-cancellation, on production | Run with the authorised test address `ali.yarahmadian@gmail.com`; all steps observed |
| Receipt email deliverability | Gmail "Show original": SPF, DKIM, DMARC pass; `multipart/alternative` text + HTML |
| Repeat-email field on the three forms (mismatch blocked, match accepted, field not sent) | jsdom harness against a local build |
| Updated success messages and receipt disclaimer wording | Local build/harness |
| `npm run build` | Re-run in the 2026-10-17 audit (see final report) |
| Admin API returns 401 without a session | Checked on production |
| Secret pattern scan of tracked files and history | Clean (placeholders only); pattern-based |

## 3. Implemented, not verified

- Membership and contact submissions end to end on production after the latest changes (code path identical in structure; run one real submission to confirm).
- Anon `INSERT` grants and policies exactly as in the migrations (production catalog not re-queried).
- `getStaticProps` auto-opening a `not_open` event (see [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md#8-known-issues-documented-not-fixed)): whether the database update persists with the publishable key is not verified.
- `npm audit` / dependency currency.
- Behaviour of Vercel log retention.

## 4. Blocked (needs the owner)

- **German hero title** is CMS-driven; the text "Didar / Kultur- und Kunstverein Stuttgart" must be edited in `/admin/content` by the owner (the subtitle is already in code).
- Admin login requires the owner's password; it is not entered by the assistant.

## 5. Known issues (documented, not fixed)

1. Event page may reopen registration (`not_open` → `open`) via `getStaticProps` after an admin set it — see events doc. Not changed unless the owner asks.
2. `capacity-status` counts only `verified` rows, so it reports "not full" always; capacity is intentionally not enforced.
3. *(Fixed in working tree, not yet deployed)* Home page data used to include `admin_notes`.
4. `anon` can still INSERT directly into the three form tables.
5. *(Cookie `Secure`, login throttle, log cleanup, constant-time compare: fixed in working tree, not yet deployed.)* PBKDF2 still uses 10,000 iterations; `npm audit` reports 4 dependency findings (priority: `next` 15.5.25 → 15.5.28 for ISR cache-poisoning advisories); no CSP; `/api/admin/fix-event-status` is a hard-coded one-off endpoint (admin-only).
6. CSV exports: event column empty (formula injection fixed in working tree).
7. CMS key mismatch: code reads `homepage.about.description`, the CMS row is `homepage.about_card.description`.
8. Legacy admin endpoints: `/api/admin/content` references a nonexistent `content` table; `/api/admin/settings` is in-memory only. `organization_settings` is not read by any public page.
9. Recurring events without a date are categorised as upcoming; `registration_deadline` is unused.
10. A closed-registration 409 shows the "already registered" message.
11. No runnable automated tests (jest is configured in neither dependencies nor scripts).
12. Dead code: `lib/email.js`, `lib/verification.js`, `lib/session-store.js`, `requireAdmin` in `lib/middleware.js`; the `resend` package is unused (REST `fetch` is used).

## 6. Owner decisions pending

- Reply-To address for the receipt email; DMARC `rua` reporting address.
- Whether a cancelled registrant may re-register with the same email.
- Retention/deletion policy and tooling for personal data.
- Revoke anon INSERT on form tables? Stop embedding `admin_notes` on the home page?
- Keep or remove the event auto-open behaviour.
- Remove dead code and unreferenced images (see §7).
- Legal text for the Hochschulgruppe wording; Privacy Policy review now that an acknowledgment email is sent (owner/legal review, not an assistant decision).
- Purpose of `organization_settings`; resolve the CMS key mismatch.

## 7. Supplementary Markdown files

The nine canonical documents (README, ARCHITECTURE, DATABASE, FORMS, EVENTS_AND_REGISTRATION, ADMIN_GUIDE, DEPLOYMENT, SECURITY, PROJECT_STATE) are authoritative. Other files are kept, **not deleted**, and are historical/unverified:

| File | Status |
|---|---|
| `ONBOARDING.md`, `SETUP_GUIDE.md` | Stale (pre-manual-registration wording); superseded by README/DEPLOYMENT |
| `SUPABASE_ARCHITECTURE.md`, `CMS_ARCHITECTURE.md` | Stale design notes; superseded by DATABASE/ARCHITECTURE |
| `CONTENT_INVENTORY.md` | Content snapshot; may help owners, not verified |
| `docs/claude-onboarding/*` | Used by the Claude project; leave untouched |

Cleanup of 2026-10-17: removed `test_inspection.sh`, `pages/registrations/verify.js.backup`, `styles/verify.module.css` (obsolete verification-architecture leftovers, no references, recoverable from Git). Left for owner confirmation: the dead libs above, `scripts/tmp/insert_events.js`, `update-event-descriptions.sh`, `.claude/launch.json`, unreferenced images `Critical_Thinking_Workshop.png`, `about-culture.jpg`, `membership-benefits.jpg`. Images referenced by production events through the database must be kept.

## 8. Suggested next tasks (one phase at a time)

1. Owner edits the German hero title in the admin CMS; verify `/de`.
2. Stop embedding `admin_notes` on the home page (small, safe fix).
3. Revoke anon INSERT on the form tables after confirming the RPCs cover all paths.
4. Admin hardening: `Secure` cookie, login rate limit, remove token logging.
5. Privacy Policy review by the owner/legal.
6. Add minimal automated tests; optionally remove dead code.
