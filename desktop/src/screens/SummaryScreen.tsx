import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'

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

// Icon per distraction type
const DISTRACTION_ICONS: Record<string, string> = {
  social_media:    '📱',
  video_site:      '▶️',
  rapid_switching: '↔️',
  idle:            '💤',
  face_absent:     '👤',
  phone_detected:  '📵',
}

function StatCard({ value, label, color = 'text-white', delay = 0 }: {
  value: string | number; label: string; color?: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay, ease: EASE }}
      className="bg-[#161616] border border-[#272727] rounded-2xl p-4 text-center"
    >
      <div className={`text-[28px] font-bold tracking-[-0.03em] leading-none ${color}`}>{value}</div>
      <div className="text-[11px] text-white/35 mt-2 uppercase tracking-[0.08em]">{label}</div>
    </motion.div>
  )
}

export default function SummaryScreen({ summary, topic, onStartNew }: Props) {
  const { user } = useAuth()
  const isPro = user?.subscription === 'pro' || user?.subscription === 'university'

  const totalMin = summary.total_minutes ?? 0
  const realFocusMin = summary.real_focus_min ?? 0
  const focusPercent = Math.round((summary.focus_score ?? 0) * 100)
  const realPercent = totalMin > 0 ? Math.min(100, Math.round((realFocusMin / totalMin) * 100)) : 0
  const breakdown = summary.distraction_breakdown ?? []

  // Show "< 1" for sub-minute sessions rather than a bare "0"
  const totalMinDisplay = totalMin === 0 && summary.focus_score !== null ? '< 1' : totalMin
  const realFocusMinDisplay = realFocusMin === 0 && totalMin === 0 && summary.focus_score !== null ? '< 1' : realFocusMin

  const scoreColor = focusPercent >= 70 ? 'text-teal-400'
    : focusPercent >= 40 ? 'text-amber-400'
    : 'text-red-400'

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: EASE }}
        className="shrink-0 px-6 pt-6 pb-4 border-b border-[#1e1e1e]"
      >
        <p className="text-[10px] text-white/30 uppercase tracking-[0.12em] mb-1">{topic}</p>
        <h1 className="text-[26px] font-bold text-white tracking-[-0.03em]">Session complete</h1>
      </motion.header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard value={totalMinDisplay} label="Total min" delay={0.05} />
          <StatCard value={realFocusMinDisplay} label="Focus min" color="text-teal-400" delay={0.09} />
          <StatCard value={`${focusPercent}%`} label="Focus score" color={scoreColor} delay={0.13} />
        </div>

        {/* Focus bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.26, delay: 0.17, ease: EASE }}
          className="flex flex-col gap-2"
        >
          <div className="flex justify-between text-[11px] text-white/35 uppercase tracking-[0.07em]">
            <span>Real focus time</span>
            <span>{realPercent}%</span>
          </div>
          <div className="h-1.5 bg-[#222222] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${realPercent}%` }}
              transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
              className="h-full bg-teal-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Distraction breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.2, ease: EASE }}
        >
            <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] mb-2.5 font-semibold">
              Distraction breakdown
            </p>

            <div className="relative rounded-2xl overflow-hidden">
              {/* Content — heavily blurred + dimmed for free users */}
              {(() => {
                // Show placeholder rows when no real data (makes paywall more convincing)
                const PLACEHOLDER = [
                  { type: 'social_media', label: 'Social media', source: 'instagram.com', windows: 4, minutes: 2 },
                  { type: 'video_site',   label: 'Video site',   source: 'youtube.com',   windows: 6, minutes: 3 },
                  { type: 'idle',         label: 'Idle',         source: null,             windows: 2, minutes: 1 },
                ]
                const rows = isPro ? breakdown : (breakdown.length > 0 ? breakdown : PLACEHOLDER)
                const rowsTotal = rows.reduce((s, e) => s + e.minutes, 0)

                return (
                  <div className={`bg-[#161616] border border-[#272727] rounded-2xl p-4 flex flex-col gap-3 ${!isPro ? 'blur-[7px] opacity-30 saturate-0 select-none pointer-events-none' : ''}`}>
                    {rows.length === 0 ? (
                      <p className="text-[13px] text-teal-400/80 text-center py-1">No distractions detected</p>
                    ) : rows.map((event, i) => {
                      const barPct = rowsTotal > 0 ? Math.round((event.minutes / rowsTotal) * 100) : 100
                      return (
                        <div key={i} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] leading-none">
                                {DISTRACTION_ICONS[event.type] ?? '⚠️'}
                              </span>
                              <div>
                                <span className="text-[13px] text-white/80 font-medium">
                                  {event.source ?? event.label}
                                </span>
                                {event.source && (
                                  <span className="text-[11px] text-white/30 ml-1.5">{event.label}</span>
                                )}
                              </div>
                            </div>
                            <span className="text-[12px] text-white/40 tabular-nums shrink-0">
                              {event.minutes}m
                            </span>
                          </div>
                          <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barPct}%` }}
                              transition={{ duration: 0.7, delay: 0.5 + i * 0.08, ease: EASE }}
                              className="h-full bg-amber-500/70 rounded-full"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Paywall overlay — free users only */}
              {!isPro && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#0a0a0a]/88">
                  <div className="w-10 h-10 rounded-2xl bg-[#1e1e1e] border border-[#333] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-semibold text-white/90">Pro feature</p>
                    <p className="text-[12px] text-white/40 mt-1 px-8 leading-relaxed">
                      See exactly what distracted you and for how long
                    </p>
                  </div>
                  <div className="px-4 py-1.5 bg-orange-500/20 border border-orange-500/40 rounded-full">
                    <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-[0.08em]">
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: 0.25, ease: EASE }}
            className="bg-[#161616] border border-[#272727] rounded-2xl p-4"
          >
            <p className="text-[10px] text-teal-400/70 uppercase tracking-[0.1em] mb-2.5 font-semibold">
              AI Summary
            </p>
            <p className="text-[13px] text-white/70 leading-relaxed">{summary.ai_feedback}</p>
          </motion.div>
        )}
      </div>

      {/* Pinned CTA */}
      <motion.footer
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, delay: 0.3, ease: EASE }}
        className="shrink-0 px-6 py-4 border-t border-[#1e1e1e] bg-[#0f0f0f]"
      >
        <motion.button
          onClick={onStartNew}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.975 }}
          className="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white text-[15px] font-semibold py-3 rounded-xl transition-colors duration-150 cursor-pointer"
        >
          Start new session
        </motion.button>
      </motion.footer>

    </div>
  )
}
