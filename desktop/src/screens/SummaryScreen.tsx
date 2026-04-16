import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'

// /layout — BANNED PATTERN REMOVED:
//   Was: grid grid-cols-3 with 3 identical StatCard components (icon + number + label repeated)
//   Now: asymmetric layout — focus score as hero number, total/real min stacked on right
//
// /colorize: teal → green (#22c55e) everywhere. Green = real focus.
// /typeset: score is 52px bold — dominant. Supporting stats are 22px. Clear hierarchy.
// /distill: StatCard component deleted (was only used for this banned pattern)

interface DistractionEvent {
  type: string
  label: string
  source: string | null
  windows: number
  minutes: number
}

interface SessionSummary {
  total_minutes: number | null
  real_focus_min: number | null
  focus_score: number | null
  ai_feedback: string | null
  distraction_breakdown: DistractionEvent[]
}

interface Props {
  summary: SessionSummary
  topic: string
  onStartNew: () => void
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function SummaryScreen({ summary, topic, onStartNew }: Props) {
  const { user } = useAuth()
  const isPro = user?.subscription === 'pro' || user?.subscription === 'university'

  const totalMin = summary.total_minutes ?? 0
  const realFocusMin = summary.real_focus_min ?? 0
  const focusPercent = Math.round((summary.focus_score ?? 0) * 100)
  const realPercent = totalMin > 0 ? Math.min(100, Math.round((realFocusMin / totalMin) * 100)) : 0
  const breakdown = summary.distraction_breakdown ?? []

  const totalMinDisplay = totalMin === 0 && summary.focus_score !== null ? '<1' : totalMin
  const realFocusMinDisplay = realFocusMin === 0 && totalMin === 0 && summary.focus_score !== null ? '<1' : realFocusMin

  // /colorize: green = 70%+, amber = 40-69%, red = below 40
  const scoreColor = focusPercent >= 70 ? '#22c55e'
    : focusPercent >= 40 ? '#fbbf24'
    : '#f87171'

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE }}
        className="shrink-0 px-6 pt-6 pb-4 border-b border-[#1a1a1a]"
      >
        <p className="text-[10px] text-white/25 uppercase tracking-[0.12em] mb-1">{topic}</p>
        <h1 className="text-[26px] font-bold text-[#f0f0f0] tracking-[-0.03em]">Session complete</h1>
      </motion.header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

        {/* Stats — /layout: asymmetric. Focus score dominates left. Total + real min stacked right. */}
        {/* This is the core fix: was a 3-column identical card grid, now a clear hierarchy. */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.05, ease: EASE }}
          className="flex items-center gap-5"
        >
          {/* Hero: focus score */}
          <div className="flex-1">
            {/* /typeset: 52px, bold, colored — dominant number, paired weight+size */}
            <div className="text-[52px] font-bold leading-none tracking-[-0.04em] tabular-nums" style={{ color: scoreColor }}>
              {focusPercent}%
            </div>
            <p className="text-[11px] text-white/30 uppercase tracking-[0.09em] mt-2">Focus score</p>
          </div>

          {/* Divider */}
          <div className="w-px bg-[#222] self-stretch" />

          {/* Secondary stats: stacked — total then real focus */}
          <div className="flex flex-col gap-4">
            <div className="text-right">
              {/* /typeset: 22px, weight 700 — strong but subordinate to hero */}
              <div className="text-[22px] font-bold text-[#f0f0f0] leading-none tracking-[-0.03em] tabular-nums">
                {totalMinDisplay}
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-[0.08em] mt-1">Total min</div>
            </div>
            <div className="text-right">
              {/* /colorize: green = real focus time — earned, not decorative */}
              <div className="text-[22px] font-bold leading-none tracking-[-0.03em] tabular-nums" style={{ color: '#22c55e' }}>
                {realFocusMinDisplay}
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-[0.08em] mt-1">Focus min</div>
            </div>
          </div>
        </motion.div>

        {/* Focus time bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.24, delay: 0.14, ease: EASE }}
          className="flex flex-col gap-2"
        >
          <div className="flex justify-between text-[11px] text-white/30 uppercase tracking-[0.07em]">
            <span>Real focus time</span>
            <span className="tabular-nums">{realPercent}%</span>
          </div>
          <div className="h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${realPercent}%` }}
              transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
              className="h-full rounded-full"
              style={{ backgroundColor: '#22c55e' }}
            />
          </div>
        </motion.div>

        {/* Distraction breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.18, ease: EASE }}
        >
          <p className="text-[10px] text-white/25 uppercase tracking-[0.1em] mb-3 font-semibold">
            Distraction breakdown
          </p>

          <div className="relative rounded-2xl overflow-hidden">
            {(() => {
              const PLACEHOLDER = [
                { type: 'social_media', label: 'Social media', source: 'instagram.com', windows: 4, minutes: 2 },
                { type: 'video_site',   label: 'Video site',   source: 'youtube.com',   windows: 6, minutes: 3 },
                { type: 'idle',         label: 'Idle',         source: null,             windows: 2, minutes: 1 },
              ]
              const rows = isPro ? breakdown : (breakdown.length > 0 ? breakdown : PLACEHOLDER)
              const rowsTotal = rows.reduce((s, e) => s + e.minutes, 0)

              return (
                <div className={`bg-[#161616] border border-[#252525] rounded-2xl p-4 flex flex-col gap-3.5 ${
                  !isPro ? 'blur-[7px] opacity-30 saturate-0 select-none pointer-events-none' : ''
                }`}>
                  {rows.length === 0 ? (
                    <p className="text-[13px] text-white/50 text-center py-1">No distractions detected</p>
                  ) : rows.map((event, i) => {
                    const barPct = rowsTotal > 0 ? Math.round((event.minutes / rowsTotal) * 100) : 100
                    return (
                      <div key={i} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <span className="text-[13px] text-white/80 font-medium">
                              {event.source ?? event.label}
                            </span>
                            {event.source && (
                              <span className="text-[11px] text-white/30 ml-1.5">{event.label}</span>
                            )}
                          </div>
                          <span className="text-[12px] text-white/35 tabular-nums shrink-0 ml-3">
                            {event.minutes}m
                          </span>
                        </div>
                        <div className="h-px bg-[#252525] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barPct}%` }}
                            transition={{ duration: 0.65, delay: 0.5 + i * 0.08, ease: EASE }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: '#fbbf24', opacity: 0.7 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* Paywall overlay — free users */}
            {!isPro && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#0a0a0a]/88">
                <div className="w-10 h-10 rounded-2xl bg-[#1e1e1e] border border-[#333] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-[#f0f0f0]">Pro feature</p>
                  <p className="text-[12px] text-white/40 mt-1 px-8 leading-relaxed">
                    See exactly what distracted you and for how long
                  </p>
                </div>
                <div className="px-4 py-1.5 bg-[#f97316]/15 border border-[#f97316]/35 rounded-full">
                  <span className="text-[11px] font-semibold text-[#f97316] uppercase tracking-[0.08em]">
                    Upgrade to unlock
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI feedback */}
        {summary.ai_feedback && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.22, ease: EASE }}
            className="bg-[#161616] border border-[#252525] rounded-2xl p-4"
          >
            {/* /colorize: green label — AI summary is about real focus, earned */}
            <p className="text-[10px] text-[#22c55e]/60 uppercase tracking-[0.1em] mb-2.5 font-semibold">
              Session summary
            </p>
            <p className="text-[13px] text-white/65 leading-relaxed">{summary.ai_feedback}</p>
          </motion.div>
        )}

      </div>

      {/* Pinned CTA */}
      <motion.footer
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.28, ease: EASE }}
        className="shrink-0 px-6 py-4 border-t border-[#1a1a1a] bg-[#0f0f0f]"
      >
        <motion.button
          onClick={onStartNew}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.975 }}
          transition={{ duration: 0.1, ease: EASE }}
          className="w-full bg-[#f97316] hover:bg-[#fb923c] active:bg-[#ea6d0e] text-white text-[15px] font-semibold py-3 rounded-xl transition-colors duration-150 cursor-pointer"
        >
          Start new session
        </motion.button>
      </motion.footer>

    </div>
  )
}
