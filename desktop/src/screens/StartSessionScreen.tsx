import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { api } from '../lib/api'

// /typeset: heading 26px → 42px. 42/11 = 3.8× ratio — eye has a clear dominant anchor.
//   Was: 5 section labels at same weight as heading = nothing dominates.
//   Now: heading owns the screen, labels are structural whispers.
// /layout: removed uniform gap-6. Each section has its own mt value:
//   Subject: pt-6 (first, no extra), Topic: mt-8 (prominent), Goal: mt-3 (coupled to topic),
//   Study Mode: mt-8 (major break), Duration: mt-6 (secondary)
// /bolder: section label opacity text-white/35 → text-white/50 — they read as structure now
// /colorize: input borders #2e2e2e → #383838 — more visible against #0f0f0f

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

const INPUT = 'w-full bg-[#181818] border border-[#383838] hover:border-[#484848] focus:border-[#22c55e] rounded-xl px-3.5 py-2.5 text-[14px] text-[#f0f0f0] placeholder-white/25 transition-colors duration-150 outline-none'

// /typeset: section label — weight 600, 11px, white/50. Structural, not decorative.
const LABEL = 'block text-[11px] font-semibold text-white/50 uppercase tracking-[0.1em]'

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

      {/* Header — /typeset: big heading creates the anchor the eye needs */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE }}
        className="shrink-0 px-6 pt-8 pb-6 border-b border-[#1e1e1e]"
      >
        {/* /typeset: eyebrow at 11px / white/25 — subordinate to heading, signals context */}
        <p className="text-[11px] text-white/25 uppercase tracking-[0.12em] mb-3 font-medium">Study Tool</p>
        {/* /bolder: 42px heading at -0.04em tracking. 42/11 = 3.8× ratio. Eye knows where to start. */}
        <h1 className="text-[42px] font-bold text-[#f0f0f0] tracking-[-0.04em] leading-[1.05]">
          New session
        </h1>
      </motion.header>

      {/* Scrollable body — /layout: no uniform gap. Section margins vary for rhythm. */}
      <div className="flex-1 overflow-y-auto">
        <form id="session-form" onSubmit={handleStart} className="px-6 pt-6 pb-4 flex flex-col">

          {/* ── Subject ──────────────────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.04, ease: EASE }}
          >
            <label className={`${LABEL} mb-3`}>Subject</label>
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
                      : 'bg-[#181818] text-white/45 border border-[#303030] hover:border-[#444] hover:text-white/70'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  {s.name}
                </motion.button>
              ))}
              <motion.button
                type="button"
                onClick={() => setShowNewSubject(!showNewSubject)}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="px-3 py-1.5 rounded-lg text-[13px] text-white/30 bg-[#181818] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white/50 transition-all duration-150"
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
                  className="flex-1 bg-[#181818] border border-[#383838] focus:border-[#22c55e] rounded-xl px-3 py-2 text-[13px] text-[#f0f0f0] placeholder-white/25 transition-colors duration-150 outline-none"
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

          {/* ── Topic — mt-8: primary question, deserves the most space above it ── */}
          <motion.section
            className="mt-8"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.07, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-3">
              <label className={LABEL}>Topic</label>
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
            <p className="text-[12px] text-white/25 mt-2 leading-snug">
              Claude generates check-in questions from this topic
            </p>
          </motion.section>

          {/* ── Goal — mt-3: optional, coupled tightly to topic ──────────────── */}
          <motion.section
            className="mt-3"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.1, ease: EASE }}
          >
            <label className={`${LABEL} mb-3`}>
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

          {/* ── Study mode — mt-8: major section break ───────────────────────── */}
          <motion.section
            className="mt-8"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.13, ease: EASE }}
          >
            <label className={`${LABEL} mb-1`}>Study mode</label>
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

          {/* ── Duration — mt-6 ──────────────────────────────────────────────── */}
          <motion.section
            className="mt-6"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.16, ease: EASE }}
          >
            <label className={`${LABEL} mb-3`}>Duration</label>
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
              className="mt-4 text-[12px] text-red-400/80"
            >
              {error}
            </motion.p>
          )}

        </form>
      </div>

      {/* Pinned CTA footer */}
      <motion.footer
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.2, ease: EASE }}
        className="shrink-0 px-6 py-4 border-t border-[#1e1e1e] bg-[#0f0f0f]"
      >
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
      </motion.footer>

    </div>
  )
}
