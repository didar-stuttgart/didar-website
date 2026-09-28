# DIDAR Website Project Overview

## Project Identity

**Project Name:** DIDAR — Iranische Kulturgemeinschaft Stuttgart – Hochschulgruppe  
**Full English Name:** DIDAR — Iranian Cultural Community Stuttgart – University Group  
**Type:** Bilingual (Persian/German) cultural organization website  
**Production URL:** https://didar-stuttgart.com  
**GitHub Repository:** https://github.com/didar-Stuttgart/didar-website  
**Canonical Repository Location:** `C:\Users\Avid\Desktop\didar-website`

## Project Purpose

DIDAR is a registered university student group at the University of Stuttgart that:
- Organizes cultural and artistic events for the Persian-speaking community
- Promotes Iranian culture, art, and intercultural dialogue in Stuttgart
- Manages event listings, event registration, and membership applications
- Provides contact and engagement channels for community members

This website is the digital hub for DIDAR's activities, public information, and member engagement.

## Key Features

1. **Event Management**
   - Event listing page with filtering and sorting
   - Individual event detail pages
   - Event registration workflow (manual review model)
   - No automatic confirmation or capacity enforcement

2. **Membership**
   - Membership application form
   - Manual review by admin
   - No automated confirmation

3. **Contact**
   - Contact form for public inquiries
   - Admin email notifications for all submissions

4. **Bilingual Content**
   - Persian (Farsi) with RTL layout
   - German (Deutsch) with LTR layout
   - Language switcher in header
   - Consistent translations throughout

5. **Admin Interface**
   - Admin login/authentication
   - Admin panel for reviewing submissions (membership, event registration, contact)
   - Email notification system for new submissions

## Technology Stack

- **Framework:** Next.js 15.0.0
- **Language:** React 18.3.1 with JavaScript
- **Database:** Supabase (PostgreSQL)
- **Email Service:** Resend
- **Authentication:** Custom JWT-based admin auth
- **Internationalization:** Custom i18n library (translations in `lib/i18n.js`)
- **Hosting:** Vercel (serverless deployment)
- **CSS:** CSS Modules and inline styles

## Current Status (September 2026)

✅ All core features implemented and deployed to production  
✅ Email notification system verified working  
✅ About page redesigned with founder images  
✅ Persian spelling corrections complete  
✅ Manual event registration workflow operational  
✅ Admin authentication and session management working  

## Role of Future Claude Agent

The future Claude agent should:
- Maintain the codebase according to established patterns
- Implement new features while preserving existing functionality
- Verify UI changes with browser testing
- Respect the bilingual design and RTL/LTR behavior
- Never expose secrets or API keys
- Document changes that affect architecture or behavior
- Test production behavior when relevant

## Important Constraints

**Do NOT:**
- Casually refactor working code
- Add unnecessary dependencies
- Change authentication architecture without asking
- Introduce automated email confirmations without explicit request
- Modify the manual review model without consultation
- Reset or discard user work
- Commit API keys or environment secrets
- Change URLs or routes without consultation

**DO:**
- Inspect code before changing it
- Verify UI changes in Chrome browser
- Use the actual repository as source of truth
- Keep changes focused and minimal
- Preserve RTL/LTR behavior
- Maintain bilingual consistency
- Document architectural decisions
