# Study Tool — Skills
# Single source of truth for ALL design and engineering skills.
# ALL skill content is baked directly into this file — no external references needed.
# READ THIS AT THE START OF EVERY SESSION BEFORE DOING ANY WORK.

---

## Who This App Is For

College and university students studying on Mac. Used at a desk during active study sessions — evenings, late nights, exam season. The app runs alongside their actual work (PDFs, notes, browser). They are not supervised — they are choosing to hold themselves accountable.

A student opens the app, starts a session, goes back to studying. The app lives in the background. When the session ends, they see an honest summary of where their time actually went.

---

## Brand Personality

**Honest. Precise. Still.**

Not an enforcer — a mirror. The app doesn't lecture, warn, or guilt. It shows students the truth about their time with clarity and calm. Like a great training partner who keeps score without commentary.

Product promise: *"The time you spent studying with this app was real study time."* Quiet confidence, not a loud claim.

---

## Aesthetic Direction

**Primary reference: Raycast. Secondary: Claude UI.**

Key qualities from Raycast to apply:
- Dark gray surfaces — not flat black, layered warm-dark grays that feel substantial
- Extremely tight, precise spacing — nothing wasted, nothing padded for its own sake
- Content-first — the UI gets out of the way, the data is the star
- Minimal chrome — separators instead of cards, hierarchy through spacing not borders
- Precision typography — clean, legible, confident
- Subtle surface differentiation — you sense depth without heavy shadows

**What this must NOT look like:**
- Academic/school software — no blues, no "student portal" feel
- Dashboard/analytics apps — no chart-heavy layouts, no metric grid templates
- Generic dark mode SaaS — no purple-to-blue gradients, no glowing cyan, no glassmorphism
- Anything that screams "AI made this" — no gradients, no 3-column stat grids, no sparkles

---

## Design Principles (apply to every decision)

1. **The UI is not the product — the data is.** Every screen exists to show the student something true. Don't decorate. Surface the signal.
2. **Silence is a feature.** When focused, the app is invisible. Motion and emphasis reserved for moments that matter: session end, distraction detected, check-in.
3. **Green means real.** Green is earned — actual focus, correct recall, real time. Never decorative. It must always mean something true.
4. **Precision over polish.** A pixel-perfect 1px separator beats a rounded card with a drop shadow. Density and precision read as intelligence.
5. **No judgment, just data.** "77% focus" is a fact. "instagram.com — 3 min" is an observation. Never shame, never over-celebrate.

---

## Color System

```
Background base:    #111111  — not pure black, warm dark (Raycast-style)
Surface elevated:   #1a1a1a  — cards, panels
Surface highest:    #222222  — hover states, inputs, active
Border subtle:      rgba(255,255,255,0.07)
Border visible:     rgba(255,255,255,0.12)

Primary accent:     oklch(0.72 0.18 145)  ≈ #22c55e  — focus, correct, positive ONLY
Warning accent:     #fbbf24  — distraction, off-task, wrong answers
CTA:                #f97316  — action buttons only ("Start session")

Text primary:       #f0f0f0
Text secondary:     rgba(240,240,240,0.60)
Text tertiary:      rgba(240,240,240,0.35)
Text ghost:         rgba(240,240,240,0.20)
```

**OKLCH rules:**
- Use `oklch()` not `hsl()` — perceptually uniform
- High chroma at extreme lightness looks garish — reduce chroma near 0 or 100 lightness
- Tint neutrals toward green hue at chroma 0.005–0.01 for subconscious cohesion
- Never pure `#000` or `#fff` — always tinted

**Hard bans:**
- NO cyan-on-dark, purple gradients, neon glows — AI tells
- NO gray text on colored backgrounds — use a tint of that bg color
- NO gradient text (`background-clip: text`) — ever, no exceptions
- NO colored `border-left/right > 1px` as accent stripe — the most overused AI pattern
- Green is EARNED — never use it decoratively

---

## Typography

**Font:** SF Pro via system stack — intentional for this Mac Electron app. Raycast uses it. It reads as "serious tool" not "website."
```css
font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
-webkit-font-smoothing: antialiased;
```

