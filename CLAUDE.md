# Study Tool — CLAUDE.md

## What This Is
A cross-platform study companion that tracks whether a student is actually focused, tests if they actually retained information, and builds a personal picture of how they study best — without interrupting their flow.

The core promise: **The time you spend studying with this app is real study time. Not fake study time.**

## Name
TBD — currently using "Study_Tool" as a placeholder. Do not assume a product name.

## The Golden Rule
**Only interrupt the user when they are already interrupted.**
Never break focus. Nudges only fire when distraction is already detected.

## Repo Structure
```
backend/        FastAPI Python backend
desktop/        Electron + React + TypeScript desktop app (Mac/Windows/Linux)
mobile/         React Native + Expo (iPad/iPhone/Android)
dashboard/      Next.js web dashboard
docs/           Obsidian vault — product, architecture, decisions, build logs
.github/        CI/CD workflows
docker-compose.yml  Local dev environment
```

## Tech Stack

### Backend
- Language: Python 3.13
- Framework: FastAPI
- Auth: JWT + OAuth2 (Google + Apple)
- Cache: Redis
- ORM: SQLModel (PostgreSQL)
- ODM: Beanie (MongoDB)
- AI: Anthropic Claude API
- Migrations: Alembic
- Testing: pytest
- Deploy: Railway

### Desktop
- Framework: Electron
- UI: React + TypeScript
- Styling: Tailwind CSS
- Webcam: MediaPipe + face-api.js
- Window Tracking: Node.js child_process
- Tray: Electron Tray API
- Build: electron-builder

### Mobile
- Framework: React Native + Expo
- Camera: Expo Camera
- Pencil: Apple PencilKit (iOS only)
- Navigation: React Navigation
- State: Zustand

### Web Dashboard
- Framework: Next.js 14
- Styling: Tailwind CSS
- Charts: Recharts
- Auth: NextAuth.js
- Deploy: Vercel

## Database Schema

### PostgreSQL (SQLModel)
- users
- sessions
- subjects
- checkins

### MongoDB (Beanie)
- activity_events
- focus_predictions

## Privacy Rules — Non-Negotiable
- Webcam data is processed locally ONLY
- No video frames ever leave the device
- No raw camera data stored or transmitted
- Only anonymized signals sent to backend: `{ is_focused, distraction_type, timestamp }`
- No facial recognition data stored anywhere

## Study Modes
- `mac_pc` — window tracking + keyboard/mouse + webcam
- `physical_book` — webcam primary, Mac idle is normal
- `physical_writing` — same as physical_book
- `ipad` — React Native companion, Apple Pencil activity
- `lecture` — window tracking (stay in video app), webcam
- `mix` — auto-detect switches between modes

## Distraction Detection Thresholds
- Face gone 2+ min → nudge
- Phone detected (looking down) → nudge
- Social media / YouTube opened → nudge
- Rapid window switching → nudge
- Complete idle 5+ min → nudge
- Normal thinking pauses < 2min → never nudge
- Brief looks away → never nudge

## AI Check-ins (Claude API)
- Generate 3-5 questions per session before it starts, based on the topic entered
- **Questions ONLY appear when a distraction is already detected** — never during active focus
- The logic: if the user is already off-task, a check-in question brings them back productively
- If the user is focused, no question ever fires — interrupting focus defeats the entire purpose
- Questions are asked one at a time, in order of difficulty (recall → understanding → application)
- Tone: study partner, never teacher
- Never say "WRONG" — say "Good thinking, you might want to revisit..."
- Skipping a question is always allowed, no penalty
- Each question is asked at most once per session
- Any unanswered or skipped questions are presented in the session summary at the end

## API Routes
```
POST   /auth/register
POST   /auth/login
POST   /auth/google
POST   /auth/apple
POST   /auth/refresh
POST   /auth/logout
GET    /users/me
PATCH  /users/me
DELETE /users/me
POST   /sessions/start
POST   /sessions/stop
GET    /sessions
GET    /sessions/:id
GET    /subjects
POST   /subjects
PATCH  /subjects/:id
DELETE /subjects/:id
POST   /activity
GET    /focus/status
GET    /focus/history
GET    /checkins/generate
POST   /checkins/answer
GET    /insights/daily
GET    /insights/weekly
GET    /insights/subjects
GET    /insights/streaks
```

## Build Order
1. Backend foundation (current phase)
2. Desktop app
3. Web dashboard
4. Mobile app
5. Polish + launch

## Environment
- Local dev via Docker Compose
- Backend deployed to Railway
- Dashboard deployed to Vercel
- Never commit `.env` files
- Always use `.env.example` with placeholder values

---

## Obsidian Vault — How It Works

The `docs/` folder is an Obsidian vault. It is the single source of truth for all product decisions, architecture, and build progress. Every session must start by reading it and end by updating it.

