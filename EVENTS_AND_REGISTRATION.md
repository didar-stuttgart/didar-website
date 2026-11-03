# EVENTS AND REGISTRATION

Current event storage, publication, image handling and manual registration workflow.

## 1. Manual registration model

```text
Visitor submits
  -> row is saved immediately with status='new'
  -> admin notification is attempted
  -> event registrant receives an acknowledgment/receipt
  -> admin reviews and contacts the person manually
```

There is no email verification, automatic approval, automatic attendance confirmation, waitlist, or automatic capacity enforcement.

The receipt email is an acknowledgment only. It is not a seat confirmation.

## 2. Event fields

Admins edit:

- FA/DE title and descriptions
- custom slug
- event date/time
- FA/DE locations
- capacity and remaining capacity
- registration deadline
- image
- publication status
- registration status
- admin notes
- recurring flag

`capacity` and `remaining_capacity` are informational/manual. `registration_deadline` is stored but not enforced by code.

## 3. Event categorisation

`lib/events-categorizer.js` groups published events using today's UTC date:

1. date-less events -> upcoming
2. dated recurring events -> recurring
3. dated non-recurring events on/after today -> upcoming
4. older dated non-recurring events -> past

A recurring event without a date therefore appears in the upcoming group. This is a known quirk.

## 4. Event images

The image source is canonicalized in `lib/event-image.js`.

```text
event.image_url
  -> if absent: deterministic /images/event-1.jpg … event-5.jpg fallback
```

The same resolver is used by EventCard and the event detail page.

Admin upload flow:

1. Admin selects JPEG/PNG/WebP.
2. Upload endpoint validates the binary signature and a 5 MB maximum.
3. Server checks for a public-read `event-images` Storage bucket.
4. Server uploads under `events/<uuid>.<extension>`.
5. Public URL is returned to the admin UI.
6. The event form saves that URL to `events.image_url`.

An existing manual image URL/path remains supported.

The repository contains migration 014 for the bucket. Whether the bucket exists in Production is **NOT VERIFIED**.

## 5. Event slugs

Create:

- custom slug may be supplied;
- if blank, the Persian-title generator is used;
- duplicate slugs return HTTP 409.

Update:

- a non-empty custom slug replaces the existing slug;
- an empty/omitted slug leaves the current slug unchanged;
- no automatic redirect is created from the previous URL.

Slugs are limited to one safe URL path segment and may contain Unicode letters/numbers, hyphens and underscores.

## 6. Registration status

`registration_status` values:

- `not_open`
- `open`
- `closed`

The event API requires `open` before accepting a registration.

A known issue remains in the event detail page: `getStaticProps` may try to change `not_open` to `open`. Do not change this behavior unless explicitly requested.

## 7. Capacity

Capacity is informational.

The capacity-status API counts rows with status `verified`, a legacy state that the current manual registration flow does not write. Therefore the endpoint is effectively unable to report a full event under the present model.

Admins should use `remaining_capacity` and `registration_status='closed'` manually.

## 8. Self-cancellation and re-registration

Migration 012 adds a one-time cancellation token hash and cancellation RPC.

Migration 013 changes duplicate behavior so cancelled history no longer blocks a new active registration.

The current intended behavior is:

```text
active registration
  -> cancelled
  -> history remains
  -> same email may register again
```

## 9. Public-page caching and mutation revalidation

Normal ISR:

- home: 3600 s
- list: 3600 s
- detail: 60 s

The current Production deployment also includes `lib/revalidate-event-pages.js`. After an Admin create, update or archive mutation it calls `res.revalidate` for:

- `/`
- `/veranstaltungen`
- affected `/veranstaltungen/<slug>` path(s)

Revalidation errors are logged and do not roll back the successful mutation.

This final helper commit is present in Production deployment `dpl_9H4DxWc3hT44yfK5giN2g5DhvGaJ`, source commit `0b1379e...`. The default `main` branch does not yet contain that helper commit.

## 10. Known issues

1. `not_open` may be auto-opened by event detail rendering.
2. Closed-registration HTTP 409 is surfaced as the duplicate-registration message.
3. Capacity-status effectively never reports full.
4. Recurring events without a date appear in upcoming.
5. `registration_deadline` is not enforced.
6. Registration CSV event-name field is currently empty because the exporter reads a non-existent `reg.event` field.
7. `/api/admin/fix-event-status` is a legacy hard-coded admin endpoint with no current UI.

These are documented, not fixed by this documentation task.

## 11. Registration status reference

Current event-registration states:

| Status | Set by | Meaning |
|---|---|---|
| `new` | registration RPC | saved but not yet reviewed |
| `contacted` | admin | admin reached out |
| `confirmed` | admin | manual decision to accept participation |
| `declined` | admin | manually declined |
| `cancelled` | self-cancellation RPC or admin | registration withdrawn; row retained |
| `pending`, `verified` | legacy | still permitted by the SQL CHECK but not written by the current public flow |

### Self-cancellation mechanics

1. Registration generates a random raw cancellation token.
2. Only the SHA-256 hash is stored in `event_registrations.cancellation_token_hash`.
3. The raw token is placed in the receipt link.
4. Opening `/registrations/cancel?token=...` with GET never mutates the database.
5. The confirmation action sends POST to `/api/registrations/cancel`.
6. The RPC returns `cancelled`, `already_cancelled` or `invalid`.
7. The first successful cancellation sets `status='cancelled'` and `cancelled_at`; the registration row is not deleted.
8. Cancellation does not change capacity or event registration status.
9. After migration 013, the same email may register again and receives a new row/token.

If the receipt email was not delivered, the saved registration still exists but the public user has no self-cancellation link.

## Capacity endpoint behavior

`GET /api/events/[eventId]/capacity-status` counts registrations with status `verified`. The current manual model creates `new`, not `verified`, so this endpoint is effectively unable to mark an event full. The admin should use the manually stored `remaining_capacity` and/or `registration_status='closed'`.

## Troubleshooting

| Symptom | Check |
|---|---|
| Form visible but submit returns 409 | server requires `registration_status='open'`; check whether the page is stale or the event was just closed |
| Same email cannot re-register | verify the first row is actually `cancelled` and migration 013 is present in the target DB |
| Cancel link appears to do nothing | GET is intentionally non-mutating; press the page's confirmation action |
| Event image differs between pages | inspect `events.image_url` and `lib/event-image.js`; Production should also have the mutation revalidation helper |
| Event change is stale on the homepage/list | normal ISR is up to 1 hour; current Production additionally revalidates after admin mutations |
