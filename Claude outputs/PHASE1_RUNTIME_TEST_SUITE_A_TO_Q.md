# Phase 1 Runtime Test Suite (Tests A-Q)
**Production URL**: https://didar-stuttgart.com/  
**Test Date**: 2026-09-21  
**Tester**: [Your Name]  
**Browser**: Chrome (Desktop)  
**Device**: Windows  

---

## Test A: Admin Login

**Objective**: Verify admin authentication works on production

**Steps**:
1. Navigate to https://didar-stuttgart.com/admin/login
2. Enter admin password
3. Click "ورود" (Login) button
4. Verify redirected to /admin/events

**Expected Result**: Successfully authenticated, admin panel accessible  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of /admin/events page]

---

## Test B: Create Event

**Objective**: Verify event creation works with new capacity validation

**Steps**:
1. From /admin/events, click "رویداد جدید" (New Event)
2. Fill in required fields:
   - Title (FA): "تست رویداد"
   - Title (DE): "Test Veranstaltung"
   - Date: Today's date
3. Set Capacity to 50
4. Click "ذخیره" (Save)
5. Verify event created and redirected to /admin/events

**Expected Result**: Event created successfully with capacity=50  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot showing new event in list]

---

## Test C: Persistence - Capacity Empty

**Objective**: Verify empty capacity is persisted as unlimited

**Steps**:
1. Create event with NO capacity value (leave blank)
2. Save event
3. Navigate to edit event
4. Verify capacity field is empty

**Expected Result**: Capacity field empty, indicating unlimited  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of edit form with empty capacity]

---

## Test D: Edit Event - Change Capacity

**Objective**: Verify editing events with capacity validation

**Steps**:
1. From /admin/events, click on an existing event
2. Change capacity from 50 to 75
3. Click "ذخیره" (Save)
4. Navigate back and verify capacity updated

**Expected Result**: Capacity successfully updated to 75  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of updated capacity]

---

## Test E: Publish Event

**Objective**: Verify event publish changes status to 'published'

**Steps**:
1. Open an event in /admin/events
2. Change status from "draft" to "published"
3. Click "ذخیره" (Save)
4. Verify status changed

**Expected Result**: Event status changed to published  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of published event]

---

## Test F: Public Event Rendering

**Objective**: Verify published event displays on public site

**Steps**:
1. Navigate to https://didar-stuttgart.com/events
2. Verify published event from Test E is visible
3. Click event to open detail page
4. Verify all details display correctly (title, date, capacity)

**Expected Result**: Event visible on public site with all details  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of event detail page]

---

## Test G: Archive Event

**Objective**: Verify soft-delete archiving works

**Steps**:
1. From /admin/events, click "حذف" (Delete/Archive) button on an event
2. Confirm deletion
3. Verify event no longer appears in /admin/events list
4. Verify event no longer appears on public /events page

**Expected Result**: Event archived (soft-deleted), removed from both admin and public views  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of empty list or without archived event]

---

## Test H: Duplicate Event

**Objective**: Verify event duplication creates copy with draft status

**Steps**:
1. From /admin/events, open an existing published event
2. Click "کپی کردن" (Duplicate) button
3. Verify redirected to new event form with copied data
4. Verify new title has "(کپی)" suffix
5. Verify status is "draft"
6. Click save

**Expected Result**: New draft event created with duplicated data  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of duplicated event in admin list]

---

## Test I: Persian Search

**Objective**: Verify search functionality in Persian

**Steps**:
1. Go to /admin/events
2. Create or ensure event with Persian title exists
3. Use search field to find by Persian title part
4. Verify event appears in filtered results

**Expected Result**: Search filters events by Persian title  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of search results]

---

## Test J: German Search

**Objective**: Verify search functionality in German

**Steps**:
1. Go to /admin/events
2. Use search field to find by German title part
3. Verify event appears in filtered results

**Expected Result**: Search filters events by German title  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of German search results]

---

## Test K: Status Filters

