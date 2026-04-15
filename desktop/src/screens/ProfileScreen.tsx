import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const PLAN_STYLE: Record<string, { label: string; textColor: string; border: string; bg: string }> = {
  free:       { label: 'Free',       textColor: 'text-white/50',    border: 'border-white/15',       bg: 'bg-white/5' },
  pro:        { label: 'Pro',        textColor: 'text-teal-400',    border: 'border-teal-500/35',    bg: 'bg-teal-500/8' },
  university: { label: 'University', textColor: 'text-purple-400',  border: 'border-purple-500/35', bg: 'bg-purple-500/8' },
}

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  if (!user) return null

  const plan = PLAN_STYLE[user.subscription] ?? PLAN_STYLE.free
  const initials = user.name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">

      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: EASE }}
        className="shrink-0 px-6 pt-6 pb-4 border-b border-[#1e1e1e]"
      >
        <h1 className="text-[24px] font-bold text-white tracking-[-0.03em]">Profile</h1>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">

        {/* Identity card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.05, ease: EASE }}
          className="bg-[#161616] border border-[#272727] rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-full bg-[#252525] flex items-center justify-center shrink-0">
            <span className="text-[15px] font-semibold text-white/60">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-white leading-tight truncate">{user.name}</p>
            <p className="text-[12px] text-white/35 mt-0.5 truncate">{user.email}</p>
          </div>
          <div className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0 ${plan.bg} ${plan.border} ${plan.textColor}`}>
            {plan.label}
          </div>
        </motion.div>

        {/* Daily goal */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.09, ease: EASE }}
          className="bg-[#161616] border border-[#272727] rounded-2xl px-4 py-3.5"
        >
          <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] mb-2.5 font-semibold">Goals</p>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-white/55">Daily study goal</span>
            <span className="text-[13px] text-white font-semibold tabular-nums">{user.daily_goal_min} min</span>
          </div>
        </motion.div>

        {/* Upgrade CTA — free users only */}
        {user.subscription === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: 0.13, ease: EASE }}
            className="bg-[#161616] border border-orange-500/25 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-[14px] font-semibold text-white">Upgrade to Pro</p>
                <p className="text-[12px] text-white/40 mt-0.5 leading-relaxed">
                  Unlock the full picture of your focus.
                </p>
              </div>
              <div className="shrink-0 px-2.5 py-1 bg-orange-500/15 border border-orange-500/30 rounded-full">
                <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-[0.08em]">Pro</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mb-4">
              {[
                'Distraction breakdown by app',
                'Full session analytics',
                'Unlimited session history',
              ].map(feature => (
                <div key={feature} className="flex items-center gap-2">
                  <span className="text-teal-500 text-[11px] leading-none">✓</span>
                  <span className="text-[12px] text-white/55">{feature}</span>
                </div>
              ))}
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white text-[14px] font-semibold py-2.5 rounded-xl transition-colors duration-150 cursor-pointer">
              Upgrade to Pro
            </button>
          </motion.div>
        )}

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: user.subscription === 'free' ? 0.17 : 0.13, ease: EASE }}
          className="bg-[#161616] border border-[#272727] rounded-2xl overflow-hidden"
        >
          <button
            onClick={logout}
            className="w-full px-4 py-3.5 text-left text-[14px] text-red-400/75 hover:text-red-400 hover:bg-red-500/5 transition-colors duration-150 cursor-pointer"
          >
            Sign out
          </button>
        </motion.div>

      </div>
    </div>
  )
}
