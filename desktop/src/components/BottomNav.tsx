import { motion } from 'motion/react'

export type NavTab = 'home' | 'history' | 'profile'

interface Props {
  active: NavTab
  onChange: (tab: NavTab) => void
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

const TABS: { id: NavTab; label: string; Icon: (props: { active: boolean }) => JSX.Element }[] = [
  { id: 'home',    label: 'Home',    Icon: HomeIcon },
  { id: 'history', label: 'History', Icon: HistoryIcon },
  { id: 'profile', label: 'Profile', Icon: ProfileIcon },
]

export default function BottomNav({ active, onChange }: Props) {
  return (
    <div className="shrink-0 flex border-t border-[#1a1a1a] bg-[#0a0a0a]">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === active
        return (
          <motion.button
            key={id}
            onClick={() => onChange(id)}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1, ease: EASE }}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-[5px] cursor-pointer transition-colors duration-150 ${
              isActive ? 'text-white' : 'text-white/25 hover:text-white/50'
            }`}
          >
            <Icon active={isActive} />
            <span className={`text-[10px] tracking-[0.06em] font-medium leading-none ${
              isActive ? 'opacity-100' : 'opacity-70'
            }`}>
              {label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
