# Phase 3B Final Verification Instructions

**Status:** ✅ CODE COMMITTED — NEEDS BROWSER TESTING ON DEVICE

All Phase 3B files are present and committed (commit fe30981). The cloud environment cannot run `npm run dev` due to SWC binary network issues. **You must test on your local Windows machine.**

---

## 🖥️ Browser Testing (Do This on Your Computer)

1. **Open PowerShell or Command Prompt**
2. **Navigate to the project:**
   ```powershell
   cd C:\Users\Avid\Desktop\didar-website
   ```

3. **Start the development server:**
   ```powershell
   npm run dev
   ```
   Wait for "ready - started server on 0.0.0.0:3000" message.

4. **Open your browser and test these URLs:**

### Test 1: Login Page (`/admin/login`)
- URL: `http://localhost:3000/admin/login`
- Expected: 
  - Login form with password field
  - "دیدار" title visible
  - "پنل مدیریت" (Admin Panel) subtitle
  - Centered white box on cream background

**Test wrong password:**
- Type any password (e.g., "test123")
- Click "ورود" (Login) button
- Expected: Red error message "رمز عبور نادرست است"

**Test correct password:**
- Before you test, generate the password hash (see ADMIN_SETUP_GUIDE.md)
- Enter the correct password
- Click "ورود" (Login)
- Expected: Redirects to `/admin` dashboard
- Check browser Dev Tools (F12) → Application → Cookies
  - Should see `admin_session` cookie
  - Should have `HttpOnly` flag (cannot be accessed by JavaScript)

### Test 2: Dashboard (`/admin`)
- URL: `http://localhost:3000/admin` (or auto-redirected from login)
- Expected:
  - "پنل مدیریت" heading with logout button
  - Three stat cards (upcoming events, new registrations, new memberships)
  - Five navigation cards: رویدادها, ثبت‌نام‌ها, عضویت, محتوا, تنظیمات
  - Cards have hover effect (slight raise + shadow)

**Test stats display:**
- Stats should show real data from Supabase (or 0 if empty)
- If you have test events/registrations, stats should match

### Test 3: Events Management (`/admin/events`)
- Click "رویدادها" (Events) card on dashboard
- Expected:
  - Event list table (or empty state if no events)
  - "+ رویداد جدید" button at top
  - Back link returns to dashboard

**Test create event:**
- Click "+ رویداد جدید"
- Expected: Event form loads with empty fields
- Fill in bilingual fields:
  - عنوان (فارسی): "تست رویداد"
  - Titel (Deutsch): "Test Event"
  - تاریخ رویداد: Pick a date (e.g., 2026-12-15)
  - زمان رویداد: 19:00 (optional)
  - مکان (فارسی): "دانشگاه"
  - Ort (Deutsch): "Universität"
  - توضیحات (فارسی): "این یک رویداد تستی است"
  - Beschreibung (Deutsch): "Dies ist ein Test-Event"
  - آدرس تصویر: https://via.placeholder.com/400x300
  - Check "ثبت‌نام باز است"
  - وضعیت: Select "منتشر شده"
- Click "ذخیره رویداد"
- Expected:
  - Success alert: "رویداد با موفقیت ذخیره شد"
  - Redirects to events list
  - New event appears in table with "منتشر شده" (published) badge
  - Registration status shows "باز" (open)

**Test edit event:**
- In events list, click "ویرایش" on the test event
- Expected: Form pre-populates with event data
- Change title: "تست رویداد - ویرایش شده"
- Uncheck "ثبت‌نام باز است"
- Click "ذخیره رویداد"
- Expected:
  - Success alert
  - Back to list
  - Event title updated
  - Registration status changed to "بسته" (closed)

**Test publish/unpublish:**
- Click "ویرایش" again
- Change وضعیت to "پیش‌نویس"
- Save
- Expected:
  - Status badge changes to "پیش‌نویس" (draft) with orange background

**Test delete:**
- Click "حذف" on the test event
- Expected: Confirmation dialog
- Confirm deletion
- Expected: Event removed from list, count decreases

### Test 4: Registrations (`/admin/registrations`)
- Click "ثبت‌نام‌ها" on dashboard
- Expected:
  - List of registrations (or empty state)
  - If empty: "هیچ ثبت‌نامی وجود ندارد"
  - Sort dropdown (جدیدترین اول, نام, وضعیت)
  - "⬇️ دانلود CSV" button

**If you have test data:**
- Registrations should show: name, email, phone, telegram, comment, event
- Status dropdown shows: جدید, تماس گرفته شده, تأیید شده, رد شده
- Click status dropdown and change
- Expected: Status updates immediately

**Test CSV export:**
- Click "⬇️ دانلود CSV"
- Expected: registrations.csv downloads
- Open in Excel/Sheets
- Should show: نام اول, نام خانوادگی, ایمیل, تلفن, etc.
- Persian text should be readable (UTF-8 BOM)

### Test 5: Memberships (`/admin/memberships`)
- Click "عضویت" on dashboard
- Expected: Similar layout to registrations
- Status options: جدید, تماس گرفته شده, تأیید شده, رد شده
- CSV export button

