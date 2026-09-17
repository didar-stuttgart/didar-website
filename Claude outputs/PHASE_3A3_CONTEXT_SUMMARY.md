# Phase 3A3 — Event Registration Form Integration
## Context Summary & Handoff

**Session Date**: September 17, 2026  
**Previous Phases**: Phase 3A1 (Contact Form ✅) and Phase 3A2 (Membership Form ✅) Complete  
**Current Task**: Phase 3A3 — Event Registration Form Integration  

---

## Project Status

### Phase Completion
- **Phase 1**: ✅ Complete (Infrastructure Foundation)
- **Phase 2**: ✅ Complete (Design System + Public UI Shell)
- **Phase 3A1**: ✅ Complete (Contact Form Backend Integration)
- **Phase 3A2**: ✅ Complete (Membership Form Backend Integration)
- **Phase 3A3**: ⏳ In Progress (Event Registration Form Integration)

### Key Technical Stack
- **Framework**: Next.js 15 with React 18
- **Backend**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Session-based admin auth (no JWT)
- **API Rate Limiting**: In-memory rate limiter (10 req/min per IP)
- **Validation**: Server-side validation via lib/validation.js
- **Internationalization**: i18n.js with Persian (RTL) and German (LTR) support
- **CSS**: Custom design system with CSS variables

---

## Phase 3A3 Implementation Scope

### Goal
Connect the event registration form (on event detail page at `/veranstaltungen/[slug]`) to the existing Phase 1 backend endpoint `/api/registrations/submit`.

### API Endpoint Details
**File**: `pages/api/registrations/submit.js` (already exists)

**Request Fields**:
- `eventId` (required, number) — The event's database ID
- `firstName` (required, 1-100 chars)
- `lastName` (required, 1-100 chars)
- `email` (required, valid email format)
- `phone` (optional, 5-20 chars if provided)
- `telegramId` (optional, @ format or numeric if provided)
- `comment` (optional, max 1000 chars if provided)

**Response**:
- `201` — Success: `{success: true, message: "...", id: <submission_id>}`
- `400` — Validation error: `{error: "Validation failed", details: [...]}`
- `409` — Duplicate registration for same email + event: `{error: "Duplicate registration"}`
- `429` — Rate limit exceeded: `{error: "Too many requests"}`
- `500` — Server error: `{error: "Internal server error"}`

### Validation Rules
From `validateEventRegistration()` in lib/validation.js:
- `firstName`: required, 1-100 characters
- `lastName`: required, 1-100 characters
- `email`: required, valid email format
- `phone`: optional, 5-20 characters if provided
- `telegramId`: optional, starts with @ (length > 1, ≤ 32) OR numeric user ID
- `comment`: optional, max 1000 characters

### Event Data Structure
From mock events data:
```javascript
{
  id: number,              // Database ID for registrations
  slug: string,            // URL slug
  title_fa: string,        // Persian title
  title_de: string,        // German title
  date: string,            // ISO date (YYYY-MM-DD)
  time: string,            // Time (HH:MM)
  location_fa: string,     // Persian location
  location_de: string,     // German location
  description_fa: string,  // Persian description
  description_de: string,  // German description
  status: string,          // 'registration_open' | 'registration_closed' | 'past_event'
  image: string            // Image path/URL
}
```

### Event Registration Form Requirements

**UI Components**:
1. Registration form (only if event.status === 'registration_open')
2. Disabled/hidden form state if registration_closed or past_event
3. Field-level error display with i18n messages
4. Success message with auto-clear (after ~3 seconds)
5. Loading state during submission
6. Disabled form inputs during submission

**React State to Implement**:
```javascript
const [formData, setFormData] = useState({
  eventId: event.id,          // Set from props
  firstName: '',
  lastName: '',
  email: '',
  phone: '',                  // Optional
  telegramId: '',            // Optional
  comment: ''                // Optional
});
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState(null);        // General error
const [success, setSuccess] = useState(false);   // Success state
const [fieldErrors, setFieldErrors] = useState({}); // Per-field errors
```

**Handlers**:
- `handleChange(e)` — Updates all input types (text, email, tel, textarea)
- `handleSubmit(e)` — Validates, submits to /api/registrations/submit, handles errors
  - Client-side validation not required (server validates)
  - Omit empty optional fields from request
  - Handle 409 Conflict as "duplicate registration" error
  - Show field-specific error messages from validation.errors array

**i18n Keys Available**:
- `form.first_name` → 'نام' / 'Vorname'
- `form.last_name` → 'نام خانوادگی' / 'Nachname'
- `form.email` → 'ایمیل' / 'E-Mail-Adresse'
- `form.phone` → 'شماره تماس (اختیاری)' / 'Telefonnummer (optional)'
- `form.telegram` → 'شناسه تلگرام (اختیاری)' / 'Telegram-ID (optional)'
- `form.message` → 'پیام' / 'Nachricht' (for comment field)
- `form.required` → '(الزامی)' / '(erforderlich)'
- `form.success` → 'درخواست شما دریافت شد. تأیید از طریق ایمیل برای شما ارسال خواهد شد.' / 'Ihre Anfrage wurde empfangen. Eine Bestätigung wird Ihnen per E-Mail zugesandt.'
- `form.error` → 'خطا در ارسال فرم. لطفاً دوباره امتحان کنید.' / 'Fehler beim Absenden des Formulars. Bitte versuchen Sie es später erneut.'
- `event.register` → 'ثبت نام در این رویداد' / 'Für diese Veranstaltung anmelden'
- `common.loading` → 'در حال بارگذاری...' / 'Wird geladen...'
- `common.submit` → 'ارسال' / 'Senden'

