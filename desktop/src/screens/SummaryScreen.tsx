import { motion } from 'motion/react'

interface SessionSummary {
  total_minutes: number
  real_focus_min: number
  focus_score: number
  ai_feedback: string
}

interface Props {
  summary: SessionSummary
  topic: string
  onStartNew: () => void
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

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
  const focusPercent = Math.round(summary.focus_score * 100)
  const realPercent = summary.total_minutes > 0
    ? Math.round((summary.real_focus_min / summary.total_minutes) * 100)
    : 0

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
          <StatCard value={summary.total_minutes} label="Total min" delay={0.05} />
          <StatCard value={summary.real_focus_min} label="Focus min" color="text-teal-400" delay={0.09} />
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

        {/* AI feedback */}
        {summary.ai_feedback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: 0.22, ease: EASE }}
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
        transition={{ duration: 0.26, delay: 0.28, ease: EASE }}
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