**Fixed size scale (no fluid clamp — this is a product UI, not a marketing page):**
```
10px  — micro-labels, caps, metadata     tracking: +0.08em–+0.12em, UPPERCASE
12px  — secondary text, timestamps       tracking: normal
13px  — body text, list items            tracking: normal
14px  — primary body, card titles        tracking: -0.01em
16px  — subheadings                      tracking: -0.02em
22px  — screen headings                  tracking: -0.03em
24px  — screen titles                    tracking: -0.03em
26px  — hero headings                    tracking: -0.03em
60–76px — timer number                   tracking: -0.04em, weight: 300
```

**Weight system:**
- 300 — timer hero number only
- 400 — body text
- 500 — labels, nav items
- 600 — card titles, section labels
- 700 — screen headings, stat values

**Rules:**
- 1.25× minimum ratio between type scale steps — fewer sizes, more contrast
- Dark bg: add 0.05 to line-height — light text reads lighter than it is
- ALL CAPS only for 10–11px micro-labels. Never on body text
- Never weight alone for hierarchy — pair weight + size change together
- Use `tabular-nums` for any numbers that need alignment

---

## Spacing & Layout

**4pt scale only:** 4, 8, 12, 16, 24, 32, 48, 64, 96px
Use `gap` for siblings, `padding` for internal space. No arbitrary values.

**Every screen follows this shell:**
```
flex flex-col h-full bg-[#0f0f0f]
  header       shrink-0  px-6 pt-6 pb-4  border-b border-[#1e1e1e]
  content      flex-1    overflow-y-auto  px-4–6 py-4–5
  footer CTA   shrink-0  px-6 py-4        border-t  (only when needed)
```

**Rules:**
- Vary spacing to create hierarchy — generous space above headings signals importance
- Section labels: sparse, not on every card. Used to group, not decorate
- Max content width: 720px centered — no full-width text at large window sizes
- Use Flexbox for 1D layouts (most component internals). Grid for 2D page structure only.

**Hard bans:**
- NO wrapping everything in cards — not everything needs a container
- NO cards nested inside cards — flatten
- NO identical card grids (same size, icon + number + label, repeated 3×) — banned pattern
- NO centering everything — left-aligned asymmetric layouts read more designed
- NO same padding on every element — rhythm requires contrast
- NO hero metric template (big number, small label, 3-column stat grid)

---

## Borders, Radius & Surfaces

**Radius scale:**
```
4px   — tags, micro badges
8px   — inputs, small components
12px  — medium cards
16px  — large cards, containers
20px  — sheets, overlays
full  — pills (status chips, subscription badges)
```

**Surface rules:**
- `#1a1a1a` cards on `#111111` base — elevation through lightness, not shadow
- Borders: `1px solid rgba(255,255,255,0.07–0.12)` — never colored borders as decoration
- No drop shadows on dark surfaces — they don't read; use bg lightness difference
- `backdrop-blur` only on fixed/sticky elements (nav overlays, not scrolling content)

---

## Animation & Motion

**Ask first: should this animate at all?**
```
100+ times/day  (nav taps, keyboard actions)   → NO animation. Ever.
Tens/day        (list items, toggles)           → Remove or drastically reduce
Occasional      (screen transitions, overlays)  → Standard — under 300ms
Rare            (session end, onboarding)       → Can add delight
```
Raycast has zero open/close animation. That is the correct decision.

**Custom easing — never default CSS easings:**
```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);     /* interactions, entrances */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* on-screen movement */
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);      /* current app EASE constant */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-style drawers */
```
Never `ease-in` — starts slow, feels broken at the exact moment user is watching.
Never bounce/elastic — dated.

**Duration targets:**
```
Button press feedback   100–160ms
Small popovers          125–200ms
Screen transitions      180–220ms
Overlays, drawers       200–350ms
```

**Entry animations:**
- Never `scale(0)` — always `scale(0.95)` + `opacity: 0`
- Nothing in the real world appears from nothing
- List stagger: 30–60ms per item, cap total at 200ms: `Math.min(i * 0.04, 0.2)`

