# Next Steps

## Related
- [[vision]] — why we're building this
- [[features]] — what we're building
- [[session-002]] — most recent build log

---

## Phase 1 — Backend Foundation
- [x] FastAPI skeleton (main.py, config.py, db.py)
- [x] requirements.txt + Dockerfile + .env.example
- [x] PostgreSQL connection (SQLModel + asyncpg)
- [x] MongoDB connection (Beanie + motor)
- [x] Redis connection
- [x] Auth system — register, login, JWT, refresh token, Google OAuth stub
- [x] Users router (GET/PATCH/DELETE /users/me)
- [x] Subjects router (full CRUD)
- [x] Sessions router (start/stop/get, AI questions generated on start)
- [x] Activity ingestion endpoint (POST /activity → returns fire_checkin)
- [x] Focus scoring service (compute_focus_score, golden rule enforced)
- [x] AI check-in service (Claude API — questions, evaluate answer, session feedback)
- [x] Insights endpoints (daily, weekly, subjects, streaks)
- [x] Tests — 15/15 passing on real PostgreSQL
- [ ] Deploy to Railway (deferred — build desktop first, deploy when ready to test end-to-end)

---

## Phase 2 — Desktop App (current)
Branch: `feature/desktop-app`

- [x] Scaffold — Electron + Vite + React + TypeScript in `desktop/`
- [x] Auth screens — login, register, JWT stored via electron-store
- [x] Session start form — subject picker, topic, study mode, goal minutes
- [x] Timer screen — live clock, focus status indicator, stop button
- [x] Focus signal loop — POST /activity every 30s, handle fire_checkin response
- [x] Check-in overlay — non-blocking popup when fire_checkin is true, one question at a time
- [x] Session summary screen — total time, real focus time, score, missed questions
- [x] Full UI redesign — teal/orange design system, Motion animations, Emil Kowalski micro-interactions, spring check-in overlay, ripple focus rings
- [x] Layout fixes — sticky-footer pattern, window 660×720, contrast fixes on all surfaces
- [x] Run and test full app live in Electron window — core loop proven end-to-end (session 006)
- [x] Menu bar tray indicator — teal/amber/gray dot via IPC, updates on every /activity response (session 006)
- [x] Window/app tracking — AppleScript via child_process, real active_app + window switch count (session 006)
- [x] Distraction breakdown in summary — grouped by type+source, Pro paywall with blur+lock overlay (session 006/007)
- [x] Bottom tab navigation — Home, History, Profile tabs; timer is nav-free; session 007
- [x] History screen — lists past sessions with subject color, date, score (session 007)
- [x] Profile screen — user card, subscription badge, upgrade CTA, sign out (session 007)
- [ ] Webcam presence detection — MediaPipe, runs locally, never sends video
- [ ] Design polish pass — deferred until webcam done
- [ ] Build for Mac (.dmg via electron-builder)

---

## Phase 3 — Web Dashboard
[ ] Next.js setup + Vercel deploy
- [ ] Daily + weekly dashboard
- [ ] Subject performance charts
- [ ] Shareable focus cards

## Phase 4 — Mobile
- [ ] React Native + Expo setup
- [ ] Camera-based presence detection
- [ ] Apple Pencil activity tracking (iOS)
- [ ] App Store submission

## Phase 5 — Launch
- [ ] Stripe billing
- [ ] Privacy audit
- [ ] Beta with 10 students
- [ ] Product Hunt
