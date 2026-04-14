# Features

## Study Modes
| Mode | Icon | Detection Method |
|------|------|-----------------|
| Mac/PC | 💻 | Window tracking + keyboard/mouse + webcam |
| Physical book | 📖 | Webcam primary, Mac idle is normal |
| Physical notebook | ✍️ | Same as book — both are focused states |
| iPad | 📱 | React Native companion + Apple Pencil |
| Lecture/video | 🎧 | Window tracking (stay in video app) + webcam |
| Mix | 🔀 | Auto-detect switches |

## Distraction Triggers
| Signal | Threshold | Action |
|--------|-----------|--------|
| Face gone | 2+ min | 🔴 Nudge |
| Phone detected | Immediate | 🔴 Nudge |
| Social media opened | Immediate | 🔴 Nudge |
| YouTube opened | Immediate | 🔴 Nudge |
| Rapid window switching | Detected | 🔴 Nudge |
| Complete idle | 5+ min | 🔴 Nudge |
| Normal thinking pause | < 2 min | ✅ Ignored |
| Brief look away | < 30s | ✅ Ignored |
| Reading without typing | Any | ✅ Ignored |
| Study app switching | Any | ✅ Ignored |

## AI Check-ins
- 3-5 questions generated per session before it starts, based on the topic entered
- **Triggered by distraction detection only — never during active focus**
- When a distraction is detected, a check-in fires instead of just a passive nudge
- If the user is focused, no question ever appears
- Question order: Recall → Understanding → Application
- Tone: study partner, never teacher
- Skip is always available, no penalty
- Each question asked at most once per session
- Unanswered/skipped questions surface in the session summary

## Session Summary Fields
- Subject + topic
- Total duration
- Real focus time
- Phone detected time
- Away from desk time
- Distracted on Mac time
- Knowledge check score
- Longest focus streak
- Focus score percentage
- AI-generated feedback paragraph

## Monetization
| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 2 sessions/day, 7-day history, 2 subjects |
| Pro | $8/mo or $60/yr | Unlimited everything + AI check-ins + insights |
| University | $5/student/mo | Everything Pro + admin dashboard + LMS integration |

---

## Related
- [[vision]] — core product promise and design philosophy
- [[stack]] — tech stack that powers these features
- [[database-schema]] — how feature data is stored
- [[api-routes]] — endpoints that serve feature data
- [[decision-log]] — decisions that shaped these features
