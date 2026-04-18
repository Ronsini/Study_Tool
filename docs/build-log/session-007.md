# Build Log — Session 007
Date: 2026-04-15
Phase: 2 — Desktop App

## What Was Done
- Added bottom tab navigation bar (Home / History / Profile) visible on all authenticated screens except the active timer
- Created Profile screen: avatar initials, subscription badge, daily goal, upgrade CTA (free users only), sign out
- Created History screen: fetches GET /sessions + GET /subjects, renders session cards with subject color, topic, date, duration, focus score; handles empty + error states
- Added `sessions.list()` to the API client (`desktop/src/lib/api.ts`)
- Restructured App.tsx: auth screens (no nav), timer (no nav, prevents mid-session navigation), all other logged-in screens (with BottomNav)
- Fixed distraction breakdown paywall: blur now `blur-[7px] opacity-30 saturate-0` (was `blur-sm`), overlay is 88% opaque with lock icon SVG, placeholder rows shown when no real distractions so the blurred area looks convincingly locked

## Files Created / Modified
- `desktop/src/components/BottomNav.tsx` — NEW: 3-tab bottom nav (Home/History/Profile), motion whileTap, inline SVG icons
- `desktop/src/screens/HistoryScreen.tsx` — NEW: session history list with subject color coding, date formatting, focus score color
- `desktop/src/screens/ProfileScreen.tsx` — NEW: user card, daily goal, free-user upgrade CTA, sign out
- `desktop/src/App.tsx` — REWRITTEN: split into auth/timer/main layouts, added BottomNav, Screen type extended
- `desktop/src/lib/api.ts` — added `sessions.list(limit, offset)` using GET /sessions
- `desktop/src/screens/SummaryScreen.tsx` — stronger paywall: blur+dim+desaturate, opaque overlay, placeholder distraction rows for free users

## Issues Encountered
- Rolldown (Vite 6) requires `import type` for type-only re-exports; fixed `NavTab` import in App.tsx
- `totalDistractionMin` variable was left unused after IIFE refactor — removed
- Variable shadowing: renamed inner `totalMin` to `rowsTotal` inside paywall IIFE to avoid conflict with outer `totalMin`

## Decisions Made
- Bottom tabs instead of sidebar: 660px window is too narrow for a sidebar; tabs fit naturally
- Timer screen intentionally has no nav: user should not navigate away from an active session
- Summary screen shows nav: user should be able to go to History or Profile after reviewing results
- Placeholder distraction rows for free users: makes the paywall look like locked real data, more enticing to upgrade
- `import type { NavTab }` from BottomNav: Rolldown strict ESM module analysis requires explicit type-only imports

## Next Session
1. Test the navigation flow end-to-end: login → home → start session → timer → summary → history → profile
2. Webcam presence detection — MediaPipe face detection, local only, sends boolean `face_present` signal
3. Design polish pass on all screens once webcam is wired in
4. Mac .dmg build via electron-builder
