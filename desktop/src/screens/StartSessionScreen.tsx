import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { api } from '../lib/api'

// /colorize: SUBJECT_COLORS — removed teal (#0D9488) and purple (#7C3AED), both hard-banned
// /colorize: "Add" subject button → orange (#f97316). Green = focus state only, not CTAs.
// /animate: + New button now motion.button with whileTap. No pressable surface without feedback.
// /layout: contrast fixes — inputs bg-[#181818] border-[#2e2e2e], study mode divide-[#282828]
// /distill: informational note replaces dead vertical space — teaches golden rule

// Cleaned subject colors — no teal, no cyan, no purple
const SUBJECT_COLORS = [
  '#3b82f6', // blue
  '#e11d48', // rose
  '#f97316', // orange
  '#84cc16', // lime
  '#fbbf24', // amber
  '#ec4899', // pink
]

const STUDY_MODES = [
  { value: 'mac_pc',           label: 'Mac / PC',      description: 'Window tracking + webcam' },
  { value: 'physical_book',    label: 'Physical book', description: 'Webcam only' },
  { value: 'physical_writing', label: 'Writing',       description: 'Notebook or paper' },
  { value: 'lecture',          label: 'Lecture',       description: 'Video or in-person' },
  { value: 'mix',              label: 'Mix',           description: 'Auto-detect switching' },
]

const DURATIONS = [25, 45, 60, 90, 120, 180]

interface Subject { id: string; name: string; color: string }
interface Props { onSessionStarted: (sessionId: string, topic: string, studyMode: string) => void }

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// /layout: bg-[#181818] + border-[#2e2e2e] — enough contrast against #0f0f0f to read as a field
const INPUT = 'w-full bg-[#181818] border border-[#2e2e2e] hover:border-[#3a3a3a] focus:border-[#22c55e] rounded-xl px-3.5 py-2.5 text-[13px] text-[#f0f0f0] placeholder-white/25 transition-colors duration-150 outline-none'

