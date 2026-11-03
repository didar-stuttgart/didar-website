# Features and Workflows Pointer

Read [../../FORMS.md](../../FORMS.md), [../../EVENTS_AND_REGISTRATION.md](../../EVENTS_AND_REGISTRATION.md) and [../../ADMIN_GUIDE.md](../../ADMIN_GUIDE.md).

Critical rules:

- manual registration review remains mandatory;
- no email verification;
- no automatic attendance confirmation;
- no automatic capacity enforcement;
- event registration sends an acknowledgment/receipt;
- receipt cancellation uses a random token whose hash is stored;
- cancelled registrations remain history and may be followed by a new active registration for the same event/email after migration 013;
- email failures do not roll back saved submissions.

## Current workflow checkpoints

### Event registration

Save first -> status `new` -> admin notification -> registrant receipt -> manual admin review.

### Cancellation

Receipt link -> GET shows confirmation only -> POST calls cancellation RPC -> status `cancelled`.

### Re-registration

After migration 013, a cancelled row does not occupy the active uniqueness slot. Re-registration creates a new row.

### Event images

Admin session -> upload endpoint -> binary/type/size validation -> `event-images` bucket -> public URL -> save to `events.image_url`.

### Custom slugs

Create blank -> generated Persian-title slug; create nonblank -> validated custom slug; update nonblank -> slug changes; update blank -> current slug remains.
