import { motion } from 'motion/react'
import { Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
    <TooltipProvider>
    <div className="flex flex-col h-full bg-[#0f0f0f]">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE }}
        className="shrink-0 px-6 pt-6 pb-4 border-b border-[#1a1a1a]"
      >
        <p className="text-[11px] text-white/25 uppercase tracking-[0.12em] mb-3 font-medium">{topic}</p>
        <h1 className="text-[42px] font-bold text-[#f0f0f0] tracking-[-0.04em] leading-[1.05]">Session complete</h1>
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
            <div className="flex items-center gap-1.5 mt-2">
              <p className="text-[11px] text-white/30 uppercase tracking-[0.09em]">Focus score</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-white/20 hover:text-white/45 transition-colors duration-150 cursor-default">
                    <Info size={11} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[200px] leading-snug">
                  Weighted average of active window, idle time, and browser activity. Updated every 30s.
                </TooltipContent>
              </Tooltip>
            </div>
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

          {isPro ? (
            /* Pro: real data */
            (() => {
              const rowsTotal = breakdown.reduce((s, e) => s + e.minutes, 0)
              return (
                <div className="bg-[#161616] border border-[#252525] rounded-2xl p-4 flex flex-col gap-3.5">
                  {breakdown.length === 0 ? (
                    <p className="text-[13px] text-white/50 text-center py-1">No distractions detected</p>
                  ) : breakdown.map((event, i) => {
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
            })()
          ) : (
            /* Free: ghost rows — invite, don't punish */
            <div className="bg-[#161616] border border-[#252525] rounded-2xl p-4 flex flex-col gap-3.5">
              {[65, 42, 28].map((w, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="h-2.5 rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
                    <div className="h-2.5 w-6 rounded-full bg-white/[0.06] ml-3 shrink-0" />
                  </div>
                  <div className="h-px bg-[#252525] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-white/[0.05]" style={{ width: `${w}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <p className="text-[12px] text-white/35 leading-snug">
                  See what distracted you — and for how long
                </p>
                <button className="text-[11px] font-semibold text-[#f97316] hover:text-[#fb923c] transition-colors duration-150 shrink-0 ml-4 cursor-pointer">
                  Upgrade ↗
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* AI feedback */}
        {summary.ai_feedback && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.22, ease: EASE }}
            className="bg-[#161616] border border-[#252525] rounded-2xl p-4"
          >
            <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] mb-2.5 font-semibold">
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
    </TooltipProvider>
  )
}