**Performance:**
- Animate `transform` and `opacity` ONLY — never width, height, padding, top, left
- Framer Motion `x`/`y` props NOT hardware-accelerated — use `transform: "translateX()"` string
- CSS animations beat JS animations under page-load pressure (run off main thread)
- `will-change: transform` sparingly, only on actively-animating elements

**Mandatory button feedback:**
```tsx
whileHover={{ scale: 1.015 }}
whileTap={{ scale: 0.975 }}
transition={{ duration: 0.1, ease: [0.23, 1, 0.32, 1] }}
```
Every pressable surface needs active state. No exceptions.

**Emil Kowalski principles (baked in):**
- Popovers scale from their trigger, not from center. Exception: modals stay `transform-origin: center`
- Tooltips: delay before first open, but skip delay + animation on subsequent hovers
- CSS transitions beat keyframes for interruptible UI — transitions retarget mid-animation
- Springs for drag interactions, momentum-based gestures, "alive" elements
- `blur(2px)` during crossfades bridges the visual gap between two states
- Asymmetric timing: slow when user is deciding (press 2s), fast when system responds (release 200ms)

**Review checklist for animations:**

| Issue | Fix |
|---|---|
| `transition: all` | Specify exact properties |
| `scale(0)` entry | Start from `scale(0.95)` with `opacity: 0` |
| `ease-in` on any UI | Switch to `ease-out` or custom curve |
| Duration > 300ms on UI | Reduce to 150–250ms |
| Keyboard action animated | Remove animation entirely |
| Framer `x`/`y` under load | Use `transform: "translateX()"` string |
| Elements all appear at once | Add stagger 30–80ms between items |

---

## Interactive States — All 6, Every Element

```
Default   → resting state
Hover     → subtle opacity/color shift — NOT scale (scale only on buttons/CTAs)
Focus     → 2px solid green accent, 2px offset — visible, not glowy
Active    → scale(0.97) buttons; background darken on list rows
Disabled  → opacity: 0.4, cursor: not-allowed
Loading   → named spinner or skeleton — never blank, never generic "..."
```
Missing states = broken experience. Check every interactive surface before shipping.

---

## Screen-Specific Rules

**Timer screen** — must feel invisible
- Clock is the only hero element: 76px, weight 300, tight tracking
- Ripple rings: only when focused, opacity 0.25/0.15 — very subtle
- Status badge: sole feedback mechanism, keep it minimal
- "End session": deliberately de-emphasized ghost button — stopping requires intent

**Summary screen** — reward and reflection, not a dashboard
- Stats 3-up first — immediate, clean, no decoration
- Distraction breakdown: amber bars, factual copy, no judgment
- AI feedback: reads like a study partner, not a teacher
- CTA: pinned footer, full-width orange, one action

**History screen** — data list, legible at a glance
- Subject color is the ONLY color accent per row — everything else neutral gray
- Focus % right-aligned, dominant — it's the number that matters
- Empty state: explain what appears here, not just "nothing yet"

**Profile screen** — identity then utility
- User card first: name, email, subscription badge
- Pro badge teal, Free badge dim white — earned, not decorative
- Upgrade CTA: facts not pressure — list what they get, not why they need it
- Sign out: red, last, no drama

**Bottom nav** — minimal, tactile
- 3 tabs only: Home, History, Profile
- Active: white, strokeWidth 2.1
- Inactive: white/25, strokeWidth 1.6
- `whileTap={{ scale: 0.9 }}` — every tab
- Minimum 44px tap target height

---

## Copy & UX Writing

- Labels: Sentence case. ALL CAPS only for 10px micro-labels with tracking
- Data: state facts, never judgments — "instagram.com — 3 min" not "You wasted 3 min"
- Empty states: describe what will appear here, not that nothing is there
- CTAs: verb + noun ("Start session", "End session") — no "Click here", no "Submit"
- Errors: what happened + what to do — never just "Error" or "Something went wrong"
- Loading: name what's loading — "Loading sessions…" not a nameless spinner
- Periods on full sentences (AI feedback). No periods on labels, buttons, card titles

---

## The AI Slop Test — Run Before Every Commit

If someone saw this and immediately said "AI made it" — it fails. Check each:

