import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const STUDY_MODES = [
  { value: 'mac_pc', label: 'Mac / PC', description: 'Window tracking + webcam' },
  { value: 'physical_book', label: 'Physical Book', description: 'Webcam focus' },
  { value: 'physical_writing', label: 'Writing', description: 'Notebook or paper' },
  { value: 'lecture', label: 'Lecture', description: 'Video or in-person' },
  { value: 'mix', label: 'Mix', description: 'Auto-detect switching' },
]

const COLORS = ['#6d28d9', '#2563eb', '#059669', '#d97706', '#dc2626', '#db2777']

interface Subject {
  id: string
  name: string
  color: string
}

interface Props {
  onSessionStarted: (sessionId: string, topic: string) => void
}

export default function StartSessionScreen({ onSessionStarted }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectColor, setNewSubjectColor] = useState(COLORS[0])
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
    } catch {
      setError('Failed to create subject')
    }
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

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] overflow-y-auto">
      <div className="max-w-lg w-full mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-white mb-1">New study session</h1>
        <p className="text-sm text-white/40 mb-8">What are you studying today?</p>

        <form onSubmit={handleStart} className="flex flex-col gap-6">

          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50 uppercase tracking-wider">Subject</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubject(s.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSubject === s.id
                      ? 'text-white ring-2 ring-white/30'
                      : 'text-white/60 bg-white/5 hover:bg-white/10'
                  }`}
                  style={selectedSubject === s.id ? { backgroundColor: s.color } : {}}
                >
                  {s.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowNewSubject(!showNewSubject)}
                className="px-4 py-2 rounded-lg text-sm text-white/40 bg-white/5 hover:bg-white/10 transition-colors"
              >
                + New
              </button>
            </div>

            {showNewSubject && (
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  placeholder="Subject name"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                />
                <div className="flex gap-1">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubjectColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${newSubjectColor === c ? 'scale-125' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreateSubject}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Topic */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wider">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
              placeholder="e.g. Mitosis and cell division"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-violet-500 transition-colors"
            />
            <p className="text-xs text-white/30">The AI will generate questions based on this topic</p>
          </div>

          {/* Goal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wider">Session goal <span className="text-white/20">(optional)</span></label>
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Understand the stages of mitosis"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Study Mode */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/50 uppercase tracking-wider">Study mode</label>
            <div className="grid grid-cols-2 gap-2">
              {STUDY_MODES.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setStudyMode(m.value)}
                  className={`text-left px-4 py-3 rounded-lg border transition-all ${
                    studyMode === m.value
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-xs text-white/30 mt-0.5">{m.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wider">Goal duration: {durationGoal} min</label>
            <input
              type="range"
              min={15}
              max={240}
              step={15}
              value={durationGoal}
              onChange={e => setDurationGoal(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-white/20">
              <span>15m</span><span>1h</span><span>2h</span><span>4h</span>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors mt-2"
          >
            {loading ? 'Starting session...' : 'Start session'}
          </button>
        </form>
      </div>
    </div>
  )
}
