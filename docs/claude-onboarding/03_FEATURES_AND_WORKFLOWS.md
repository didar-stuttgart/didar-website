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