- [ ] `border-left: 3px+` colored stripe on any card → replace with bg tint or full border
- [ ] Gradient text (`background-clip: text`) → solid color only
- [ ] Cyan / purple / neon glow accents → replace with green or white/opacity
- [ ] `backdrop-blur` on scrolling content → remove (performance + visual)
- [ ] `ease-in` on any transition → replace with ease-out or custom curve
- [ ] `scale(0)` entry → change to `scale(0.95) opacity:0`
- [ ] Three identical stat cards in a row → rethink the layout
- [ ] Same padding on every element → vary for rhythm
- [ ] Generic empty state copy ("No items found") → rewrite to teach the interface
- [ ] All text same white with no opacity variation → apply 4-step opacity hierarchy

---

---

# SKILL KNOWLEDGE

The following sections contain the full principles from each design skill.
They are always in context — no need to reference external files.

---

## /impeccable — Master Design Skill

Commit to a BOLD, intentional aesthetic direction for every new component:
- **Purpose**: What problem does this solve? Who uses it?
- **Tone**: Be specific — not "modern" or "minimal", but something precise like "calm and clinical" or "fast and dense and unimpressed"
- **Differentiation**: What will someone remember about this screen?

**Font selection procedure:**
Before picking any font, write 3 concrete brand words. Then check your instinct against the reflex fonts to reject:
> Inter, DM Sans, Plus Jakarta Sans, Instrument Sans, Syne, IBM Plex Sans, Space Grotesk, Outfit, Fraunces, Lora, Playfair Display, Cormorant

If your pick is on that list, keep looking. For this app: SF Pro is intentional (Mac app, Raycast reference) — use it.

**Color via OKLCH:**
- Equal steps in OKLCH look equal — HSL steps do not
- Reduce chroma as you approach white or black
- Tint neutrals toward the brand hue at chroma 0.005–0.01

**Absolute bans (never write these):**
- `border-left: 3px+ solid [color]` — ever, for any reason
- `background-clip: text` with gradient — gradient text is always banned

**The AI slop test:** Would someone seeing this immediately say "AI made it"? A distinctive interface makes someone ask "how was this made?" not "which AI made this?"

---

## /animate — Motion Design

**Purpose of animation — valid reasons only:**
- Spatial consistency (toast enters/exits same direction)
- State indication (morphing button shows state change)
- Explanation (how a feature works)
- Feedback (button scales on press)
- Preventing jarring changes

If the only reason is "it looks cool" and users will see it often — don't animate.

**Entrance patterns:**
- Page load: stagger 100–150ms, fade + slide
- Modal entry: slide + fade + backdrop fade
- Content reveals: IntersectionObserver scroll triggers
- Scale from `0.95` + `opacity: 0`, never from `scale(0)`

**State transition patterns:**
- Show/hide: fade + slide, 200–300ms
- Expand/collapse: grid-template-rows transitions (not height directly)
- Loading: skeleton fades, not blank gaps
- Success/error: color transitions + gentle scale pulse

**easing curves — recommended:**
```css
--ease-out-quart:  cubic-bezier(0.25, 1, 0.5, 1);   /* smooth, refined */
--ease-out-quint:  cubic-bezier(0.22, 1, 0.36, 1);  /* snappier */
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);   /* confident, decisive */
```

**Never:**
- Bounce or elastic easing — dated, draws attention to the animation
- Animate layout properties (width, height, padding, top, left)
- Duration > 500ms for feedback — feels laggy
- Animate without purpose
- Ignore `prefers-reduced-motion`

**Performance:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## /colorize — Strategic Color

**The 60-30-10 rule:**
- 60% neutral/surface
- 30% secondary text and borders
- 10% accent — rare means powerful

**Where color adds value (in order of priority):**
1. Semantic meaning — green=focus/correct, amber=distraction, orange=CTA
2. Hierarchy — draw attention to what matters
3. Categorization — subjects have their own color (history screen)
4. Wayfinding — help users understand structure

**Color via OKLCH — critical:**
- Use `oklch()` not `hsl()` for uniform perceptual steps
- Tint surfaces toward brand hue at chroma 0.005–0.01
- At extreme lightness (near 0 or 100), reduce chroma dramatically

