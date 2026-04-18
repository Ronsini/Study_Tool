import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { api } from '../lib/api'

// /distill: 7 decision points → 3 (subject, topic, start)
//   - Goal removed (off critical path — add as post-session reflection later)
//   - Study mode: show selected only, expand via "Change" (progressive disclosure)
//   - Duration: slider replaces 6-button grid (less visual noise, continuous)
// /colorize: green removed from non-earned states
//   - Active mode dot: bg-white/70 (not green — choosing a mode is not earned focus)
//   - Slider thumb: white (index.css updated separately)
// /colorize: input borders raised to #505050 rest, #626262 hover, white/40 focus
//   (was #383838 = 4% lightness diff on #1c1c1c = barely visible)

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

interface Subject { id: string; name: string; color: string }
interface Props { onSessionStarted: (sessionId: string, topic: string, studyMode: string) => void }

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const INPUT = 'w-full bg-[#181818] border border-[#505050] hover:border-[#626262] focus:border-white/40 rounded-xl px-3.5 py-2.5 text-[14px] text-[#f0f0f0] placeholder-white/25 transition-colors duration-150 outline-none'
const LABEL = 'block text-[11px] font-semibold text-white/50 uppercase tracking-[0.1em]'

function formatDuration(min: number) {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function StartSessionScreen({ onSessionStarted }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectColor, setNewSubjectColor] = useState(SUBJECT_COLORS[0])
  const [showNewSubject, setShowNewSubject] = useState(false)
  const [topic, setTopic] = useState('')
  const [studyMode, setStudyMode] = useState('mac_pc')
  const [showModes, setShowModes] = useState(false)
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
      goal: '',
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
  const selectedMode = STUDY_MODES.find(m => m.value === studyMode)!

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">

      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE }}
        className="shrink-0 px-6 pt-8 pb-6 border-b border-[#1e1e1e]"
      >
        <p className="text-[11px] text-white/25 uppercase tracking-[0.12em] mb-3 font-medium">Study Tool</p>
        <h1 className="text-[42px] font-bold text-[#f0f0f0] tracking-[-0.04em] leading-[1.05]">
          New session
        </h1>
      </motion.header>

      <div className="flex-1 overflow-y-auto">
        <form id="session-form" onSubmit={handleStart} className="px-6 pt-6 pb-4 flex flex-col">

          {/* ── Subject ── */}
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
                      : 'bg-[#181818] text-white/45 border border-[#383838] hover:border-[#505050] hover:text-white/70'
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
                className="px-3 py-1.5 rounded-lg text-[13px] text-white/30 bg-[#181818] border border-[#2a2a2a] hover:border-[#505050] hover:text-white/50 transition-all duration-150"
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
                  className="flex-1 bg-[#181818] border border-[#505050] focus:border-white/40 rounded-xl px-3 py-2 text-[13px] text-[#f0f0f0] placeholder-white/25 transition-colors duration-150 outline-none"
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

          {/* ── Topic ── */}
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

          {/* ── Study mode — progressive disclosure ── */}
          <motion.section
            className="mt-8"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.10, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-3">
              <label className={LABEL}>Study mode</label>
              <button
                type="button"
                onClick={() => setShowModes(!showModes)}
                className="text-[11px] text-white/30 hover:text-white/60 transition-colors duration-150 cursor-pointer"
              >
                {showModes ? 'Done' : 'Change'}
              </button>
            </div>

            {!showModes ? (
              /* Collapsed: show selected only */
              <div className="flex items-center gap-3 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
                <span className="text-[13px] font-medium text-[#f0f0f0]">{selectedMode.label}</span>
                <span className="text-[12px] text-white/30 ml-auto">{selectedMode.description}</span>
              </div>
            ) : (
              /* Expanded: all modes, click to select and collapse */
              <motion.div
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: EASE }}
                className="divide-y divide-[#282828]"
              >
                {STUDY_MODES.map(m => {
                  const active = studyMode === m.value
                  return (
                    <motion.button
                      key={m.value}
                      type="button"
                      onClick={() => { setStudyMode(m.value); setShowModes(false) }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.1 }}
                      className="w-full flex items-center justify-between py-2.5 px-1 text-left transition-colors duration-150 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {/* /colorize: white dot, not green — mode selection is not earned focus */}
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-150 ${
                          active ? 'bg-white/70' : 'bg-[#333]'
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
              </motion.div>
            )}
          </motion.section>

          {/* ── Duration — slider ── */}
          <motion.section
            className="mt-6"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.13, ease: EASE }}
          >
            <div className="flex items-center justify-between mb-4">
              <label className={LABEL}>Duration</label>
              {/* /colorize: duration value is neutral white, not green */}
              <span className="text-[15px] font-semibold text-[#f0f0f0] tabular-nums tracking-[-0.02em]">
                {formatDuration(durationGoal)}
              </span>
            </div>
            <input
              type="range"
              min={25}
              max={180}
              step={5}
              value={durationGoal}
              onChange={e => setDurationGoal(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-white/20 mt-2">
              <span>25m</span>
              <span>1h</span>
              <span>2h</span>
              <span>3h</span>
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

      <motion.footer
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.18, ease: EASE }}
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
