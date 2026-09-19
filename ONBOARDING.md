# DIDAR Website — Onboarding Guide

Welcome. This document is written for someone who has never seen this project before and needs to become productive on it quickly — a new developer, a volunteer helping the DIDAR team, or anyone taking over maintenance. Read this first, then use `ARCHITECTURE.md` (in this same folder) as your technical reference once you need implementation-level detail.

If anything here seems to disagree with the actual code, trust the code — this document was written by reading the code directly, but the code can keep changing after this was written.

## 1. What this project is

DIDAR is the website for an Iranian cultural association in Stuttgart, Germany ("DIDAR — Iranische Kulturgemeinschaft Stuttgart"). The site is bilingual (Persian and German) and serves a few concrete purposes for visitors:

- Show upcoming and past cultural events, and let visitors register for them.
- Explain what DIDAR is and let visitors apply for membership.
- Provide a contact form and the legally required German pages (Impressum, Datenschutz).
- Give the DIDAR team a private admin panel to manage events, view registrations and membership applications, edit some site content, and manage settings — without needing to touch code.

There is no public user login. The only account that exists is a single admin account for the DIDAR team.

## 2. Technology stack, in plain terms

- **Next.js** (a React framework) — builds the pages and also provides the backend API routes (the `/api/...` endpoints), so there's no separate backend server.
- **Supabase** — a hosted PostgreSQL database. Events, registrations, membership applications and contact messages are all stored here.
- **Vercel** — where the live site is hosted. Every time code is pushed to the `main` branch on GitHub, Vercel automatically rebuilds and redeploys the site.
- **Cloudflare** — manages the domain's DNS (which server the domain name points to) in front of Vercel.
- **IONOS** — the domain registrar (where `didar-stuttgart.com` was purchased and where its nameservers are configured).
- **GitHub** — where the source code lives (`didar-stuttgart/didar-website`), and the trigger for deployments.

No other services, frameworks or databases are used. There is deliberately no user-facing login system, no third-party CMS, and no analytics/tracking installed.

## 3. Folder structure, at a glance

```
didar-website/
├── pages/              Every file here is a page or an API route (Next.js convention)
│   ├── index.js               → Homepage (/)
│   ├── veranstaltungen/       → Events listing (/veranstaltungen) and detail (/veranstaltungen/[slug])
│   ├── ueber-uns.js            → About page
│   ├── mitglied-werden.js      → Membership application form
│   ├── kontakt.js              → Contact form
│   ├── impressum.js / datenschutz.js  → Legal pages (German law requires these)
│   ├── admin/                  → The private admin panel (login, dashboard, events, registrations, memberships, content, settings)
│   └── api/                    → Backend endpoints: form submissions, admin data, authentication
├── components/          Reusable UI pieces (Header, Footer, EventCard, SocialIcons)
├── lib/                  Shared backend logic (Supabase client, auth, validation, rate limiting)
├── styles/               Plain CSS files (no CSS framework is used)
├── data/                 Database schema (schema.sql) — the source of truth for the Supabase tables
├── public/               Static files served as-is: images, favicon
├── scripts/              One-off admin utility scripts (see below)
└── Claude outputs/       SQL migration files that still need to be run in Supabase manually (see PROJECT_STATE.md)
```

`PROJECT_STATE.md`, also in this folder, is the running project history/status log — what's been built, what's pending, what the owner still needs to do. Read it after this document.

## 4. How the site actually works, page by page

**Homepage (`/`):** A hero banner, up to 3 upcoming events pulled live from Supabase, and two informational blocks (About, Membership) linking to their full pages.

**Events (`/veranstaltungen` and `/veranstaltungen/[slug]`):** Lists upcoming and past events from the `events` Supabase table. Each event has a registration status (`not_open`, `open`, or `closed`) that controls whether visitors see a registration form, a "not open yet" message, or a "closed" message. Registering submits to `/api/registrations/submit`, which validates the input server-side, rate-limits by IP, and writes to the `event_registrations` table.

**About (`/ueber-uns`), Membership (`/mitglied-werden`), Contact (`/kontakt`):** Static content pages. Membership and Contact both have forms that submit to their own `/api/.../submit` endpoint, following the same validate → rate-limit → insert-into-Supabase pattern as event registration.