**Never:**
- More than 2–4 colors beyond neutrals
- Apply color randomly without semantic meaning
- Gray text on colored backgrounds (use a tint of that bg)
- Pure gray neutrals — add subtle warm/cool tint
- Purple-blue gradients — AI slop aesthetic
- Color as the only indicator (accessibility)

---

## /typeset — Typography

**Assess weaknesses:**
1. Font choices — do they match the brand personality?
2. Hierarchy — can you tell headings from body at a glance?
3. Scale — is there a consistent ratio, or are sizes arbitrary?
4. Readability — line length 45–75ch, line-height appropriate
5. Consistency — same roles, same styles throughout

**Fix hierarchy:**
- 5 sizes cover most needs: micro-label, secondary, body, subheading, heading
- Use 1.25× minimum ratio between levels
- Combine size + weight + spacing for hierarchy — never size alone
- App UIs use fixed `rem` scales. Marketing pages use fluid `clamp()`

**Fix readability:**
- `max-width: 65ch` on text containers
- Headings: line-height 1.1–1.2; body: line-height 1.5–1.7
- Light-on-dark: add 0.05 to normal line-height
- `tabular-nums` for data tables and aligned numbers
- Letter-spacing: open for small caps/uppercase, tight or default for large display

**Never:**
- More than 2–3 font families
- Body text below 16px (mobile) or 13px (dense app UI)
- Decorative/display fonts for body text
- Disable zoom (`user-scalable=no`)
- Two similar sans-serifs paired together

---

## /polish — Final Quality Pass

**Pre-condition:** Only polish functionally complete work. Polish last, not first.

**Polish checklist:**

**Visual:**
- [ ] Pixel-perfect alignment at all sizes
- [ ] All spacing from 4pt scale, no random values
- [ ] Typography hierarchy consistent throughout
- [ ] All interactive states implemented (all 6)
- [ ] All transitions smooth — 60fps, transform+opacity only
- [ ] Tinted neutrals — no pure gray or pure black

**Content:**
- [ ] Copy is consistent, sentence case
- [ ] No typos or grammar issues
- [ ] Periods on sentences, not on labels/buttons
- [ ] Error messages explain what + what to do
- [ ] Empty states teach the interface

**Code:**
- [ ] No console.logs
- [ ] No commented-out code
- [ ] No TypeScript `any`
- [ ] No hard-coded values that should be tokens
- [ ] No one-off implementations of shared components

**States:**
- [ ] Loading states named ("Loading sessions…")
- [ ] Empty states welcoming and instructive
- [ ] Error states have recovery paths
- [ ] Long content handled gracefully

**Never:**
- Polish before functionally complete
- Perfect one thing while leaving others rough
- Introduce bugs while polishing (test thoroughly)
- Create new one-off components when system equivalents exist

---

## /layout — Spatial Design

**Squint test:** Blur your vision — can you still identify most important, second most important, and clear groupings?

**Spacing creates hierarchy:**
- Tight grouping (8–12px) for related elements
- Generous separation (48–96px) between distinct sections
- Space above headings signals importance — use it intentionally
- Varied spacing within sections — not every row same gap

**Layout tool selection:**
- Flexbox for 1D (nav bars, button groups, card internals) — simpler, use by default
- Grid for 2D (page structure, dashboards) — only when rows AND columns need coordination
- `repeat(auto-fit, minmax(280px, 1fr))` for responsive grids without breakpoints
- Container queries for component-level responsiveness

**Depth and elevation:**
- Semantic z-index scale: dropdown → sticky → modal-backdrop → modal → toast → tooltip
- Shadow scale: sm → md → lg — subtle always
- On dark surfaces: use background lightness difference, not shadows

**Never:**
- Arbitrary spacing values outside 4pt scale
- All spacing equal — variety creates hierarchy
- Everything in cards — not everything needs a container
- Nested cards — use spacing and dividers for sub-hierarchy
- Identical card grids (icon + heading + text, repeated)
- Everything centered — left-aligned with asymmetry reads more designed
- Hero metric template (big number, small label, stats, gradient)

---

## /shape — Feature Planning (Before Writing Code)

