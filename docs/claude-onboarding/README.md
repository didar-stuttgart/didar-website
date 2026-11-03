# DIDAR Claude Onboarding

This directory is a concise orientation layer for AI/code agents.

## Authoritative source

Use the nine canonical root documents:

- [README.md](../../README.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [DATABASE.md](../../DATABASE.md)
- [FORMS.md](../../FORMS.md)
- [EVENTS_AND_REGISTRATION.md](../../EVENTS_AND_REGISTRATION.md)
- [ADMIN_GUIDE.md](../../ADMIN_GUIDE.md)
- [DEPLOYMENT.md](../../DEPLOYMENT.md)
- [SECURITY.md](../../SECURITY.md)
- [PROJECT_STATE.md](../../PROJECT_STATE.md)

These onboarding files must not maintain independent architecture claims.

## Agent rules

1. Inspect code before changing it.
2. Preserve the manual registration workflow.
3. Preserve Persian RTL / German LTR.
4. Never expose secrets.
5. Never reset/discard user work.
6. Verify UI changes in a browser.
7. Use PASS / FAIL / BLOCKED / NOT VERIFIED only when evidence supports the status.
8. Keep application changes focused.
9. Do not change Production infrastructure as part of a documentation-only task.

## Practical use

Before starting a task, the first three files to consult are:

1. `00_PROJECT_OVERVIEW.md` for project constraints and current Production/main split.
2. `01_ARCHITECTURE.md` for the code/data path.
3. The relevant root canonical document for the feature being changed.

Then inspect the actual implementation. These files are orientation aids, not substitutes for source code.
