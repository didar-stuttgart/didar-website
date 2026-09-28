# DIDAR Onboarding Documentation

This directory contains comprehensive documentation for onboarding a new Claude instance to the DIDAR website project.

## Files Included

1. **00_PROJECT_OVERVIEW.md** — Project identity, purpose, key features, technology stack, and constraints
2. **01_ARCHITECTURE.md** — Next.js architecture, directory structure, page routes, API routes, and key components
3. **02_DATABASE_AND_AUTH.md** — Supabase schema, database tables, RPC functions, admin authentication, and security model
4. **03_FEATURES_AND_WORKFLOWS.md** — Event system, registration workflows, membership applications, contact forms, email notifications, and the CRITICAL manual review model
5. **04_UI_I18N_AND_DESIGN.md** — Language system (Persian RTL / German LTR), component design, About page structure, responsive layouts, and accessibility
6. **05_DEPLOYMENT_AND_OPERATIONS.md** — Vercel hosting, environment variables, build process, deployment verification, monitoring, and troubleshooting
7. **06_SECURITY_RULES.md** — Authentication architecture, Row-Level Security, SECURITY DEFINER procedures, secrets management, and incident response
8. **07_KNOWN_ISSUES_AND_PROJECT_STATE.md** — Current status, known limitations, deferred work, testing approach, and recommendations
9. **08_CLAUDE_WORKING_RULES.md** — Operating principles for Claude agents working on this project

## How to Use This Documentation

### Starting a New Task

1. **Read the project overview** (file 00) to understand what DIDAR is and your role
2. **Read the architecture** (file 01) to understand how the codebase is organized
3. **Read the relevant documentation** for your specific task:
   - Working on database/auth? Read file 02
   - Working on features/forms? Read file 03
   - Working on UI/layout? Read file 04
   - Deploying or troubleshooting? Read file 05
   - Working on security or admin? Read file 06
   - Evaluating scope or known issues? Read file 07
4. **Read the working rules** (file 08) to understand how to work on this project safely

### Key Principles

- **Manual Review Model (CRITICAL):** There are NO automatic verification emails, NO automatic confirmations, NO automatic capacity enforcement. Admins manually review all submissions.
- **Bilingual Support:** Site supports Persian (RTL) and German (LTR). Changes must work in both languages.
- **Security-First:** Secrets are never exposed, session tokens are hashed, and Row-Level Security protects data.
- **Focused Changes:** Make small, focused changes. Don't refactor unnecessarily or combine unrelated work.
- **Verify in Browser:** Never claim UI changes work without testing in an actual browser at multiple widths.

## What This Documentation Is

✓ Based on actual current codebase as of September 28, 2026
✓ Free of API keys, passwords, tokens, or sensitive credentials
✓ Free of speculative information
✓ Accurate descriptions of current behavior
✓ Clear explanation of design decisions and constraints

## What This Documentation Is NOT

✗ A step-by-step tutorial (that's not its purpose)
✗ A complete API reference (focus is architecture and workflows)
✗ A replacement for reading actual code
✗ A design specification for future features

---

**Last Updated:** September 28, 2026

**Status:** Complete and verified