Use when planning a new feature. Answer before building:

1. **Primary user action** — what's the ONE thing they need to do here?
2. **User's state of mind** — rushed? exploring? focused? this determines density/animation
3. **Content ranges** — minimum (0 items), typical (5), maximum (500+)
4. **Key states** — default, empty, loading, error, success, edge cases
5. **Interaction model** — what happens on click/hover/scroll? what feedback do they get?
6. **Anti-goals** — what would be a wrong direction?

Output a design brief before touching code. This prevents "here's a card grid" defaults.

---

## /delight — Moments of Joy

**Delight frequency rule:**
- Session end, first-time moments, achievements → can celebrate
- Routine interactions (nav, toggles) → no delight, ever
- Loading states → personality in copy, not in animation

**Delight amplifies, never blocks:**
- Delight moments should be < 1 second
- Never delay core functionality
- Respect user's time and task focus

**For this app specifically:**
- Session end: can celebrate (confetti, checkmark flourish, gentle scale)
- AI check-in correct answer: subtle positive feedback (green flash, brief scale)
- Loading states: specific copy ("Analyzing your session…" not generic filler)
- Streak milestones: acknowledge them briefly, factually ("7-day streak")

**Loading copy — write product-specific, never generic:**
```
✓ "Analyzing your session…"
✓ "Loading your focus history…"
✗ "Herding pixels" — AI slop
✗ "Teaching robots to dance" — AI slop
```

**Never:**
- Delay core functionality for delight
- Same animation every time (vary responses)
- Inappropriate for context (celebrate a distraction session? never)
- Sacrifice performance
- Ignore `prefers-reduced-motion`

---

## /distill — Simplification

**Find the essence first:**
- What's the primary user goal? (There should be ONE)
- What's actually necessary vs nice-to-have?
- What's the 20% that delivers 80% of the value?

**Simplification dimensions:**
- **Information architecture:** ONE primary action, few secondary, everything else hidden
- **Visual:** 1–2 colors + neutrals, one font family, remove decoration that doesn't serve function
- **Layout:** Reduce nesting, remove unnecessary containers, flatten structure
- **Content:** Cut every sentence in half. Active voice. Remove hedging and jargon.
- **Interaction:** Fewer buttons, smarter defaults, clear single path forward

**Never:**
- Remove necessary functionality (simple ≠ feature-less)
- Sacrifice accessibility for simplicity
- Make things so minimal they're unclear
- Remove information users need to make decisions

---

## /bolder — Visual Confidence

**"Bolder" means distinctive, not louder. Bold ≠ more AI effects.**

**Warning — AI slop trap:** The reflex is cyan/purple gradients, glassmorphism, neon accents. Those are the opposite of bold — they're generic. Bold means distinctive.

**Amplification tactics:**
- Typography: extreme size jumps (3×–5×, not 1.5×), pair weight 900 with weight 200
- Color: dominant color owns 60%, sharp accent, tinted neutrals
- Spatial: elements 3–5× larger than surroundings for importance, asymmetric layout
- Texture: grain, halftone, intentional pattern — NOT glassmorphism
- Motion: staggered dramatic entrance, scroll effects, satisfying micro-interactions

**Hierarchy amplification:** Make big things BIGGER, small things SMALLER. Increase contrast.

**Never:**
- Add effects randomly without purpose
- Sacrifice readability (body text must be comfortable)
- Make everything bold (then nothing is bold)
- Bounce or elastic easing — cheapens the effect

---

## /quieter — Refinement

**"Quieter" means refined, not generic. Subtlety requires precision.**

**Reduction tactics:**
- Color: desaturate to 70–85%, reduce color variety, neutrals do more work
- Weight: reduce font weights (900→600, 700→500), increase white space
- Motion: shorter distances (10–20px not 40px), remove decorative animations
- Structure: reduce border radius extremes, remove unnecessary blur/glow/shadows

**Never:**
- Make everything same size/weight (hierarchy still matters)
- Remove all color (quiet ≠ grayscale)
- Eliminate personality — maintain character through restraint
- Make everything small and light (some anchors needed)

---

## /critique — Design Review

