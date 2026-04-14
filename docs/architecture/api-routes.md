# API Routes

Base URL: `http://localhost:8000` (local) / `https://api.studytool.app` (prod)

## Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/register | Create new account |
| POST | /auth/login | Login with email/password |
| POST | /auth/google | OAuth login with Google |
| POST | /auth/apple | OAuth login with Apple |
| POST | /auth/refresh | Refresh JWT access token |
| POST | /auth/logout | Invalidate refresh token |

## Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | /users/me | Get current user |
| PATCH | /users/me | Update profile / daily goal |
| DELETE | /users/me | Delete account |

## Sessions
| Method | Route | Description |
|--------|-------|-------------|
| POST | /sessions/start | Start a new session |
| POST | /sessions/stop | End the current session |
| GET | /sessions | List user sessions (paginated) |
| GET | /sessions/:id | Get single session with full detail |

## Subjects
| Method | Route | Description |
|--------|-------|-------------|
| GET | /subjects | List user's subjects |
| POST | /subjects | Create new subject |
| PATCH | /subjects/:id | Update subject |
| DELETE | /subjects/:id | Delete subject |

## Activity
| Method | Route | Description |
|--------|-------|-------------|
| POST | /activity | Ingest activity event from desktop |

## Focus
| Method | Route | Description |
|--------|-------|-------------|
| GET | /focus/status | Current session focus state |
| GET | /focus/history | Focus history for a session |

## Check-ins
| Method | Route | Description |
|--------|-------|-------------|
| GET | /checkins/generate | Generate questions for a session topic |
| POST | /checkins/answer | Submit an answer to a check-in question |

## Insights
| Method | Route | Description |
|--------|-------|-------------|
| GET | /insights/daily | Today's focus breakdown |
| GET | /insights/weekly | This week's summary |
| GET | /insights/subjects | Per-subject performance stats |
| GET | /insights/streaks | Current and longest streak data |

---

## Related
- [[database-schema]] — data models these routes read and write
- [[stack]] — FastAPI framework these routes are built on
- [[features]] — product features these routes serve
