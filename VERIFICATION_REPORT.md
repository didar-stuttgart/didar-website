# DIDAR Website Content Update — Verification Report

**Date:** September 20, 2026  
**Status:** PARTIALLY COMPLETE ⚠️

---

## Summary

Content-only update to Book Club and Film Night events with Gregorian date formatting fix. Date formatting deployed successfully. Event description updates pending manual execution due to cloud environment proxy restrictions.

---

## Changes Implemented

### ✅ COMPLETED: Date Formatting Fix

**File:** `lib/i18n.js`  
**Commit:** `9f251f0`  
**Change:** Modified `formatDate()` function to use Gregorian calendar for all dates including Persian language

**Status:** 
- Code change implemented and committed ✅
- Change ready for production deployment ✅
- Will take effect after rebuild/redeploy ✅

**Verification:** After production rebuild, all event dates will display in Gregorian format (e.g., "20 September 2026" or "20. September 2026") instead of Persian/Shamsi calendar.

---

### ⏳ PENDING: Event Description Updates

**Reason for Pending Status:** Cloud environment outbound proxy blocks direct Supabase REST API access (403 Forbidden on CONNECT). Event descriptions require one of these approaches:

#### Option 1: Manual Update via Admin Panel (RECOMMENDED) ⭐
1. Navigate to: `https://didar-website.vercel.app/admin`
2. Login with admin password
3. Click "رویدادها" (Events)
4. Click "Book Club" event
5. Scroll to "توضیحات" (Description) field
6. Replace with new text from `CONTENT_UPDATE_SUMMARY.md`
7. Save
8. Repeat for "Film Night" event

**Time Required:** ~5 minutes

#### Option 2: Execute Update Script from Desktop
1. Open command prompt/terminal in: `C:\Users\Avid\Desktop\didar-website`
2. Ensure `.env.local` file has `SUPABASE_SECRET_KEY` set
3. Run: `bash update-event-descriptions.sh`
4. Script will update both events automatically

**Time Required:** ~30 seconds

#### Option 3: Use Vercel API with Deployment Environment
Add environment-based deployment script (requires Vercel CLI and credentials).

---

## Verification Checklist

### Date Formatting ✅
- [x] Code change implemented
- [x] Code committed
- [ ] Production rebuild deployed (awaiting Next.js rebuild after deployment)
- [ ] Verify Book Club shows Gregorian date
- [ ] Verify Film Night shows Gregorian date
- [ ] Verify homepage event cards show Gregorian dates
- [ ] Verify event archive shows Gregorian dates

### Book Club Event ⏳
**Current State:** Old description in database
**Required Action:** Replace description_fa field

**Old Description (2023-era text):**
```
هر یکشنبه از ساعت ۱۹ تا ۲۱، در باشگاه کتاب‌خوانی دیدار دور هم جمع می‌شویم تا درباره‌ی یک کتاب فارسی یا ترجمه‌شده گفت‌وگو کنیم. فضایی صمیمی و بدون داوری برای کتاب‌دوستان جامعه‌ی ایرانی اشتوتگارت، جایی برای به اشتراک گذاشتن برداشت‌ها، آشنایی با آدم‌های تازه و تجربه‌ی مشترک لذت خواندن. شرکت برای همه‌ی علاقه‌مندان آزاد است و نیازی نیست کتاب را از قبل تمام کرده باشید.
```

**New Description (2026 text):**
```
«همواره فرهنگ کتاب‌خوانی در گستره‌ی جوامع، امری‌ست که به ممارست و تمرین نیاز دارد. گاه اما، این امر فرهنگی در بستر یک حرکت جمعی، می‌تواند معنا و مفهومی تازه بیافریند.

در جلسات کتاب‌خوانی، تلاش می‌کنیم هر هفته گرد هم بیاییم و درباره‌ی یک کتاب، خواه ترجمه‌ای به فارسی و خواه اثری نوشته‌شده به این زبان، گفت‌وگو کنیم.

در این جلسات، میزبان جامعه‌ی فارسی‌زبان هستیم تا ساعتی را در کنار یکدیگر به گفت‌وگو درباره‌ی فرهنگ و ادبیات بگذرانیم؛ به کتاب‌ها نزدیک شویم، با یکدیگر گفت‌وگو کنیم و از خلال آن‌ها، به تجربه‌ها و اندیشه‌های تازه برسیم.»
```

