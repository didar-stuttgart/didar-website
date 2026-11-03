# PROJECT STATE

Evidence-based project snapshot as of 2026-11-03.

Status labels:

- **Verified** — direct evidence supports the statement.
- **Implemented, not runtime-verified** — source/deployment evidence exists, but the relevant live behavior was not exercised.
- **NOT VERIFIED** — requires Production/Supabase/Resend evidence.
- **Known issue** — intentionally documented and not changed.

## 1. Current system

Bilingual DIDAR site, Persian default / German `/de`, Next.js 15.5.28 Pages Router, Supabase, Resend, Vercel.

Registration is manual-review:

- save submission immediately;
- notify admin;
- event registrants receive an acknowledgment/receipt;
- admin contacts people manually;
- no automated confirmation of attendance;
- no automatic capacity enforcement.

## 2. Verified from repository/deployment evidence

| Area | Status |
|---|---|
| Repository default branch | Verified: `main` |
| Main HEAD | Verified: `0c6cb98d288e6e0ee026a6ba902cc76e913b3e09` |
| Current Production deployment | Verified: READY deployment `dpl_9H4DxWc3hT44yfK5giN2g5DhvGaJ` |
| Current Production source | Verified: branch `feature/event-upload-custom-slugs`, commit `0b1379e...` |
| Next.js version | Verified: `^15.5.28` in `package.json` |
| Custom event slug implementation | Verified in source |
| Event image upload implementation | Verified in source |
| Event image Storage migration file | Verified in repository |
| Event mutation revalidation helper | Verified on current Production commit |
| Registration self-cancellation flow | Verified in source |
| Partial unique index migration for re-registration | Verified in repository SQL |
| Homepage `admin_notes` stripping | Verified in source |

## 3. Recent Production/source relationship

`main` and the currently deployed feature branch are not identical.

The Production deployment uses `0b1379e...`, which adds `lib/revalidate-event-pages.js` and wires it into event create/update/archive APIs.

The default `main` commit `0c6cb98...` does not contain that final revalidation helper commit.

Do not document these states as equivalent until the feature branch is merged.

## 4. NOT VERIFIED

- migration 013 is applied to Supabase Production;
- migration 014 is applied to Supabase Production;
- `event-images` bucket exists and is correctly configured in Production;
- current inbox delivery for a fresh email test;
- current rendered HTTP payload for homepage/event detail after the latest deployment;
- live behavior of the known event auto-open issue;
- exact Vercel log retention;
- current Supabase backup retention/restore posture.

## 5. Known issues — do not change casually

1. Event detail may auto-open `registration_status='not_open'`.
2. Closed-registration 409 is surfaced as the duplicate-registration message.
3. Capacity-status counts legacy `verified` rows and is therefore ineffective for the current manual model.
4. Recurring events without a date are classified as upcoming.
5. `registration_deadline` is stored but unused.
6. Registration CSV event column reads `reg.event` and is empty.
7. `/api/admin/fix-event-status` is a hard-coded legacy admin endpoint.
8. Direct anon INSERT grants remain in repository SQL.
9. PBKDF2 remains at 10,000 iterations.
10. No global login throttle or CAPTCHA.
11. No CSP.
12. Some legacy/dead code remains.

## 6. Owner decisions pending

- password-hash migration strategy;
- revoke direct anon INSERT privileges;
- personal-data retention/deletion policy;
- privacy/legal review of current receipt email and processors;
- remove the hard-coded fix endpoint;
- remove legacy/dead code;
- decide how `organization_settings` should drive public content;
- resolve the remaining CMS key mismatch documented in [CMS_ARCHITECTURE.md](CMS_ARCHITECTURE.md).

## 7. Canonical documentation

Authoritative:

- [README.md](README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DATABASE.md](DATABASE.md)
- [FORMS.md](FORMS.md)
- [EVENTS_AND_REGISTRATION.md](EVENTS_AND_REGISTRATION.md)
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [SECURITY.md](SECURITY.md)
- this file

Supplementary files intentionally point back to this set instead of maintaining independent architectural claims.