**Objective**: Verify filtering by event status

**Steps**:
1. Go to /admin/events
2. Click status filter dropdown
3. Select "draft"
4. Verify only draft events displayed
5. Select "published"
6. Verify only published events displayed

**Expected Result**: Filter correctly narrows event list  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of filtered views]

---

## Test L: Registration Regression

**Objective**: Verify registration functionality still works

**Steps**:
1. Navigate to a published event on public site
2. Click "ثبت‌نام" (Register) button
3. Fill in registration form
4. Submit registration
5. Verify confirmation message

**Expected Result**: Registration accepts and confirms submission  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of registration confirmation]

---

## Test M: Mobile QA - Responsive Layout

**Objective**: Verify admin panel is responsive on mobile

**Steps**:
1. Open admin events page (/admin/events) on mobile device or emulated viewport (375px width)
2. Verify layout adapts:
   - Navigation readable
   - Form fields accessible
   - Buttons clickable
   - Text readable without zooming

**Expected Result**: Admin panel responsive and usable on mobile  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of mobile admin view]

---

## Test N: Console/Network Errors

**Objective**: Verify no critical errors in browser console or network

**Steps**:
1. Open admin events page (/admin/events)
2. Open browser DevTools (F12)
3. Go to Console tab
4. Verify no red errors (warnings OK)
5. Go to Network tab
6. Verify all requests return 2xx or 3xx status codes (no 4xx/5xx)

**Expected Result**: No critical console errors, all network requests successful  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of DevTools console and network tab]

---

## Test O: Capacity Validation - Zero Rejection

**Objective**: Verify capacity=0 is rejected on server

**Steps**:
1. From /admin/events/new, try to submit with capacity=0
2. Open browser DevTools Network tab
3. Observe the API response

**Expected Result**: Server returns 400 error: "Capacity must be empty or a positive integer (1 or higher)"  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of API 400 response]

---

## Test P: Capacity Validation - Decimal Rejection

**Objective**: Verify capacity=25.5 is rejected on server

**Steps**:
1. From /admin/events/new, try to submit with capacity=25.5
2. Open browser DevTools Network tab
3. Observe the API response

**Expected Result**: Server returns 400 error: "Capacity must be empty or a positive integer (1 or higher)"  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of API 400 response]

---

## Test Q: Cleanup - Final State

**Objective**: Verify database and UI in clean final state

**Steps**:
1. From /admin/events, review all events
2. Ensure test events are archived
3. Verify only production events remain
4. Check no lingering test data

**Expected Result**: Admin panel shows only permanent production events  
**Status**: ⏳ PENDING (requires manual testing)  
**Evidence**: [Screenshot of final admin events list]

---

## Summary Table

| Test | Objective | Result | Evidence |
|------|-----------|--------|----------|
| A | Admin Login | ⏳ | |
| B | Create Event | ⏳ | |
| C | Persistence - Empty Capacity | ⏳ | |
| D | Edit Event | ⏳ | |
| E | Publish Event | ⏳ | |
| F | Public Event Rendering | ⏳ | |
| G | Archive Event | ⏳ | |
| H | Duplicate Event | ⏳ | |
| I | Persian Search | ⏳ | |
| J | German Search | ⏳ | |
| K | Status Filters | ⏳ | |
| L | Registration Regression | ⏳ | |
| M | Mobile QA | ⏳ | |
| N | Console/Network | ⏳ | |
| O | Capacity=0 Rejection | ⏳ | |
| P | Capacity=25.5 Rejection | ⏳ | |
| Q | Cleanup | ⏳ | |

---

## Overall Status: READY FOR TESTING

All tests are prepared and ready for manual execution on production.

**Instructions for Tester**:
1. Execute tests A-Q in order
2. Capture screenshots of each test result
3. Note any failures or unexpected behaviors
4. Complete summary table with PASS/FAIL/BLOCKED status
5. Document evidence for final QA report

---
*Test suite prepared for Phase 1 completion verification*
