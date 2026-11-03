# ADMIN GUIDE

What the current admin interface does.

## 1. Login

- URL: `/admin/login`
- One shared admin password, stored as `ADMIN_PASSWORD_HASH`.
- Successful login creates a DB-backed session in `admin_sessions`.
- Cookie: `session_token`, HttpOnly, SameSite=Lax; Production adds Secure.
- There is no password-reset UI, per-user admin account model, or 2FA.

## 2. Dashboard

`/admin` shows counts for upcoming published events, recent registrations and recent membership applications.

## 3. Events

Routes: `/admin/events`, `/admin/events/[slug]`.

### Create/edit

The form supports:

- title FA/DE
- optional custom slug
- descriptions FA/DE
- dated vs recurring
- date/time
- locations FA/DE
- capacity
- remaining capacity
- registration deadline
- event image upload or manual image URL/path
- registration status
- event status
- admin notes

### Custom slug behavior

- New event + blank slug -> automatic slug from Persian title.
- New event + custom slug -> validated and stored.
- Existing event + non-empty slug -> URL changes to the new slug.
- Existing event + blank/omitted slug -> current slug is preserved.
- Duplicate slug -> HTTP 409.
- There is no automatic redirect from the previous slug.

### Image upload

The upload endpoint is `POST /api/admin/events/upload-image`.

- Admin session required.
- JPEG, PNG and WebP only.
- Maximum 5 MB.
- Server validates the binary signature.
- Upload target: Supabase Storage bucket `event-images`.
- The returned public URL is saved in `events.image_url` when the event is saved.

The upload endpoint returns 503 if the bucket is missing or not public-read. Whether the bucket exists in Production is **NOT VERIFIED**.

### Event mutation caching

The current Production deployment explicitly revalidates the home page, event list and affected event detail path after successful create/update/archive mutations. This is implemented in `lib/revalidate-event-pages.js`.

## 4. Registrations

Route: `/admin/registrations`.

The page supports:

- event filter dropdown;
- sorting within the loaded result set;
- status changes;
- viewing submitted fields and admin notes;
- CSV export;
- single-row deletion.

There is no full-text search and no dedicated status filter.

Status values used by the UI are `new`, `contacted`, `confirmed`, `declined`, `cancelled`.

Cancelled registrations remain in history. Because of migration 013, a person can register again after cancellation.

## 5. Memberships

Route: `/admin/memberships`.

Statuses: `new`, `contacted`, `accepted`, `declined`.

Applications are unique by email.

## 6. Contact

Route: `/admin/contact`.

Admins can view and delete stored contact submissions. There is no built-in reply workflow.

## 7. Content

Route: `/admin/content`.

The admin edits rows in `cms_content`. Only a small set of CMS keys currently affect the public homepage. Most other visible site text remains code-managed.

See [CMS_ARCHITECTURE.md](CMS_ARCHITECTURE.md).

## 8. Settings

Route: `/admin/settings`.

The page edits `organization_settings`, but current public pages do not read this table. Treat it as non-public configuration until that is changed deliberately.

## 9. Operating workflow

The intended workflow remains manual:

1. Check admin notification email.
2. Review new registrations/memberships.
3. Contact people through official DIDAR channels.
4. Update status.
5. For full events, manually set `remaining_capacity=0` and/or `registration_status=closed`.
6. Keep CSV exports out of Git and uncontrolled shared storage.

## 10. Known admin limitations

- One shared admin password.
- No admin search across all registration fields.
- Registration CSV event column is currently empty because it reads `reg.event`.
- No public-facing organisation-settings consumption.
- Known event auto-open behavior remains intentionally untouched.

## 11. Safe admin checklist

When processing a real submission, keep the sequence explicit:

1. Open the corresponding admin list.
2. Review the submitted personal data and comment.
3. Contact the person through an official DIDAR channel.
4. Set the status to reflect the manual decision.
5. Do not treat the receipt email as proof of acceptance.
6. Do not place sensitive material into `admin_notes`.

Before deleting a registration/membership/contact row, confirm the identity and export only through a controlled location if a backup is required. There is no undo in the admin UI.

## 12. Language and UI behavior

The public site uses Next.js locale routing: Persian has no prefix and German uses `/de`. Admin registrations has its own FA/DE switch. Events/content/settings admin areas are currently Persian-oriented.

For UI changes, verify the relevant route in both locales where applicable; do not assume a source-only check proves RTL/LTR correctness.
