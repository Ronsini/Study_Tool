import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { api } from '../lib/api'

const STUDY_MODES = [
  { value: 'mac_pc',           label: 'Mac / PC',      icon: '⌘', description: 'Window tracking + webcam' },
  { value: 'physical_book',    label: 'Physical book', icon: '📖', description: 'Webcam only' },
  { value: 'physical_writing', label: 'Writing',       icon: '✏️', description: 'Notebook or paper' },
  { value: 'lecture',          label: 'Lecture',       icon: '🎓', description: 'Video or in-person' },
  { value: 'mix',              label: 'Mix',           icon: '⚡', description: 'Auto-detect switching' },
]

const SUBJECT_COLORS = [
  '#0D9488', '#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#D97706',
]

const DURATIONS = [25, 45, 60, 90, 120, 180]

interface Subject { id: string; name: string; color: string }
interface Props { onSessionStarted: (sessionId: string, topic: string) => void }

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const INPUT = 'w-full bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#3e3e3e] focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 transition-colors duration-150'

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

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSubject) { setError('Select a subject'); return }
    if (!topic.trim()) { setError('Enter a topic'); return }
    setError('')
    setLoading(true)
    try {
      const session = await api.sessions.start({
        subject_id: selectedSubject,
        topic: topic.trim(),
        study_mode: studyMode,
        duration_goal_min: durationGoal,
        goal: goal.trim(),
      })
      onSessionStarted(session.id, topic.trim())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
      setLoading(false)
    }
  }

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject)

  return (
    /* Sticky-footer layout: header + scrollable body + pinned CTA */
    <div className="flex flex-col h-full bg-[#0f0f0f]">

      {/* ── Header ─────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: EASE }}
        className="shrink-0 px-6 pt-6 pb-4 border-b border-[#1e1e1e]"
      >
        <p className="text-[10px] text-white/30 uppercase tracking-[0.12em] mb-1">Study Tool</p>
        <h1 className="text-[26px] font-bold text-white tracking-[-0.03em]">New session</h1>
      </motion.header>

      {/* ── Scrollable form body ────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <form id="session-form" onSubmit={handleStart} className="px-6 py-5 flex flex-col gap-5">

          {/* Subject */}
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.04, ease: EASE }}
          >
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-[0.09em] mb-2">
              Subject
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubject(s.id)}
                  whileTap={{ scale: 0.94 }}
                  transition={{ duration: 0.1 }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    selectedSubject === s.id
                      ? 'bg-white/12 text-white border border-white/22'
                      : 'bg-[#1c1c1c] text-white/55 border border-[#2e2e2e] hover:border-[#3e3e3e] hover:text-white/75'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  {s.name}
                </motion.button>
              ))}
              <button
                type="button"
                onClick={() => setShowNewSubject(!showNewSubject)}
                className="px-3.5 py-1.5 rounded-lg text-[13px] text-white/35 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white/55 transition-all duration-150"
              >
                + New
              </button>
            </div>
            {showNewSubject && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, ease: EASE }}
                className="flex gap-2 mt-2.5 items-center"
              >
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  placeholder="Subject name"
                  className="flex-1 bg-[#1c1c1c] border border-[#2e2e2e] focus:border-teal-500 rounded-xl px-3 py-2 text-[13px] text-white placeholder-white/25 transition-colors duration-150"
                />
                <div className="flex gap-1.5">
                  {SUBJECT_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setNewSubjectColor(c)}
                      style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: c,
                        transform: newSubjectColor === c ? 'scale(1.35)' : 'scale(1)',
                        outline: newSubjectColor === c ? `2px solid ${c}` : 'none',
                        outlineOffset: 2, transition: 'transform 0.1s' }}
                    />
                  ))}
                </div>
                <button type="button" onClick={handleCreateSubject}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-[13px] font-medium rounded-xl transition-colors duration-150">
                  Add
                </button>
              </motion.div>
            )}
          </motion.section>

          {/* Topic */}
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.07, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.09em]">Topic</label>
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
            <p className="text-[11px] text-white/25 mt-1.5">Claude generates check-in questions from this</p>
          </motion.section>

          {/* Goal */}
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.1, ease: EASE }}
          >
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-[0.09em] mb-2">
              Goal <span className="normal-case font-normal tracking-normal text-white/22">— optional</span>
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.13, ease: EASE }}
          >
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-[0.09em] mb-2">
              Study mode
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {STUDY_MODES.map(m => {
                const active = studyMode === m.value
                return (
                  <motion.button
                    key={m.value}
                    type="button"
                    onClick={() => setStudyMode(m.value)}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                    className={`text-left px-3.5 py-2.5 rounded-xl border transition-all duration-150 ${
                      active
                        ? 'border-teal-500 bg-teal-500/15 text-white'
                        : 'border-[#252525] bg-[#181818] text-white/55 hover:border-[#363636] hover:text-white/75'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{m.icon}</span>
                      <span className="text-[13px] font-medium">{m.label}</span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-snug ${active ? 'text-teal-300/60' : 'text-white/28'}`}>
                      {m.description}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </motion.section>

          {/* Duration */}
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.16, ease: EASE }}
          >
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-[0.09em] mb-2">
              Duration
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <motion.button
                  key={d}
                  type="button"
                  onClick={() => setDurationGoal(d)}
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.1 }}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    durationGoal === d
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/60'
                      : 'bg-[#1a1a1a] text-white/45 border border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white/65'
                  }`}
                >
                  {d >= 60 ? `${d / 60}h` : `${d}m`}
                </motion.button>
              ))}
            </div>
          </motion.section>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[13px] text-red-400/80"
            >
              {error}
            </motion.p>
          )}

        </form>
      </div>

      {/* ── Pinned footer CTA ──────────────────── */}
      <motion.footer
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, delay: 0.2, ease: EASE }}
        className="shrink-0 px-6 py-4 border-t border-[#1e1e1e] bg-[#0f0f0f]"
      >
        <motion.button
          type="submit"
          form="session-form"
          disabled={loading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.975 }}
          className="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:opacity-40 text-white text-[15px] font-semibold py-3 rounded-xl transition-colors duration-150 cursor-pointer"
        >
          {loading ? 'Starting…' : 'Begin session'}
        </motion.button>
      </motion.footer>

    </div>
  )
}
