# Database Schema

## PostgreSQL

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| email | STRING UNIQUE | |
| hashed_password | STRING | nullable if OAuth only |
| name | STRING | |
| avatar_url | STRING | |
| subscription | ENUM | free / pro / university |
| daily_goal_min | INT | default 120 |
| active_session_id | UUID FK | nullable |
| google_id | STRING | nullable |
| apple_id | STRING | nullable |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### sessions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| subject_id | UUID FK | |
| topic | STRING | |
| section | STRING | |
| study_mode | ENUM | mac_pc / physical_book / physical_writing / ipad / lecture / mix |
| duration_goal_min | INT | |
| started_at | TIMESTAMP | |
| ended_at | TIMESTAMP | nullable |
| total_minutes | INT | |
| real_focus_min | INT | |
| focus_score | FLOAT | 0.0 - 1.0 |
| distraction_count | INT | |
| goal | STRING | nullable, free text |
| ai_feedback | TEXT | generated at session end |

### subjects
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| name | STRING | |
| color | STRING | hex color |
| created_at | TIMESTAMP | |

### checkins
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| session_id | UUID FK | |
| user_id | UUID FK | |
| question | TEXT | |
| user_answer | TEXT | nullable |
| is_correct | BOOLEAN | nullable |
| asked_at | TIMESTAMP | |
| answered_at | TIMESTAMP | nullable |
| skipped | BOOLEAN | default false |

## MongoDB

### activity_events
```json
{
  "user_id": "string",
  "session_id": "string",
  "event_type": "string",
  "timestamp_ms": "number",
  "payload": "object"
}
```

### focus_predictions
```json

{
  "user_id": "string",
  "session_id": "string",
  "window_start": "number",
  "window_end": "number",
  "focus_score": "float",
  "is_focused": "boolean",
  "signals": {
    "keystrokes_pm": "number",
    "mouse_clicks_pm": "number",
    "window_switches": "number",
    "face_present": "boolean",
    "looking_at_screen": "boolean"
  }
}
```

---

## Related
- [[stack]] — the databases and ORMs used to implement this schema
- [[api-routes]] — endpoints that read and write this data
- [[features]] — features that drive these schema decisions
- [[decision-log]] — decisions behind PostgreSQL vs MongoDB split
