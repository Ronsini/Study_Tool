import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { api } from '../lib/api'

// /layout: session rows were identical rounded cards — replaced with flat rows + 1px dividers (Raycast-style)
// /colorize: score colors — green/amber/red. Spinner uses green border.
// /copy: empty state teaches the interface, not just says "nothing yet"
// /animate: stagger 0.04s per item, capped at 0.2s total

interface SessionRecord {
  id: string
  subject_id: string
  topic: string
  started_at: string
  ended_at: string | null
  total_minutes: number | null
  real_focus_min: number | null
  focus_score: number | null
}

interface Subject {
  id: string
  name: string
  color: string
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function scoreColorStyle(score: number | null): string {
  if (score === null) return 'text-white/25'
  const pct = Math.round(score * 100)
  // /colorize: green = earned focus, amber = mediocre, red = poor
  if (pct >= 70) return 'text-[#22c55e]'
  if (pct >= 40) return 'text-[#fbbf24]'
  return 'text-[#f87171]'
}

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.sessions.list(), api.subjects.list()])
      .then(([s, sub]) => { setSessions(s); setSubjects(sub) })
      .catch(err => setError((err as Error).message ?? 'Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]))

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">

      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE }}
        className="shrink-0 px-6 pt-6 pb-4 border-b border-[#1a1a1a]"
      >
        <h1 className="text-[24px] font-bold text-[#f0f0f0] tracking-[-0.03em]">History</h1>
        {/* /typeset: 12px secondary, 30% opacity */}
        <p className="text-[12px] text-white/30 mt-0.5">Your study sessions</p>
      </motion.header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2.5">
            {/* /delight: named loading state, not a nameless spinner */}
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#222] border-t-[#22c55e] spin" />
            <span className="text-[12px] text-white/30">Loading sessions…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full px-6">
            {/* /copy: what happened + what to do */}
            <p className="text-[13px] text-red-400/70 text-center">
              {error}. Try closing and reopening the app.
            </p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-8">
            {/* /copy: empty state teaches the interface */}
            <p className="text-[14px] text-white/50 font-medium text-center">No sessions yet</p>
            <p className="text-[12px] text-white/25 text-center leading-relaxed">
              Each session you complete will appear here with your focus score, duration, and subject
            </p>
          </div>
        ) : (
          /* /layout: flat rows with 1px dividers, not identical rounded cards */
          <div className="divide-y divide-[#191919]">
            {sessions.map((s, i) => {
              const subject = subjectMap[s.subject_id]
              const pct = s.focus_score !== null ? Math.round(s.focus_score * 100) : null
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.2), ease: EASE }}
                  className="flex items-center gap-3 px-6 py-3.5"
                >
                  <div className="flex-1 min-w-0">
                    {/* /colorize: subject color is the ONLY color accent per row */}
                    {subject && (
                      <span
                        className="text-[10px] uppercase tracking-[0.08em] font-semibold"
                        style={{ color: subject.color }}
                      >
                        {subject.name}
                      </span>
                    )}
                    {/* /typeset: 14px, medium weight, 85% opacity */}
                    <p className="text-[14px] text-[#f0f0f0]/85 font-medium leading-snug truncate mt-0.5">
                      {s.topic}
                    </p>
                    {/* /typeset: 11px, 30% opacity — secondary metadata */}
                    <div className="flex items-center gap-2 text-[11px] text-white/30 mt-1">
                      <span>{formatDate(s.started_at)}</span>
                      {s.total_minutes !== null && (
                        <>
                          <span>·</span>
                          <span>{s.total_minutes} min</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Focus % — right-aligned, dominant number */}
                  <div className="shrink-0 flex flex-col items-end gap-0.5">
                    {pct !== null ? (
                      <>
                        {/* /typeset: 22px bold, colored — the number that matters */}
                        <span className={`text-[22px] font-bold leading-none tracking-[-0.03em] tabular-nums ${scoreColorStyle(s.focus_score)}`}>
                          {pct}%
                        </span>
                        <span className="text-[10px] text-white/20 uppercase tracking-[0.07em]">focus</span>
                      </>
                    ) : (
                      <span className="text-[13px] text-white/15">—</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