export default function StartSessionScreen({ onSessionStarted }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectColor, setNewSubjectColor] = useState(SUBJECT_COLORS[0])
  const [showNewSubject, setShowNewSubject] = useState(false)
  const [topic, setTopic] = useState('')
  const [goal, setGoal] = useState('')
  const [studyMode, setStudyMode] = useState('mac_pc')
  const [durationGoal, setDurationGoal] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.subjects.list().then(data => {
      setSubjects(data)
      if (data.length > 0) setSelectedSubject(data[0].id)
    }).catch(() => {})
  }, [])

  async function handleCreateSubject() {
    if (!newSubjectName.trim()) return
    try {
      const s = await api.subjects.create(newSubjectName.trim(), newSubjectColor)
      setSubjects(prev => [...prev, s])
      setSelectedSubject(s.id)
      setNewSubjectName('')
      setShowNewSubject(false)
    } catch { setError('Failed to create subject') }
  }

  async function startSession() {
    const session = await api.sessions.start({
      subject_id: selectedSubject,
      topic: topic.trim(),
      study_mode: studyMode,
      duration_goal_min: durationGoal,
      goal: goal.trim(),
    })
    onSessionStarted(session.id, topic.trim(), studyMode)
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSubject) { setError('Select a subject'); return }
    if (!topic.trim()) { setError('Enter a topic'); return }
    setError('')
    setLoading(true)
    try {
      await startSession()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start session'
      if (msg === 'A session is already active') {
        try {
          await api.sessions.stop('')
          await startSession()
        } catch {
          setError('Could not clear previous session. Please restart the app.')
          setLoading(false)
        }
      } else {
        setError(msg)
        setLoading(false)
      }
    }
  }

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject)

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE }}
        className="shrink-0 px-6 pt-6 pb-4 border-b border-[#1a1a1a]"
      >
        <p className="text-[10px] text-white/25 uppercase tracking-[0.12em] mb-1">Study Tool</p>
        <h1 className="text-[26px] font-bold text-[#f0f0f0] tracking-[-0.03em]">New session</h1>
      </motion.header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <form id="session-form" onSubmit={handleStart} className="px-6 py-5 flex flex-col gap-8 max-w-[660px]">

          {/* Subject */}
          <motion.section
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.04, ease: EASE }}
          >
            <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-[0.09em] mb-2.5">
              Subject
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubject(s.id)}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    selectedSubject === s.id
                      ? 'bg-white/[0.12] text-[#f0f0f0] border border-white/[0.28]'
                      : 'bg-[#181818] text-white/45 border border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white/70'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  {s.name}
                </motion.button>
              ))}
              {/* /animate: + New now has tap feedback */}
              <motion.button
                type="button"
                onClick={() => setShowNewSubject(!showNewSubject)}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="px-3 py-1.5 rounded-lg text-[13px] text-white/30 bg-[#181818] border border-[#252525] hover:border-[#353535] hover:text-white/50 transition-all duration-150"
              >
                + New
              </motion.button>
            </div>

            {showNewSubject && (
              <motion.div
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: EASE }}
                className="flex gap-2 mt-3 items-center"
              >
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  placeholder="Subject name"
                  className="flex-1 bg-[#181818] border border-[#2e2e2e] focus:border-[#22c55e] rounded-xl px-3 py-2 text-[13px] text-[#f0f0f0] placeholder-white/25 transition-colors duration-150 outline-none"
                />
                <div className="flex gap-1.5">
                  {SUBJECT_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setNewSubjectColor(c)}
                      style={{
                        width: 18, height: 18, borderRadius: '50%', backgroundColor: c,
                        transform: newSubjectColor === c ? 'scale(1.35)' : 'scale(1)',
                        outline: newSubjectColor === c ? `2px solid ${c}` : 'none',
                        outlineOffset: 2, transition: 'transform 0.1s',
                      }}
                    />
                  ))}
                </div>
                {/* /colorize: orange = create action. Green = earned focus state only. */}
                <motion.button
                  type="button"
                  onClick={handleCreateSubject}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  transition={{ duration: 0.1, ease: EASE }}
                  className="px-3 py-2 bg-[#f97316] hover:bg-[#fb923c] active:bg-[#ea6d0e] text-white text-[13px] font-medium rounded-xl transition-colors duration-150 cursor-pointer"
                >
                  Add
                </motion.button>
              </motion.div>
            )}
          </motion.section>

          {/* Topic */}
          <motion.section
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.07, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.09em]">Topic</label>
              {selectedSubjectData && (
                <span className="text-[11px] text-white/25 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedSubjectData.color }} />
                  {selectedSubjectData.name}
                </span>
              )}
            </div>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
              placeholder="e.g. Mitosis and cell division"
              className={INPUT}
            />
            <p className="text-[11px] text-white/25 mt-1.5 leading-snug">
              Claude generates check-in questions from this topic
            </p>
          </motion.section>

          {/* Goal — optional */}
          <motion.section
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.1, ease: EASE }}
          >
            <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-[0.09em] mb-2.5">
              Goal <span className="normal-case font-normal tracking-normal text-white/20">— optional</span>
            </label>
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Understand the stages of mitosis"
              className={INPUT}
            />
          </motion.section>

          {/* Study mode */}
          <motion.section
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.13, ease: EASE }}
          >
            <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-[0.09em] mb-1">
              Study mode
            </label>
            {/* /layout: divide-[#282828] — wide enough to actually see the separators */}
            <div className="divide-y divide-[#282828]">
              {STUDY_MODES.map(m => {
                const active = studyMode === m.value
                return (
                  <motion.button
                    key={m.value}
                    type="button"
                    onClick={() => setStudyMode(m.value)}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.1 }}
                    className="w-full flex items-center justify-between py-2.5 px-1 text-left transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* /colorize: active dot is w-2 h-2 — large enough to read as selected */}
                      <div className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-150 ${
                        active ? 'bg-[#22c55e]' : 'bg-[#333]'
                      }`} />
                      <span className={`text-[13px] font-medium transition-colors duration-150 ${
                        active ? 'text-[#f0f0f0]' : 'text-white/45 group-hover:text-white/65'
                      }`}>
                        {m.label}
                      </span>
                    </div>
                    <span className={`text-[12px] transition-colors duration-150 ${
                      active ? 'text-white/40' : 'text-white/20'
                    }`}>
                      {m.description}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.section>

          {/* Duration */}
          <motion.section
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.16, ease: EASE }}
          >
            <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-[0.09em] mb-2.5">
              Duration
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <motion.button
                  key={d}
                  type="button"
                  onClick={() => setDurationGoal(d)}
                  whileTap={{ scale: 0.93 }}
                  transition={{ duration: 0.1 }}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    durationGoal === d
                      ? 'bg-[#22c55e]/[0.18] text-[#22c55e] border border-[#22c55e]/60'
                      : 'bg-[#181818] text-white/40 border border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white/60'
                  }`}
                >
                  {d >= 60 ? `${d / 60}h` : `${d}m`}
                </motion.button>
              ))}
            </div>
          </motion.section>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[12px] text-red-400/80"
            >
              {error}
            </motion.p>
          )}

          {/* /copy: fills dead vertical space + teaches the golden rule */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.22, ease: EASE }}
            className="mt-auto pt-6 pb-4"
          >
            <p className="text-[11px] text-white/[0.18] leading-relaxed text-center px-4">
              Check-in questions only appear when a distraction is already detected — your focus is never interrupted
            </p>
          </motion.div>

        </form>
      </div>

      {/* Pinned CTA footer */}
      <motion.footer
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.2, ease: EASE }}
        className="shrink-0 px-6 py-4 border-t border-[#1a1a1a] bg-[#0f0f0f]"
      >
        <div className="max-w-[660px]">
        <motion.button
          type="submit"
          form="session-form"
          disabled={loading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.975 }}
          transition={{ duration: 0.1, ease: EASE }}
          className="w-full bg-[#f97316] hover:bg-[#fb923c] active:bg-[#ea6d0e] disabled:opacity-40 text-white text-[15px] font-semibold py-3 rounded-xl transition-colors duration-150 cursor-pointer"
        >
          {loading ? 'Starting…' : 'Begin session'}
        </motion.button>
        </div>
      </motion.footer>

    </div>
  )
}