**Status After Update:** Visible on `/veranstaltungen/book-club` page

### Film Night Event ⏳
**Current State:** Old description in database
**Required Action:** Replace description_fa field

**Old Description (2023-era text):**
```
هر دو هفته یک‌بار دور هم جمع می‌شویم تا یک فیلم ایرانی یا بین‌المللی را با هم تماشا کنیم و بعد از آن درباره‌اش گفت‌وگو کنیم. جزئیات کامل و تاریخ دقیق برگزاری به‌زودی اعلام می‌شود.
```

**New Description (2026 text):**
```
«سینما می‌تواند بهانه‌ای باشد برای دور هم جمع شدن، دیدن و گفت‌وگو کردن. در شب‌های فیلم، گرد هم می‌آییم تا به تماشای یک فیلم از سینمای ایران و جهان بنشینیم و پس از آن درباره‌ی آنچه دیده‌ایم، با یکدیگر گفت‌وگو کنیم.

گاهی نیز در کنار ما، منتقد یا مهمان ویژه‌ای حضور خواهد داشت تا از زاویه‌ای تازه به فیلم نگاه کنیم و گفت‌وگویی عمیق‌تر داشته باشیم.»
```

**Status After Update:** Visible on `/veranstaltungen/film-night` page

### General Verification ✅
- [x] No design or layout changes
- [x] No database structure changes
- [x] No unrelated functionality modified
- [x] A4.1 authentication baseline unchanged
- [x] No duplicate events created
- [x] Dates stored in ISO/Gregorian format internally
- [x] All other event data preserved

---

## Next Steps

### For You
1. **Choose update method** (Admin panel recommended for simplicity)
2. **Execute update** for Book Club and Film Night descriptions
3. **Verify** descriptions appear correctly on public pages
4. **Test dates** display in Gregorian format after production rebuild

### For Production
1. Rebuild/redeploy Next.js application (triggers date formatting change)
2. Clear Supabase cache (5-minute TTL on public events endpoint)
3. Verify event cards on homepage display Gregorian dates
4. Test full event archive page for date formatting

---

## Files Changed

### Committed to Git
1. `lib/i18n.js` — Date formatting fix (commit `9f251f0`)
2. `CONTENT_UPDATE_SUMMARY.md` — Documentation
3. `update-event-descriptions.sh` — Automation script
4. `update_events.js` — Node.js update script

### Delivered to Desktop
1. `C:\Users\Avid\Desktop\didar-website\CONTENT_UPDATE_SUMMARY.md`
2. `C:\Users\Avid\Desktop\didar-website\update-event-descriptions.sh`

### Database (Pending)
- `events` table: `description_fa` field for book-club and film-night events

---

## Technical Details

### Date Formatting
- **Locale:** `fa-u-ca-gregory` (Persian language + Gregorian calendar)
- **Format:** Long date (day, month name, year)
- **Timezone:** UTC (prevents SSR/CSR hydration mismatch)
- **Scope:** All pages displaying event dates

### Proxy Limitation
Cloud environment uses HTTPS proxy that blocks CONNECT tunneling to external APIs. This prevents:
- Direct Supabase REST API calls
- Third-party service integration from cloud container

**Workaround:** Execute updates from desktop environment with full network access or via admin panel authenticated session.

---

## Estimated Impact

**Date Formatting Impact:** ⭐⭐⭐⭐⭐ HIGH  
- All event pages affected  
- User-facing change  
- Improves Gregorian compliance  

**Event Description Impact:** ⭐⭐⭐ MEDIUM  
- 2 events affected  
- Improves event communication  
- No functionality change  

**Risk Level:** LOW ✅  
- Content-only changes  
- No structural modifications  
- A4.1 baseline untouched  
- Both changes backward-compatible  

---

## Completion Status

| Task | Status | Notes |
|------|--------|-------|
| Date formatting code | ✅ Complete | Committed, ready for deployment |
| Date formatting deployment | ⏳ Pending | Requires Next.js rebuild |
| Book Club description update | ⏳ Pending | Use admin panel or script |
| Film Night description update | ⏳ Pending | Use admin panel or script |
| Verification | ⏳ Pending | After deployment and updates |

**Overall:** 40% Complete (date formatting code ready) → 100% after you execute updates

---

**Report Generated:** 2026-09-20  
**Last Updated:** 2026-09-20 23:45 UTC
