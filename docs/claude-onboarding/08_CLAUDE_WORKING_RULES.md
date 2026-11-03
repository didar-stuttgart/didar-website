# Claude Working Rules

Technical facts belong in the canonical root documents. This file contains agent behavior rules.

## Before changing anything

1. Inspect the actual implementation.
2. Inspect Git status/diff when available.
3. Make the smallest focused change.
4. Preserve user work.
5. Preserve FA/DE routing and RTL/LTR.
6. Preserve the manual registration model.

## Verification

Use:

- PASS — evidence supports success.
- FAIL — evidence supports a failure.
- BLOCKED — required access/action is unavailable.
- NOT VERIFIED — evidence is insufficient.

For UI changes, browser verification is required when available.

For email changes, real delivery evidence is required; HTTP 201 alone is insufficient.

## Secrets

Never print, commit or paste credentials, tokens, API keys, hashes, cookies or service-role keys.

## Git

- Do not reset/discard user work.
- Do not modify `main` directly for feature work.
- Keep commits focused.
- Review the complete diff before committing.
- Do not merge/deploy without explicit authorization.
