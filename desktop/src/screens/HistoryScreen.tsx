import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { api } from '../lib/api'

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

function scoreColor(score: number | null) {
  if (score === null) return 'text-white/30'
  const pct = Math.round(score * 100)
  if (pct >= 70) return 'text-teal-400'
  if (pct >= 40) return 'text-amber-400'
  return 'text-red-400'
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
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: EASE }}
        className="shrink-0 px-6 pt-6 pb-4 border-b border-[#1e1e1e]"
      >
        <h1 className="text-[24px] font-bold text-white tracking-[-0.03em]">History</h1>
        <p className="text-[12px] text-white/30 mt-0.5">Past study sessions</p>
      </motion.header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-teal-500 spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full px-6">
            <p className="text-[13px] text-red-400/70 text-center">{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-8">
            <p className="text-[14px] text-white/40 text-center">No sessions yet</p>
            <p className="text-[12px] text-white/20 text-center leading-relaxed">
              Complete your first study session to see your history here
            </p>
          </div>
        ) : (
          <div className="px-4 py-4 flex flex-col gap-2">
            {sessions.map((s, i) => {
              const subject = subjectMap[s.subject_id]
              const pct = s.focus_score !== null ? Math.round(s.focus_score * 100) : null
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(i * 0.04, 0.2), ease: EASE }}
                  className="bg-[#161616] border border-[#252525] rounded-2xl px-4 py-3.5 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    {subject && (
                      <span
                        className="text-[10px] uppercase tracking-[0.08em] font-semibold"
                        style={{ color: subject.color }}
                      >
                        {subject.name}
                      </span>
                    )}
                    <p className="text-[14px] text-white/85 font-medium leading-snug truncate mt-0.5">
                      {s.topic}
                    </p>
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

                  <div className="shrink-0 flex flex-col items-end gap-0.5">
                    {pct !== null ? (
                      <>
                        <span className={`text-[22px] font-bold leading-none tracking-[-0.03em] ${scoreColor(s.focus_score)}`}>
                          {pct}%
                        </span>
                        <span className="text-[10px] text-white/25 uppercase tracking-[0.07em]">focus</span>
                      </>
                    ) : (
                      <span className="text-[13px] text-white/20">—</span>
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
