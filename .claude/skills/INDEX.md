# Skills Index

This folder is the home for all project-wide Claude Code skills.
Skills specific to one layer live in that layer's `.claude/skills/` folder.

---

## Installed Skills

### Project-Wide (this folder)
| Skill | Purpose | Status |
|-------|---------|--------|
| ui-ux-pro-max | Design system — 67 styles, 161 color palettes, 57 typography pairings, 99 UX rules | Active |
| motion | Animation patterns for React/Electron using Motion v12 (Framer Motion) | Active |
| 21st-dev-magic | AI component generation via MCP server — production-ready React + Tailwind components | Active |
| emil-design-eng | Emil Kowalski's design engineering philosophy — easing, timing, micro-interactions, performance | Active (symlinked from .agents/skills/) |

### MCP Servers (global `~/.claude.json`)
| Server | Purpose | Status |
|--------|---------|--------|
| magic (21st.dev) | AI component generation | Connected |
| Google Drive | File access | Needs auth |
| Google Calendar | Calendar access | Needs auth |
| Gmail | Email access | Needs auth |

### npm Packages
| Package | Purpose |
|---------|---------|
| motion v12 | Animations for desktop React app |

---

## How to Add a New Skill

**Project-wide skill:**
```bash
cd /Users/ronnie/Desktop/Study_Tool/Study_Tool
uipro init --ai claude   # or whatever the skill's installer is
```

**Layer-specific skill:**
```bash
cd /Users/ronnie/Desktop/Study_Tool/Study_Tool/desktop   # or backend/, dashboard/, etc.
# run installer from that directory
```

**MCP server:**
```bash
claude mcp add <name> --scope user -- npx -y <package>
```