**Bilingual Implementation**:
- All labels/messages use `t(key, currentLang)` from i18n.js
- Form direction: `dir={currentLang === 'fa' ? 'rtl' : 'ltr'}`
- No hardcoded English strings

---

## Implementation Pattern (Established from Phase 3A1 & 3A2)

All three form implementations follow the same pattern:

1. **Inspect existing API endpoint** before making changes
2. **Import i18n, validation, and utilities**
3. **Initialize React state**:
   - `formData` with all required/optional fields
   - `isSubmitting` boolean
   - `error` string (general)
   - `success` boolean
   - `fieldErrors` object (per-field)
4. **Implement handleChange()**:
   - Updates formData for all input types
   - Clears field errors on change
5. **Implement handleSubmit()**:
   - Prevent default form submission
   - Set isSubmitting = true
   - Call `fetch('/api/registrations/submit', {method: 'POST', body: JSON.stringify({...})})`
   - **Omit optional fields if empty** (send `undefined` for empty optionals)
   - Handle responses:
     - **201**: Show success message, clear form, auto-hide after 3s
     - **400**: Map validation errors to fieldErrors
     - **409**: Show "Registration already exists for this email and event"
     - **429**: Show "Too many requests, please try again later"
     - **500**: Show generic error message
   - Set isSubmitting = false on completion
6. **Render form**:
   - Show form only if `event.status === 'registration_open'`
   - Show status message if `registration_closed` or `past_event`
   - Display field-level errors under each input
   - Show general error in alert if present
   - Show success message in alert if present
   - Disable all inputs during isSubmitting
   - Disable submit button during isSubmitting

---

## CSS Classes Already Available

From Phase 2 (Design System):
- `.error-text` — Red text for field errors
- `.alert` — Generic alert container
- `.alert-success` — Green success alert
- `.alert-error` — Red error alert
- `.alert-warning` — Yellow warning alert
- Input `:disabled` state — Already styled with opacity/cursor

---

## Key Files to Modify

**Primary File**:
- `pages/veranstaltungen/[slug].js` — Add registration form to event detail page

**Reference Files** (read-only for pattern):
- `pages/kontakt.js` — Contact form (Phase 3A1 pattern)
- `pages/mitglied-werden.js` — Membership form (Phase 3A2 pattern)
- `lib/i18n.js` — Translation keys
- `lib/validation.js` — Validation rules
- `pages/api/registrations/submit.js` — API endpoint

---

## Known Issues Fixed in Previous Phases

1. **Git Lock Error**: Use `git show HEAD:file > temp.file; cp temp.file target.file` to restore files if `.git/index.lock` blocks operations
2. **CSS Variable Names**: Use correct variables from globals.css:
   - `--color-error` (not --color-status-error)
   - `--color-success`
   - `--color-gray-light`
   - `--color-tan`
3. **Accidental File Modifications**: Always restore to clean committed state before starting new phase
4. **Optional Field Handling**: Send `undefined` (not empty string) for optional fields that are empty

---

## Testing & Verification (After Implementation)

After adding the registration form to event detail page:

1. **Lint**: `npm run lint` → should pass
2. **Build**: `npm run build` → should succeed
3. **Verification Points**:
   - Event detail page renders without errors
   - Registration form appears when event.status === 'registration_open'
   - Form is hidden/disabled when event.status === 'registration_closed' or 'past_event'
   - All labels and messages are in correct language (Persian RTL / German LTR)
   - Form direction switches correctly with language
   - Submission to /api/registrations/submit works
   - Validation errors display correctly per field
   - Success message appears after successful submission
   - Duplicate email detection works (409 response)
   - Loading state disables form during submission
   - No SUPABASE_SECRET_KEY or sensitive data exposed

---

## Git Management

**Before Starting**:
- Verify clean working state: `git status` (should show no uncommitted changes)
- Check Phase 3A1 & 3A2 are committed and pushed

**During Implementation**:
- Do NOT commit or push until user approval
- Focus only on Phase 3A3 changes

**Verification**:
- `git status` should show only pages/veranstaltungen/[slug].js modified
- `git diff` should show only event registration form additions

---

## Next Steps

1. Inspect the existing event detail page file (pages/veranstaltungen/[slug].js)
2. Identify placeholder form location (described as div with class="form-success" showing success message)
3. Replace placeholder with complete registration form following the established pattern
4. Run lint and build verification
5. Verify git diff shows only expected changes
6. Wait for user approval before committing

---

## Session Continuation Notes

This is a continuation session. The summary includes:
- All files read in previous interactions
- All patterns established in Phase 3A1 & 3A2
- All known issues and how they were resolved
- Full context of the project architecture
- Exact i18n keys and validation rules
- React state structure and event data format

No additional context gathering is needed. Ready to implement Phase 3A3 immediately upon viewing the existing event detail page structure.
