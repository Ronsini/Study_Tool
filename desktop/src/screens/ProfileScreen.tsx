import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'

// /distill: sign-out was wrapped in a card with overflow-hidden — flattened to a plain row
// /colorize: Pro badge = green (earned), Free = dim white, University = green
// /layout: daily goal is a flat row, not a card. No nested cards.

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const PLAN_STYLE: Record<string, { label: string; textColor: string; border: string; bg: string }> = {
  free:       { label: 'Free',       textColor: 'text-white/40',    border: 'border-white/12',       bg: 'bg-white/4' },
  // /colorize: Pro badge green — earned, not teal
  pro:        { label: 'Pro',        textColor: 'text-[#22c55e]',   border: 'border-[#22c55e]/30',   bg: 'bg-[#22c55e]/8' },
  university: { label: 'University', textColor: 'text-[#22c55e]',   border: 'border-[#22c55e]/30',   bg: 'bg-[#22c55e]/8' },
}

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  if (!user) return null

  const plan = PLAN_STYLE[user.subscription] ?? PLAN_STYLE.free
  const initials = user.name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">

      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE }}
        className="shrink-0 px-6 pt-6 pb-4 border-b border-[#1a1a1a]"
      >
        <h1 className="text-[24px] font-bold text-[#f0f0f0] tracking-[-0.03em]">Profile</h1>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">

        {/* Identity card — this one earns a card: it's distinct, identity content */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.05, ease: EASE }}
          className="bg-[#161616] border border-[#252525] rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-full bg-[#232323] flex items-center justify-center shrink-0">
            <span className="text-[15px] font-semibold text-white/55">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-[#f0f0f0] leading-tight truncate">{user.name}</p>
            <p className="text-[12px] text-white/35 mt-0.5 truncate">{user.email}</p>
          </div>
          <div className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0 ${plan.bg} ${plan.border} ${plan.textColor}`}>
            {plan.label}
          </div>
        </motion.div>

        {/* Goals — flat rows, not wrapped in an extra card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.09, ease: EASE }}
          className="bg-[#161616] border border-[#252525] rounded-2xl px-4 py-3.5"
        >
          <p className="text-[10px] text-white/25 uppercase tracking-[0.1em] mb-3 font-semibold">Goals</p>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-white/55">Daily study goal</span>
            <span className="text-[13px] text-[#f0f0f0] font-semibold tabular-nums">{user.daily_goal_min} min</span>
          </div>
        </motion.div>

        {/* Upgrade CTA — free users only */}
        {user.subscription === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.13, ease: EASE }}
            className="bg-[#161616] border border-[#f97316]/20 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-[14px] font-semibold text-[#f0f0f0]">Upgrade to Pro</p>
                {/* /copy: facts not pressure */}
                <p className="text-[12px] text-white/40 mt-0.5">
                  Unlock the full picture of your focus.
                </p>
              </div>
              <div className="shrink-0 px-2.5 py-1 bg-[#f97316]/12 border border-[#f97316]/25 rounded-full">
                <span className="text-[10px] font-semibold text-[#f97316] uppercase tracking-[0.08em]">Pro</span>
              </div>
            </div>

            {/* /copy: list what they get, not why they need it */}
            <div className="flex flex-col gap-1.5 mb-4">
              {[
                'Distraction breakdown by app and site',
                'Full session analytics',
                'Unlimited session history',
              ].map(feature => (
                <div key={feature} className="flex items-center gap-2.5">
                  {/* /colorize: green checkmark = earned feature */}
                  <span className="text-[#22c55e] text-[12px] leading-none font-bold">✓</span>
                  <span className="text-[12px] text-white/55">{feature}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.975 }}
              transition={{ duration: 0.1, ease: EASE }}
              className="w-full bg-[#f97316] hover:bg-[#fb923c] active:bg-[#ea6d0e] text-white text-[14px] font-semibold py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
            >
              Upgrade to Pro
            </motion.button>
          </motion.div>
        )}

        {/* Sign out — /distill: plain row, no card wrapper. Red = destructive, last, no drama. */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: user.subscription === 'free' ? 0.17 : 0.13, ease: EASE }}
        >
          <button
            onClick={logout}
            className="w-full px-1 py-2.5 text-left text-[14px] text-red-400/60 hover:text-red-400 transition-colors duration-150 cursor-pointer"
          >
            Sign out
          </button>
        </motion.div>

      </div>
    </div>
  )
}
