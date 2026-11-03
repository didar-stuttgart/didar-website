# DIDAR Website Images

This directory contains repository-managed image assets. It is not a CMS and is not proof that every file is referenced by a live page.

## Current repository assets

- Founder images: `Avid.jpg`, `Danial.jpg`
- Logos/branding: `logo.png`, `logo-header.png`, `logo-header.webp`
- Event fallback images: `event-1.jpg` … `event-5.jpg`
- Hero: `hero-banner.jpg`
- Event/topic artwork: `Barazandeh.png`, `Book_Club_round.webp`, `Critical_Thinking_Workshop.png`, `Film Night_warden.webp`, `Film_Night.png`, `Group_Workshop.png`, `Opening_Didar.png`, `Photography_Walk.png`, `didar-critical-thinking-amir-borazandeh.webp`
- About/contact/membership assets: `about-community.jpg`, `about-culture.jpg`, `about-heritage.jpg`, `contact-visual.jpg`, `membership-benefits.jpg`, `membership-community.jpg`, `membership-join.jpg`

## Event-image fallback

`lib/event-image.js` uses `event-1.jpg` through `event-5.jpg` as deterministic fallbacks when an event has no `image_url`.

## Admin-uploaded event images

Uploaded event images are not stored in this directory. They are stored in the Supabase Storage bucket `event-images`, with the public URL written into `events.image_url`.

Whether that bucket exists in Production is **NOT VERIFIED** by this documentation update.

## Editing assets

Do not remove an image merely because code search does not find a static reference. Some event images are selected from database values or owner-controlled content.

When changing image usage, verify both FA and DE pages and check the rendered result in a browser.