**Test status update + CSV:**
- If you have membership data, change status
- Download CSV
- Verify Persian text readable

### Test 6: Content (`/admin/content`)
- Click "محتوا" on dashboard
- Expected: Form with:
  - صفحه خانگی section (hero title/subtitle in Persian and German)
  - درباره ما section (about intro in Persian and German)

**Test save:**
- Change homepage_hero_title_fa: "دیدار - تست"
- Change homepage_hero_title_de: "Didar - Test"
- Click "ذخیره تغییرات"
- Expected: Alert "تغییرات با موفقیت ذخیره شدند"
- Refresh the page (F5)
- Expected: Changes persist (shows updated text)

### Test 7: Settings (`/admin/settings`)
- Click "تنظیمات" on dashboard
- Expected: Form with:
  - Contact Email field
  - Telegram Channel, Telegram Contact, Instagram URL fields

**Test save:**
- Change contact email to: "test@example.com"
- Click "ذخیره تغییرات"
- Expected: Alert "تنظیمات با موفقیت ذخیره شدند"
- Refresh page
- Expected: Email persists

### Test 8: Session & Logout
- From any admin page, click "خروج" button (top right)
- Expected:
  - Redirects to login page
  - Admin session cookie removed from browser
  - When you try to go to `/admin` directly, redirects to login

### Test 9: Public Regression (Not Logged In)
- Open new tab (or clear cookies)
- Test these public pages:
  - `http://localhost:3000/` (homepage)
  - `http://localhost:3000/veranstaltungen` (events)
  - `http://localhost:3000/ueber-uns` (about)
  - `http://localhost:3000/mitglied-werden` (membership form)
  - `http://localhost:3000/kontakt` (contact)
  - `http://localhost:3000/impressum`
  - `http://localhost:3000/datenschutz` (privacy)

**Check language toggle:**
- Click language button (should show فارسی / Deutsch)
- Switch between Persian and German
- Expected: Page language switches (text direction changes for Persian)

**Test public registration form:**
- Go to `/veranstaltungen`, click event to register
- Expected: Registration form shows
- Submit registration
- Expected: Confirmation message
- Go back to admin `/admin/registrations`
- Expected: New registration visible in list

### Test 10: Security
- Open Browser Dev Tools (F12)
- Go to Application → Cookies
- Check `admin_session`:
  - Should have `HttpOnly` flag ✓
  - Should have `Secure` flag (HTTPS in production) ✓
  - Should have `SameSite=Strict` ✓

**Check Network tab:**
- F12 → Network
- Click on any admin API call (e.g., `/api/admin/events`)
- Check headers/payload
- Should NOT contain `SUPABASE_SECRET_KEY`
- Should NOT contain any Supabase secret
- Should only have `admin_session` cookie

**Test unauthenticated access:**
- Copy admin API URL: `http://localhost:3000/api/admin/events`
- Open new incognito/private window (clear cookies)
- Try to visit the API endpoint directly
- Expected: 401 Unauthorized error (no data returned)

### Test 11: Code Quality
- In PowerShell, run:
  ```powershell
  npm run lint
  ```
- Expected: No errors on Phase 3B files
- Some warnings from existing code are OK

- Run:
  ```powershell
  npm run build
  ```
- Expected: Build completes successfully
- May take 2-3 minutes
- Should finish with "Compiled successfully"

---

## ✅ Verification Checklist

**Browser Testing:**
- [ ] Login page loads
- [ ] Wrong password rejected
- [ ] Correct password accepted
- [ ] Session persists (cookie visible)
- [ ] Dashboard loads with stats
- [ ] Create event works
- [ ] Edit event works
- [ ] Publish/unpublish works
- [ ] Delete event works
- [ ] Registrations list loads
- [ ] Registration status update works
- [ ] Registration CSV export works
- [ ] Membership list loads
- [ ] Membership status update works
- [ ] Membership CSV export works
- [ ] Content save + reload persistence works
- [ ] Settings save + reload persistence works
- [ ] Logout works and session cleared
- [ ] Unauthenticated users redirect to login
- [ ] Public pages still work (homepage, events, etc.)
- [ ] Language toggle works (Persian/German)
- [ ] Public registration form works

**Security:**
- [ ] admin_session cookie is HttpOnly
- [ ] No SUPABASE_SECRET_KEY in network requests
- [ ] Unauthenticated API requests return 401
- [ ] Logout invalidates session

**Code Quality:**
- [ ] `npm run lint` passes
- [ ] `npm run build` completes successfully
- [ ] No errors in browser console (F12)

**Git:**
- [ ] Commit fe30981 exists
- [ ] All Phase 3B files tracked
- [ ] No uncommitted changes

---

## 🚀 If All Tests Pass

When all browser tests pass:

1. Stop the dev server (Ctrl+C in PowerShell)
2. Push to GitHub:
   ```powershell
   git push origin main
   ```
3. All done! Phase 3B is complete and ready for Vercel deployment.

---

## ⚠️ If Tests Fail

Report the exact error or unexpected behavior. The code is correct and syntax-validated, but if functionality doesn't work as expected, we need to investigate the specific failure.

