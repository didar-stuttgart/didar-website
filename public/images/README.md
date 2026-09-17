# DIDAR Website Images

This directory contains all images used on the DIDAR website.

## Image Structure & Placement

### Required Images for Phase 3C UX/UI Enhancements

#### 1. Hero Section
- **File:** `hero-banner.jpg`
- **Size:** 1920 × 1080 px
- **Format:** JPG (~500KB)
- **Purpose:** Background for hero section on all pages
- **Content:** Iranian cultural scene, artwork, heritage
- **Placement:** Displayed behind title/subtitle with gradient overlay

#### 2. Event Cards (5 images)
- **Files:** `event-1.jpg`, `event-2.jpg`, `event-3.jpg`, `event-4.jpg`, `event-5.jpg`
- **Size:** 400 × 300 px each
- **Format:** JPG (~150KB each)
- **Purpose:** Event card thumbnails
- **Content Examples:**
  - Poetry/Calligraphy event
  - Music/Concert event
  - Art Exhibition
  - Food/Cooking event
  - Panel/Lecture event

#### 3. About Page Sections (5 images)
- **Files:**
  - `about-hero.jpg` (1200 × 600 px, ~300KB)
  - `about-history.jpg` (500 × 400 px, ~120KB)
  - `about-mission.jpg` (500 × 400 px, ~120KB)
  - `about-community.jpg` (500 × 400 px, ~120KB)
  - `about-values.jpg` (500 × 400 px, ~120KB)
- **Purpose:** Visual storytelling for About page sections
- **Content:** Organization history, mission, community, values

#### 4. Membership Page (2 images)
- **Files:**
  - `membership-hero.jpg` (800 × 400 px, ~200KB)
  - `membership-benefits.jpg` (800 × 400 px, ~200KB)
- **Purpose:** Visual context for membership sections
- **Content:** Members enjoying events, membership benefits

#### 5. Contact Page (1 image)
- **File:** `contact-visual.jpg`
- **Size:** 600 × 500 px
- **Format:** JPG (~150KB)
- **Purpose:** Visual context for contact form
- **Content:** Stuttgart landmark or meeting space

## Total Image Count: 14 images
## Total Size Budget: ~2.5 MB

## Image Optimization

All images should be:
- Compressed for web (use TinyPNG, ImageOptim, or similar)
- In JPG format for photos
- In WebP format if supported (fallback to JPG)
- Optimized for fast loading (< 200KB each recommended)

## Color Tone

All images should complement the DIDAR design palette:
- Primary colors: Olive (#556b2f), Sage (#6b8e6b), Cream (#fdf7f2)
- Tone: Warm, culturally authentic, inviting
- Style: Contemporary Iranian cultural aesthetic

## Placement Instructions

Once images are added, they will be used in:

1. **Homepage** (`pages/index.js`)
   - Hero banner background
   - Featured event cards (2 event images)

2. **Events Page** (`pages/veranstaltungen/index.js`)
   - All 5 event card images

3. **Event Detail Pages** (`pages/veranstaltungen/[slug].js`)
   - Event images from database (`image_url` field)

4. **About Page** (`pages/ueber-uns.js`)
   - About hero image
   - Sectional images in alternating layout

5. **Membership Page** (`pages/mitglied-werden.js`)
   - Membership hero image
   - Membership benefits image

6. **Contact Page** (`pages/kontakt.js`)
   - Contact visual context image

## Implementation Status

- ✅ CSS styling created (`styles/enhancements.css`)
- ✅ Components updated (EventCard, Header)
- ✅ Image directory created (`public/images/`)
- ⏳ **PENDING:** Image files from user
- ⏳ Page updates to display images
- ⏳ Responsive testing
- ⏳ Optimization and deployment

## Next Steps

1. Provide the 14 images following the specifications above
2. Place them in this directory (`public/images/`)
3. I will update pages to display them
4. Test responsive behavior
5. Optimize and deploy