**Nielsen's 10 heuristics (score 0–4 each, 40 total):**
1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose, and recover from errors
10. Help and documentation

**Anti-patterns to check (the slop test, extended):**
- AI color palette (cyan, purple, neon)
- Gradient text
- Glassmorphism on scrolling content
- Hero metric layouts
- Identical card grids
- Generic empty states ("No items found")
- All text same white, no opacity variation
- Same padding everywhere

**Cognitive load check:**
- Count visible options at each decision point — if >4, flag it
- Check for progressive disclosure: is complexity revealed only when needed?
- Emotional valleys at high-stakes moments: is there reassurance copy, undo, progress indicators?

**Peak-end rule:** Is the most intense moment positive? Does the experience end well?

---

## /overdrive — Technical Ambition

Use when the user wants something technically extraordinary. **Propose before building** — present 2–3 directions, get confirmation, then build.

**What "extraordinary" means per context:**
- Visual/marketing: scroll-driven reveals, shader backgrounds, cinematic transitions
- Functional UI: View Transitions API morphing, virtual scrolling 100k rows at 60fps, streaming validation
- Performance-critical: search that filters 50k items without flicker, never blocks main thread
- Data-heavy: GPU-accelerated charts, animated data transitions

**The toolkit:**
- **View Transitions API** — shared element morphing between states (list item → detail page)
- **Scroll-driven animations** — `animation-timeline: scroll()` CSS-only parallax/reveals
- **Spring physics** — motion (Framer) with `stiffness: 100, damping: 20`
- **WebGL** — shader effects, particle systems (Three.js, OGL)
- **Virtual scrolling** — render only visible rows for large lists (TanStack Virtual)
- **Web Workers** — computation off main thread (search indexing, heavy data processing)
- **`@property`** — animate gradients and complex CSS values
- **WAAPI** — JavaScript control with CSS performance

**Progressive enhancement is non-negotiable.** The experience without the enhancement must still be good.

**Never:**
- Ignore `prefers-reduced-motion`
- Ship effects that jank on mid-range devices
- Use bleeding-edge APIs without functional fallback
- Layer multiple competing extraordinary moments
- Use technical ambition to mask weak design fundamentals

---

## /stitch-design-taste — Design System Generation

**Atmosphere dimensions (rate 1–10):**
- Density: "Art Gallery Airy" (1) → "Cockpit Dense" (10) — for this app: ~7
- Variance: "Predictable Symmetric" (1) → "Artsy Chaotic" (10) — for this app: ~4
- Motion: "Static Restrained" (1) → "Cinematic Choreography" (10) — for this app: ~3

**Component stylings:**
- Buttons: tactile push feedback on active, no neon outer glows
- Cards: only when elevation communicates hierarchy; high-density uses border-top dividers
- Inputs: label above, error below, focus ring in accent color
- Loaders: skeletal matching layout dimensions — no generic circular spinners
- Empty states: composed, instructive — not just "No data"

