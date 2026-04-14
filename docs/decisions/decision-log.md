# Decision Log

## Related
- [[stack]] — tech choices these decisions shaped
- [[features]] — product decisions made here
- [[vision]] — core principles behind these decisions
- [[next-steps]] — how decisions affect what gets built

---

## 2026-04-13 — Skip Kafka for MVP
**Decision:** Use Redis queues instead of Kafka for activity event processing in the initial build.
**Reason:** Kafka adds significant infrastructure complexity (Zookeeper, topic management, consumer groups) that is unnecessary at early user counts. Redis + asyncio handles thousands of events/second easily. Can migrate to Kafka when scale demands it.
**Revisit when:** Active concurrent users exceed 10,000.
**Affects:** [[stack]], [[database-schema]]

## 2026-04-13 — PostgreSQL + MongoDB dual database
**Decision:** Keep both PostgreSQL (relational data) and MongoDB (time-series activity events).
**Reason:** Activity events and focus predictions are high-volume, schema-flexible, time-series data that PostgreSQL handles poorly at scale. MongoDB is purpose-built for this pattern.
**Alternative considered:** PostgreSQL JSONB for activity events — valid for MVP, but schema migrations become painful as signal types evolve.
**Affects:** [[stack]], [[database-schema]]

## 2026-04-13 — Local webcam processing only
**Decision:** All camera data is processed on-device. No video frames leave the device.
**Reason:** A webcam-based app for students has an extremely high privacy bar. Any cloud processing of camera data, even briefly, is a non-starter for school/parent trust. Local MediaPipe inference is fast enough.
**This decision is permanent.** It is not revisited at any scale.
**Affects:** [[features]], [[stack]]

## 2026-04-13 — AI check-ins fire on distraction only, never on a timer
**Decision:** Check-in questions only appear when a distraction event is already detected. They never fire on a time interval while the user is focused.
**Reason:** The entire product promise is to never interrupt focus. Firing a question every 15-20 minutes on a timer directly breaks that promise. If the user is already distracted, a question is a productive way to re-engage them. If they are focused, any pop-up is a net harm.
**Alternative considered:** Timed intervals (every 15-20 min) — rejected because it violates the golden rule.
**This decision is permanent.** It is not revisited.
**Affects:** [[features]], [[vision]]

## 2026-04-13 — active_session_id has no FK constraint
**Decision:** `users.active_session_id` stores the UUID of the current session but has NO foreign key to `sessions`.
**Reason:** `users.user_id` → `sessions` and `sessions.active_session_id` → `users` creates a circular dependency that PostgreSQL cannot resolve when dropping tables. Removing the FK from the users side breaks the cycle. Application code enforces the relationship instead.
**Revisit when:** Never — the circular dependency is architectural, not incidental.
**Affects:** [[database-schema]]

## 2026-04-13 — bcrypt pinned to 4.0.1
**Decision:** `bcrypt==4.0.1` is pinned in requirements.txt and must not be upgraded without also upgrading passlib.
**Reason:** bcrypt 5.x changed its internal API in a way that breaks passlib 1.7.4's detect_wrap_bug function, raising ValueError during password hashing. passlib 1.7.4 is the last stable release of passlib (project is unmaintained). Until we migrate off passlib entirely, bcrypt must stay at 4.0.1.
**Revisit when:** We replace passlib with a maintained alternative (e.g. pwdlib).
**Affects:** [[stack]]

## 2026-04-13 — Desktop app before web dashboard
**Decision:** Build the Electron desktop app before the Next.js web dashboard.
**Reason:** The core value proposition (real-time focus tracking, menu bar indicator, session summary) lives in the desktop app. The dashboard is a reporting layer. Proving the core loop works comes before building the reporting.
**Affects:** [[next-steps]], [[stack]]
