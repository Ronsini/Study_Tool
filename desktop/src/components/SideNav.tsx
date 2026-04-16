import { motion } from 'motion/react'

// /layout: desktop sidebar replaces mobile bottom tab bar
// /colorize: active item = white icon, bg-white/[0.08] pill — no teal, no green on nav chrome
// /animate: whileTap 0.9 on nav buttons — small, deliberate
// /shape: 58px narrow sidebar, icon-only, tooltip via title attr

export type NavTab = 'home' | 'history' | 'profile'

interface Props {
  active: NavTab
  onChange: (tab: NavTab) => void
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function SessionIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polygon points="10 8 16 12 10 16 10 8" fill={active ? 'currentColor' : 'none'} strokeWidth={active ? 0 : 1.7} />
    </svg>
  )
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

const TABS: { id: NavTab; label: string; Icon: (p: { active: boolean }) => React.ReactElement }[] = [
  { id: 'home',    label: 'New session', Icon: SessionIcon },
  { id: 'history', label: 'History',     Icon: HistoryIcon },
  { id: 'profile', label: 'Profile',     Icon: ProfileIcon },
]

export default function SideNav({ active, onChange }: Props) {
  return (
    <div className="w-[58px] shrink-0 flex flex-col items-center bg-[#0a0a0a] border-r border-[#161616] pt-5 pb-4">

      {/* Logo mark — focus ring motif */}
      <div className="mb-6 w-8 h-8 rounded-xl bg-[#22c55e]/[0.1] border border-[#22c55e]/[0.18] flex items-center justify-center shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
      </div>

      {/* Nav items */}
      <div className="flex flex-col items-center gap-1.5">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = id === active
          return (
            <motion.button
              key={id}
              onClick={() => onChange(id)}
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.1, ease: EASE }}
              title={label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-white/[0.08] text-[#f0f0f0]'
                  : 'text-white/[0.28] hover:text-white/55 hover:bg-white/[0.04]'
              }`}
            >
              <Icon active={isActive} />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