**Anti-patterns (banned):**
- No emojis
- No pure black (#000000)
- No neon/outer glow shadows
- No oversaturated accents
- No 3-column equal card layouts
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen")
- No centered hero sections for high-variance projects
- No generic placeholder names ("John Doe", "Acme")

---

## /high-end-visual-design — Agency-Level Craft

**"Double-Bezel" technique for premium feel:**
- Outer shell: subtle background, hairline border, specific padding, large radius
- Inner core: distinct background, inner highlight shadow, mathematically-smaller radius
- Result: feels like physical machined hardware, not flat digital

**Spatial rhythm:**
- Macro-whitespace: double your standard padding — sections breathe heavily
- Eyebrow tags: microscopic pill badges before major headings (10px, uppercase, tracked)

**Motion choreography:**
- All motion simulates real-world mass: `cubic-bezier(0.32, 0.72, 0, 1)`
- Staggered mask reveals on navigation links: `translate-y-12 opacity-0 → translate-y-0 opacity-100` with delays
- Scroll entry: gentle heavy fade-up (`translate-y-16 blur-md opacity-0 → translate-y-0 blur-0 opacity-100`) over 800ms+
- Never `window.addEventListener('scroll')` — use IntersectionObserver

**GPU safety:**
- Only animate `transform` and `opacity`
- `backdrop-blur` only on fixed/sticky elements (navbars, overlays)
- Grain/noise overlays on fixed `pointer-events-none` pseudo-elements only
- Z-index: semantic layers only (sticky, modal, overlay, tooltip)

---

## /adapt — Responsive Design

**This app is Mac Electron (660–1440px range):**
- `min-width: 460px` enforced
- `max-w-[720px]` centered column for all content
- Bottom nav always inside the centered column

**Touch target rule:** 44×44px minimum on every interactive element.

**Content adaptation (not just scaling):**
- At small sizes: increase tap target sizes, reduce information density
- At large sizes: cap at 720px, don't let text span full window

**Container queries for components:**
- Components adapt to their container's width, not the viewport
- Good for session cards, history rows, profile sections

**Never:**
- Hide core functionality based on screen size
- Use different information architecture at different sizes
- Horizontal overflow (critical failure)
- `h-screen` for full-height sections — use `min-h-[100dvh]`

---

## /redesign-existing-projects — Full Screen Redesign

Use for complete redesigns of existing screens. Before starting:

1. Read the screen's current code
2. Run the AI slop test — what specifically fails?
3. Apply `/critique` to understand structural problems
4. Define the new aesthetic direction (not just "fix the problems")
5. Build fresh, applying all principles from this file

The redesign should feel like a different, better version of the same idea — not a reskin.

---

## /audit — Full Design Audit

Systematic evaluation of the entire product:

1. **Consistency audit:** Are the same elements styled identically throughout?
2. **Token audit:** Are colors/spacing/radius from the defined system, or are there arbitrary values?
3. **Interaction audit:** Does every interactive element have all 6 states?
4. **Copy audit:** Is terminology consistent? Sentence case throughout?
5. **Performance audit:** Any `backdrop-blur` on scroll? Any animated layout properties?
6. **Accessibility audit:** Contrast ratios, keyboard navigation, ARIA labels

---

## /full-output-enforcement — Complete File Rewrites

When a full file rewrite is needed:
- Output the entire file, not just changed sections
- Never truncate with "// ... rest of file"
- Never use "// existing code here" placeholders
- The entire file must be present in the output

---

## /design-taste-frontend — General Taste Pass

A taste-improvement pass that doesn't redesign — it elevates:

1. Replace arbitrary values with system values (spacing, colors, radius)
2. Establish the 4-step text opacity hierarchy
3. Add micro-interaction to every pressable element
4. Remove duplicate or redundant information
5. Apply the AI slop test — fix any failures
6. Verify all 6 interactive states on every element

---

## /minimalist-ui — Extreme Reduction

When everything must earn its place:

- One typeface, maximum 3 weights
- One accent color, used sparingly
- No decorative elements — borders, shadows, icons only if functional
- Generous whitespace does the work of all the decoration
- The question for every element: "What breaks if I remove this?"
- If nothing breaks, remove it

---

## /industrial-brutalist-ui — Raw Utilitarian

Deliberately unpolished, raw, functional aesthetic:

- System fonts, monospace for data
- Stark black/white with single high-contrast accent
- Hard edges, no rounded corners (or minimal)
- Dense, information-maximizing layouts
- Motion: zero or purely functional
- This aesthetic communicates "tool, not toy" — appropriate for power users

---

## Quick Reference — Which Skill for Which Task

| Task | Apply these principles |
|---|---|
| New screen from scratch | /impeccable + project color/type/spacing sections |
| Animations feel wrong | /animate + /emil-design-eng |
| Colors feel off | /colorize |
| Typography generic | /typeset |
| Layout cluttered | /distill or /quieter |
| Too timid, needs confidence | /bolder |
| Final quality pass | /polish |
| Spacing/structure decisions | /layout |
| Planning a new feature | /shape |
| Adding moments of craft | /delight |
| Output feels generic | /stitch-design-taste |
| Premium craft moment | /high-end-visual-design |
| Technical ambition | /overdrive |
| Review existing UI | /critique |
| Full redesign | /redesign-existing-projects |
| Full audit | /audit |
