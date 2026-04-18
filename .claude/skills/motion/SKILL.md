# Motion (Framer Motion) — Animation Skill

## What It Is
Motion v12 is installed as an npm package in `desktop/`. It is the industry-standard animation library for React. Use it for all animations in the desktop app.

## Package
```
"motion": "^12.38.0"   ← in desktop/package.json
```

## Core Imports
```tsx
import { motion, AnimatePresence } from 'motion/react'
```

## Key Patterns for This Project

### Fade in on mount
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
```

### Page/screen transitions
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={screen}
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -16 }}
    transition={{ duration: 0.18 }}
  />
</AnimatePresence>
```

### Overlay (check-in popup)
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.96 }}
  transition={{ duration: 0.15 }}
/>
```

### Hover/tap on buttons
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.1 }}
/>
```

### Focus score number counter
```tsx
import { useSpring, useTransform, motion } from 'motion/react'
// Animate a number from 0 to focusScore
```

## Rules for This Project
- All screen transitions use AnimatePresence with `mode="wait"`
- Duration: 150-200ms for UI elements, 300ms max for page transitions
- Never animate layout shifts that could disorient the user mid-session
- Respect `prefers-reduced-motion` — wrap animations in a check
- The check-in overlay always animates in (scale + fade), never appears instantly
