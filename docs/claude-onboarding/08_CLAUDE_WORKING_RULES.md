# Claude Working Rules

Operating manual for Claude agents working on the DIDAR project.

---

## Principle: Inspect Before Changing

**ALWAYS** read the actual current code before making changes. Do not rely on memory, assumptions, or previous conversations.

**How:**
1. Read the complete file you're about to edit
2. Read related files if changes affect them
3. Run tests or check behavior if available
4. THEN make changes

**Why:** Code changes since last conversation, requirements shift, edge cases matter. The real codebase is the truth.

---

## Principle: Make Focused Changes

**One task, one change set.** Do not combine unrelated modifications.

**Focused means:**
- If fixing a bug, only fix the bug (don't refactor the file)
- If adding a feature, add the feature (don't reorganize code)
- If improving performance, optimize (don't add features)

**Exceptions:** If your change naturally requires related fixes (e.g., variable rename cascades to multiple files), that's acceptable.

**Why:** Focused changes are easier to review, easier to revert, easier to understand in git history.

---

## Principle: Don't Refactor Unnecessarily

The codebase doesn't need to be perfect. It needs to work and be maintainable.

**What NOT to do (unless explicitly asked):**
- Rewrite functions for style preferences
- Reorganize file structure
- Extract duplicate functions if they're only 2 instances
- "Improve" variable names that already work
- Replace JavaScript idioms with others unless there's a bug

**When to refactor:**
- Code is actively buggy
- Changes you're making require it
- Performance is actually slow (measure first)
- Maintainability is genuinely impaired

**Why:** Refactoring introduces risk. Only refactor when it solves a real problem.

---

## Principle: Verify Changes in Browser

**Never** claim a UI change works without verifying in an actual browser.

**How:**
1. Make the code change
2. Restart dev server if needed
3. Open the page in Chrome at desktop and mobile widths
4. Test the specific feature (click, type, submit, switch language)
5. Screenshot or screen record to show it works

**What NOT to do:**
- "This should work" (it might not)
- Assume responsive design works on mobile without testing
- Trust that CSS changes will render correctly without seeing them
- Claim form validation works without filling out the form

**Why:** Browser behavior is the source of truth. Code review can't catch rendering issues.

---

## Principle: Don't Claim PASS Without Evidence

**Status values for work:**
- **PASS** — Feature works end-to-end; verified in browser or tests pass
- **FAIL** — Specific error with reproduction steps
- **BLOCKED** — Can't proceed due to missing info, permission, or environment issue
- **NOT VERIFIED** — Code written but not yet tested in browser/deployed

**When to use each:**

### PASS
- Tested in browser and feature works
- All tests pass
- Edge cases handled and tested
- Deployed and verified in production

### FAIL
- Specific error message visible
- Reproduction steps clear ("When I click X, Y happens instead of Z")
- Root cause identified (if available)

### BLOCKED
- Waiting for user information (e.g., "What domain will you use?")
- Missing credentials or access (e.g., "Need GitHub SSH key")
- Environment issue preventing work (e.g., "Device not connected")
- Browser can't reach page (e.g., "Network blocked by proxy")

### NOT VERIFIED
- Code written but dev server not available yet
- Deployed but can't access production URL to verify
- Test file created but test runner not set up
- Implementation ready but awaiting user approval/decision

**Why:** Clear status prevents false confidence. "PASS" means it actually works. "NOT VERIFIED" means caution is warranted.

---

## Principle: Don't Expose Secrets

**Never log, output, or commit:**
- Supabase secret keys
- Resend API keys
- Admin passwords
- Session tokens
- `.env.local` file content
- Database credentials
- Private keys or certificates

**Safe to mention:**
- Environment variable NAMES (e.g., "Set RESEND_API_KEY")
- File paths (e.g., ".env.local" path)
- Configuration structure (e.g., "Requires three environment variables")
- Whether a value is set (e.g., "SUPABASE_SECRET_KEY is set" vs. "not set")

**How to handle if secret is exposed:**
1. Alert immediately
2. Recommend key rotation
3. Suggest git history cleanup if committed

**Why:** Leaked secrets can be exploited. Prevent exposure at all costs.

---

## Principle: Don't Reset or Discard User Work

**NEVER:**
- Delete user data from database without explicit request
- Remove files user created
- Reset settings back to defaults
- Clear session data or cache
- Archive old registrations without confirming

**If cleanup is needed:**
- Ask: "Should I archive or delete the X records created during testing?"
- Wait for confirmation
- Describe exactly what will be deleted
- Suggest keeping a backup

**Why:** User work is valuable. Accidental deletion is catastrophic.

---

## Principle: Don't Modify Unrelated Functionality

If you're fixing event registration, don't touch membership forms.

**Scope creep means:**
- Make changes to MORE than the task requires
- "While I'm here" fixes that weren't requested
- Improve adjacent features without asking

**Exception:** If your change breaks something adjacent (e.g., refactoring a shared function), you MUST fix it.

**How:**
1. Identify exactly what needs to change
2. Change only that
3. Verify nothing else broke
4. If it did, fix it but flag it: "While fixing X, I had to also fix Y"

**Why:** Each change multiplies risk. Focused work is safer.

---

## Principle: Don't Reintroduce Deprecated Architectures

DIDAR has discarded certain patterns. Do NOT bring them back.

**Explicitly deprecated:**
- Automatic verification emails (manual review model)
- Automatic capacity enforcement (displayed informationally only)
- User self-service account creation (admin-managed)
- In-memory session store (use database-backed store only)
- Direct table inserts for public forms (use SECURITY DEFINER RPC)

**If you're tempted to add these:**
1. Stop and re-read requirements
2. Confirm with user: "Should we add automatic X?"
3. If yes, document the architecture change
4. Update documentation if implemented

**Why:** These were deliberate design choices. Re-adding them means undoing intentional decisions.

---

## Principle: Clean Up Temporary Files

**Before finishing work:**
- Remove `.backup` files
- Delete `*.tmp`, `*.log` files you created
- Remove console.log debugging statements
- Clean up commented-out code blocks
- Delete test data you created (unless explicitly keeping it)

**What to keep:**
- Source code and stylesheets
- Documentation files
- Configuration files
- Test files

**How:**
```bash
# Find and remove temporary files
find . -name "*.backup" -delete
find . -name "*.tmp" -delete
```

**Why:** Clean repo is easier to maintain and won't accidentally commit temp files.

---

## Principle: Preserve RTL/LTR Handling

The website supports Persian (RTL) and German (LTR).

**When making changes:**
1. Test in both languages
2. Check layout at desktop AND mobile
3. Verify text direction: Persian right-to-left, German left-to-right
4. Test with long text (Persian text can be longer)
5. Check forms align correctly

**How to test both languages:**
- Visit page with `?lang=fa` (Persian) and `?lang=de` (German) URL params
- Or use language switcher in header

**Common mistakes:**
- Hardcoding `direction: ltr` (breaks Persian)
- Using `margin-left` instead of flexbox (breaks RTL)
- Not testing text-heavy pages in both languages

**Why:** RTL support is intentional. Breaking it is a regression.

---

## Principle: Preserve Current Production Architecture

Don't redesign database, API, or deployment without asking.

**Existing architecture:**
- Next.js for frontend and backend
- Vercel for deployment
- Supabase PostgreSQL for database
- Resend for email
- Git-based deployment

**What NOT to do:**
- "We could use Django instead" (no)
- "Let's move to AWS" (no, unless asked)
- "I'll add a message queue for emails" (no, not needed)
- "Let's use GraphQL" (no, REST is fine)

**Exception:** If current architecture has a critical problem (e.g., can't scale, security issue), raise it: "Current approach won't work because X. Should we consider Y?"

**Why:** Architecture changes are risky and costly. Only make them if absolutely necessary.

---

## Principle: Ask Before Large Architectural Changes

**Large changes** include:
- Adding new third-party services
- Changing database schema structure
- Switching deployment platforms
- Major code reorganization
- Adding new systems (caching, queues, etc.)

**What to do:**
1. Identify the change
2. Explain why it's necessary
3. List options (keep current, option A, option B, etc.)
4. Recommend the simplest approach
5. Wait for approval before proceeding

**Example:**
```
The current setup works, but if you want automatic capacity enforcement,
we'd need to:
- Option A: Check capacity in the RPC function when inserting registration
- Option B: Disable form on frontend when capacity reached
- Option C: Both A and B (safest)

I recommend Option C. Should we proceed?
```

**Why:** Big decisions require human judgment. Get alignment first.

---

## Git and Commits

### Commit Messages

**Format:**
```
Brief one-line summary (50 chars max)

Optional longer explanation if needed:
- What changed
- Why it changed
- Any context

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_...
```

**Examples:**

Good:
```
Fix founder section layout on About page

Restructured to display main About text first, then Founders section.
Updated CSS Grid to show side-by-side on desktop, stacked on mobile.

Fixes: Founders appearing above About text and stacking vertically.
```

Bad:
```
Update pages/ueber-uns.js
```

### Before Pushing

1. Review changes: `git diff HEAD`
2. Check no secrets are committed: `git log -p | grep -i "secret\|password\|key"`
3. Verify tests pass (if applicable)
4. Commit with descriptive message
5. Push to main (or create pull request)

---

## Testing Expectations

### What's Tested

- Form submission works end-to-end
- Admin dashboard displays data correctly
- Language switching works in both languages
- Responsive layout works at mobile and desktop
- Email notifications are sent
- Database queries return correct data

### What's NOT Automated

- No automated test suite (not yet implemented)
- No CI/CD checks (Vercel builds on push)
- Manual verification required for UI changes

### Your Role

When making changes:
1. Test manually in browser before saying "done"
2. If breaking test is possible, note it
3. If possible, run existing test suite if it exists

---

## Communication

### What to Say When Work Is Done

Good:
```
✓ PASS — Founder section repositioned on About page

Changed pages/ueber-uns.js to display About text first, then Founders section below.
Founders display side-by-side on desktop (CSS Grid: repeat(auto-fit, minmax(200px, 1fr))),
stacked vertically on mobile. Tested in Chrome at 1440px and 375px widths.
Both Persian (RTL) and German (LTR) layouts verified.
```

Vague:
```
Done! Fixed the About page.
```

Not verifiable:
```
PASS — Works great!
```

### What to Say When Blocked

Good:
```
BLOCKED — Can't complete without browser access

Working directory is set up and code is written, but I need to verify
the responsive layout works at mobile width. This requires opening the
development server in a real browser. 

To proceed: Start dev server (npm run dev) and visit http://localhost:3000/ueber-uns
at both 1440px (desktop) and 375px (mobile) width.
```

Vague:
```
Can't test this yet.
```

---

## Staying Organized

### Start Each Task

1. Read the request carefully
2. Re-read the relevant documentation (in docs/claude-onboarding/)
3. Read the actual code files
4. Ask clarifying questions if needed
5. Plan the changes
6. Execute
7. Verify
8. Commit and document

### Before Finishing

- [ ] Changes are focused and minimal
- [ ] Browser verification done (if UI change)
- [ ] No temporary files left behind
- [ ] No secrets exposed
- [ ] Commit message is descriptive
- [ ] Related documentation updated (if applicable)
- [ ] Status is clear (PASS/FAIL/BLOCKED/NOT VERIFIED)

---

## Key Principle: Simplicity First

> The simplest reliable implementation that meets requirements.

Not:
- Most elegant code
- Most advanced patterns
- Most comprehensive test coverage
- Most scalable architecture

But:
- Works correctly
- Is maintainable
- Solves the actual problem
- Doesn't introduce unnecessary complexity

When in doubt, go simpler.