**Legal pages (`/impressum`, `/datenschutz`):** Required under German law. Their content should only ever be changed with facts the DIDAR board has explicitly approved — never guessed or invented.

**Admin panel (`/admin/...`):** A single password protects everything under `/admin`. Once logged in, the dashboard links to five sections: Events (create/edit/publish), Registrations (view/manage who signed up), Memberships (view/manage applications), Content (edit some page text), and Settings (contact info and social links). See section 6 below — there is a known bug affecting this panel right now.

## 5. Language handling (Persian / German)

The site uses Next.js's own built-in "locale routing": every page effectively exists twice, once under `/fa/...` (Persian, the default) and once under `/de/...` (German). The language shown is decided by the URL itself, not by guesswork after the page loads — this avoids a flash of the wrong language. All translatable text lives in one place: `lib/i18n.js`, as a lookup table keyed by a short label like `home.hero_tagline`. If you need to change any wording, that file is almost always where you'll make the change — not the page files themselves. Persian text also renders right-to-left (RTL); this is handled automatically based on the current language.

## 6. Known issue you should know about immediately

**The admin panel's login and its data pages use two separate, disconnected session systems.** `/api/auth/login.js` (and logout/verify) store the login session in `lib/session-store.js`. But every admin data endpoint (`/api/admin/stats`, `/api/admin/events`, `/api/admin/registrations`, `/api/admin/memberships`, `/api/admin/content`, `/api/admin/settings`) checks a *different* session store in `lib/admin-auth.js`, via `lib/api-middleware.js`. These two stores never share data with each other. In practice this means: after a successful admin login, every admin data page is likely to fail to load its data (an "Unauthorized" response), because the session token that was just created is invisible to the code checking it.

This was found while auditing the codebase, not something introduced by this change, and it has **not been fixed yet** — fixing it means picking one session system and using it everywhere consistently, which is a real code change, not just documentation. Flag this to whoever manages the codebase and decide together whether to fix it now or schedule it. See `ARCHITECTURE.md` section on Authentication for the exact file list involved.

## 7. Getting set up to work on this locally

You will need: Node.js 18 or newer, a copy of the code (`git clone` the GitHub repo), and access to the project's Supabase project (ask the DIDAR team/current maintainer for credentials — never invent or guess these).

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the real values (Supabase URL and key, admin password hash). Never commit `.env.local` — it's already excluded via `.gitignore`, keep it that way.
3. Generate an admin password hash by running `node scripts/setup-admin.js` and following its prompts, then put the result in `.env.local` as `ADMIN_PASSWORD_HASH`.
4. `npm run dev` and open `http://localhost:3000`.
5. See `SETUP_GUIDE.md` in this same folder for the full step-by-step version of the above, including the Supabase and Vercel account setup from scratch.

## 8. How changes reach the live site

There is no staging environment — the flow is: edit code → commit → push to `main` on GitHub → Vercel automatically builds and deploys. Because of this, changes should be tested locally (`npm run dev`) before pushing, especially anything touching forms, the admin panel, or the database schema. Database schema changes are not automatic — a SQL snippet has to be run manually in the Supabase dashboard's SQL Editor (this project's history has examples of this in the `Claude outputs/` folder).

## 9. Where to look next

- `ARCHITECTURE.md` (this folder) — technical deep-dive: every API route, the database schema, the authentication flow in detail, and the styling approach.
- `PROJECT_STATE.md` (this folder) — chronological project history and current status; the single most important file for understanding what phase the project is in right now and what the owner still needs to do.
- `SECURITY.md`, `SETUP_GUIDE.md`, `SUPABASE_ARCHITECTURE.md` (this folder) — deeper reference on those specific topics, written earlier in the project.

## 10. Ground rules for anyone working on this project

These come from how the project has been run so far and are worth continuing:

- Never invent DIDAR's official facts — legal details, addresses, social links, event details. Get them from the DIDAR board/owner.
- Keep changes small and focused; avoid adding new systems, dependencies, or services that weren't asked for.
- This is a single-admin, low-traffic community site — it does not need enterprise-scale infrastructure. Resist the urge to over-engineer it.
- Update `PROJECT_STATE.md` after finishing a meaningful piece of work, so the next person (human or AI) can see the current state without re-deriving it from scratch.
