# Build Log — Session 002

**Date:** 2026-04-13
**Phase:** 1 — Backend Foundation (complete)

## What Was Done
- Built the entire FastAPI backend from scratch
- All 15 tests passing on real PostgreSQL (no mocks)
- Merged `feature/backend-foundation` → `main` via PR with no conflicts

## Files Created
- `backend/app/config.py` — Pydantic Settings, loads all env vars from .env
- `backend/app/db.py` — async connections to PostgreSQL (SQLModel), MongoDB (Beanie), Redis
- `backend/app/main.py` — FastAPI app, lifespan startup/shutdown, CORS, all routers included
- `backend/app/models/user.py` — User, UserCreate, UserUpdate, UserPublic, SubscriptionTier enum
- `backend/app/models/session.py` — Session, StudyMode enum (mac_pc, physical_book, physical_writing, ipad, lecture, mix)
- `backend/app/models/subject.py` — Subject model
- `backend/app/models/checkin.py` — CheckIn model (question, answer, is_correct, skipped)
- `backend/app/models/activity.py` — ActivityEvent (Beanie/MongoDB document)
- `backend/app/models/focus.py` — FocusPrediction (Beanie/MongoDB document)
- `backend/app/routers/auth.py` — register, login, refresh, logout, google OAuth
- `backend/app/routers/users.py` — GET/PATCH/DELETE /users/me
- `backend/app/routers/subjects.py` — full CRUD
- `backend/app/routers/sessions.py` — start/stop/get, generates AI questions on start
- `backend/app/routers/activity.py` — POST /activity, returns fire_checkin signal
- `backend/app/routers/focus.py` — GET /focus/status, /focus/history
- `backend/app/routers/checkins.py` — GET /checkins/generate, POST /checkins/answer
- `backend/app/routers/insights.py` — daily, weekly, subjects, streaks
- `backend/app/routers/deps.py` — get_current_user dependency (JWT validation)
- `backend/app/services/auth_service.py` — hash_password, verify_password, create_access_token, create_refresh_token, get_user_by_email
- `backend/app/services/focus_service.py` — compute_focus_score(), returns (score, is_focused, distraction_type)
- `backend/app/services/ai_service.py` — generate_session_questions(), get_next_checkin_question(), evaluate_answer(), generate_session_feedback()
- `backend/requirements.txt` — all dependencies pinned
- `backend/Dockerfile`
- `backend/.env.example`
- `backend/pytest.ini` — asyncio_mode=auto, asyncio_default_fixture_loop_scope=function
- `backend/tests/conftest.py` — function-scoped async fixtures, real DB teardown via DROP SCHEMA CASCADE
- `backend/tests/test_auth.py` — 6 tests
- `backend/tests/test_focus_service.py` — 5 tests (golden rule verified)
- `backend/tests/test_subjects.py` — 4 tests

## Issues Encountered & Fixed
- **Circular FK** — `users.active_session_id` had a FK to `sessions`, but `sessions.user_id` FKs to `users`. PostgreSQL can't sort the drop order. Fix: removed FK from `active_session_id`, now a plain UUID with a comment explaining why.
- **Event loop mismatch** — `test_engine` was session-scoped, but asyncpg connections bind to the loop they're created in. Subsequent tests (new loops) failed. Fix: changed `test_engine` to function scope and set `asyncio_default_fixture_loop_scope = function` in pytest.ini.
- **bcrypt 5.0 incompatible with passlib 1.7.4** — bcrypt 5.x changed its internal API. passlib's detect_wrap_bug function called the old API and raised ValueError. Fix: pinned `bcrypt==4.0.1` in requirements.txt.
- **DROP SCHEMA needed for teardown** — `SQLModel.metadata.drop_all` failed when the live DB had FK constraints that differed from the model (stale schema). Fix: replaced drop_all with `DROP SCHEMA public CASCADE; CREATE SCHEMA public` executed as two separate statements (asyncpg rejects multiple statements in one prepared call).

## Decisions Made
- See [[decision-log]] — active_session_id FK removal, bcrypt pin

## Next Session
Begin Phase 2 — Desktop App (`feature/desktop-app` branch already created off main):
1. Scaffold Electron + Vite + React + TypeScript in `desktop/`
2. Auth screens (login/register), JWT stored locally via electron-store
3. Session flow (start form → timer screen → stop)
4. Focus signal loop — POST /activity every 30s, receive fire_checkin
5. Check-in overlay — appears only when fire_checkin is true
6. Webcam presence detection (MediaPipe, local only)
7. Window/app tracking (Node.js native, Mac first)

---

## Related
- [[next-steps]] — updated checklist
- [[decision-log]] — decisions made this session
- [[stack]] — backend stack now fully built
