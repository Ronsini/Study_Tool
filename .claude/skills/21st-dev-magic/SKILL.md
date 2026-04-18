# 21st.dev Magic — AI Component Generation Skill

## What It Is
21st.dev Magic is an MCP server that generates production-ready UI components on demand. It is connected as an MCP server in Claude Code (not an npm package).

## Connection
```
MCP server: magic
Command: npx -y @21st-dev/magic@latest
Status: Connected (verified)
Scope: user (~/.claude.json)
```

## How to Use
When building a new UI component, invoke Magic by describing what you need. It returns complete, styled, production-ready component code tailored to the stack.

### Example prompts to Magic:
- "Create a dark mode study timer component with a large clock display and focus indicator"
- "Generate a subject picker card grid with color swatches for a study app"
- "Build an animated check-in question overlay with answer input and skip button"

## Stack Context to Always Pass
When using Magic for this project, always specify:
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Motion (Framer Motion v12)
- **Theme:** Dark mode, background #0f0f0f, accent violet-600
- **Platform:** Electron desktop app (no browser chrome)

## Rules for This Project
- Always adapt Magic output to match our design system (teal primary, orange CTA, Inter font)
- Magic components must use Tailwind classes only — no inline styles unless necessary
- Always check Magic output for `window.electron` compatibility before using
- Magic is best for: complex components (charts, carousels, data displays, overlays)
- Magic is overkill for: simple buttons, labels, basic inputs — write those manually