### Vault Location
```
/Users/ronnie/Desktop/Study_Tool/Study_Tool/docs/
```

### Folder Structure
```
docs/
├── product/
│   ├── vision.md          — core product promise, target user, design philosophy
│   └── features.md        — full feature list, study modes, distraction thresholds
├── architecture/
│   ├── stack.md           — full tech stack with every layer documented
│   ├── database-schema.md — all PostgreSQL and MongoDB schemas
│   └── api-routes.md      — all API endpoints with method, route, description
├── decisions/
│   └── decision-log.md    — every architectural decision with date and reason
├── build-log/
│   └── session-001.md     — one file per build session, what was done + what's next
└── next-steps.md          — master checklist of everything remaining to build
```

### Session Start Protocol
At the beginning of every new conversation, do these in order:
1. Read `docs/next-steps.md` — understand exactly where the build is
2. Read `docs/build-log/` — find the most recent session file to know what was just done
3. Read any `docs/architecture/` files relevant to today's work
4. Check `docs/decisions/decision-log.md` for any constraints that apply

### Session End Protocol
At the end of every build session, do these before stopping:
1. Create a new file in `docs/build-log/session-00X.md` (increment the number)
2. Log: what was built, what files were created/changed, what broke, what was deferred
3. Update `docs/next-steps.md` — check off completed items, add anything new discovered
4. If an architectural decision was made, log it in `docs/decisions/decision-log.md`
5. If a schema, route, or stack choice changed, update the relevant `docs/architecture/` file

### What Goes in Each File

**build-log/session-00X.md**
```
# Build Log — Session 00X
Date: YYYY-MM-DD
Phase: X — Name

## What Was Done
- bullet list of completed items

## Files Created / Modified
- path/to/file.py — what it does

## Issues Encountered
- anything that broke or was harder than expected

## Decisions Made
- any on-the-fly decisions (also copy to decision-log.md)

## Next Session
- first 3-5 things to do next time
```

**decisions/decision-log.md**
```
## YYYY-MM-DD — Title of Decision
**Decision:** What was decided.
**Reason:** Why this choice was made.
**Alternative considered:** What else was evaluated.
**Revisit when:** Condition that would change this decision.
```

**next-steps.md**
- Keep this as a flat checklist
- Use `- [x]` for done, `- [ ]` for remaining
- Group by phase
- Always reflect current reality — if something was descoped, remove it

### Rules
- Never make a significant architectural decision without logging it in `decision-log.md`
- Never end a session without updating `next-steps.md`
- Never start a session without reading the most recent build log
- If something in the docs contradicts the actual code, trust the code and update the docs

---

## Obsidian Backlinks — Required Linking Rules

Obsidian's power comes entirely from its link graph. A file with no links is an island — it will never appear in backlinks, graph view, or search connections. **Every file written to `docs/` must use `[[wikilinks]]` to connect to related files.**

### How Obsidian Links Work
Use double brackets to link between files:
```
[[filename]]              → links to filename.md in the vault
[[filename|display text]] → links with custom display text
```
Obsidian resolves links by filename only — no path needed unless two files share the same name.

### The Link Map — What Links to What

Every file must contain these links at minimum:

**docs/product/vision.md**
- Links to: `[[features]]`, `[[decision-log]]`

**docs/product/features.md**
- Links to: `[[vision]]`, `[[stack]]`, `[[database-schema]]`, `[[api-routes]]`, `[[decision-log]]`

**docs/architecture/stack.md**
- Links to: `[[database-schema]]`, `[[api-routes]]`, `[[decision-log]]`

**docs/architecture/database-schema.md**
- Links to: `[[stack]]`, `[[api-routes]]`, `[[features]]`

**docs/architecture/api-routes.md**
- Links to: `[[database-schema]]`, `[[stack]]`, `[[features]]`

**docs/decisions/decision-log.md**
- Links to: `[[stack]]`, `[[features]]`, `[[vision]]`, `[[next-steps]]`
- Each decision entry links to the specific file it affects

**docs/build-log/session-00X.md**
- Links to: `[[next-steps]]`, `[[decision-log]]`
- Links to any architecture file touched that session (e.g. `[[stack]]`, `[[database-schema]]`)

**docs/next-steps.md**
- Links to: `[[vision]]`, `[[features]]`
- Links to the most recent build log (e.g. `[[session-002]]`)

### Rules for Linking
- Every new doc file must link to at least 2 other vault files
- Every build log must link to `[[next-steps]]` and `[[decision-log]]`
- When a decision affects a specific architecture file, add a link in that decision entry
- When updating an architecture file, check if any build logs or decisions reference it and add backlinks
- Never create a new `docs/` file without adding its link to at least one existing file
- After writing a new file, go back and add `[[new-filename]]` into the files that relate to it
