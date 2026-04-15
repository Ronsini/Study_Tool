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

export default function SummaryScreen({ summary, topic, onStartNew }: Props) {
  const focusPercent = Math.round(summary.focus_score * 100)
  const realPercent = summary.total_minutes > 0
    ? Math.round((summary.real_focus_min / summary.total_minutes) * 100)
    : 0

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0f0f0f] px-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div>
          <p className="text-white/30 text-sm mb-1">{topic}</p>
          <h1 className="text-2xl font-semibold text-white">Session complete</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold text-white">{summary.total_minutes}</div>
            <div className="text-xs text-white/30 mt-1">Total min</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold text-emerald-400">{summary.real_focus_min}</div>
            <div className="text-xs text-white/30 mt-1">Focus min</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className={`text-2xl font-semibold ${
              focusPercent >= 70 ? 'text-emerald-400' :
              focusPercent >= 40 ? 'text-amber-400' : 'text-red-400'
            }`}>{focusPercent}%</div>
            <div className="text-xs text-white/30 mt-1">Focus score</div>
          </div>
        </div>

        {/* Focus bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/30">
            <span>Real focus time</span>
            <span>{realPercent}% of session</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${realPercent}%` }}
            />
          </div>
        </div>

        {/* AI feedback */}
        {summary.ai_feedback && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
            <p className="text-xs text-violet-300/50 uppercase tracking-wider mb-2">AI summary</p>
            <p className="text-white/80 text-sm leading-relaxed">{summary.ai_feedback}</p>
          </div>
        )}

        <button
          onClick={onStartNew}
          className="bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Start new session
        </button>
      </div>
    </div>
  )
}
