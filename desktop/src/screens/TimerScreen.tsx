import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../lib/api'
import CheckInOverlay from './CheckInOverlay'

interface Props {
  sessionId: string
  topic: string
  onSessionEnded: (summary: SessionSummary) => void
}

interface SessionSummary {
  total_minutes: number
  real_focus_min: number
  focus_score: number
  ai_feedback: string
}

interface CheckInData {
  checkin_id: string
  question: string
}

export default function TimerScreen({ sessionId, topic, onSessionEnded }: Props) {
  const [elapsed, setElapsed] = useState(0) // seconds
  const [focusScore, setFocusScore] = useState<number | null>(null)
  const [isFocused, setIsFocused] = useState(true)
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null)
  const [stopping, setStopping] = useState(false)
  const windowSwitchRef = useRef(0)
  const activityInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer tick
  useEffect(() => {
    timerInterval.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerInterval.current) clearInterval(timerInterval.current) }
  }, [])

  // Send activity signals every 30 seconds
  const sendActivity = useCallback(async () => {
    try {
      const result = await api.activity.post({
        session_id: sessionId,
        face_present: true,        // will be replaced by MediaPipe in Phase 2 step 6
        looking_at_screen: true,   // will be replaced by MediaPipe in Phase 2 step 6
        phone_detected: false,     // will be replaced by MediaPipe in Phase 2 step 6
        active_app: 'Study Tool',  // will be replaced by window tracker in Phase 2 step 7
        window_switches: windowSwitchRef.current,
        idle_seconds: 0,
      })

      setFocusScore(result.focus_score)
      setIsFocused(result.is_focused)
      windowSwitchRef.current = 0 // reset counter after each report

      // Golden rule: only show check-in if already distracted
      if (result.fire_checkin) {
        try {
          const checkinRes = await fetch('http://localhost:8000/checkins/generate', {
            headers: {
              Authorization: `Bearer ${await window.electron.store.get('access_token')}`,
            },
          })
          if (checkinRes.ok) {
            const data = await checkinRes.json()
            if (data && data.id) setCheckIn({ checkin_id: data.id, question: data.question })
          }
        } catch { /* no question available */ }
      }
    } catch { /* network hiccup — don't crash the timer */ }
  }, [sessionId])

  useEffect(() => {
    sendActivity() // first ping immediately
    activityInterval.current = setInterval(sendActivity, 30_000)
    return () => { if (activityInterval.current) clearInterval(activityInterval.current) }
  }, [sendActivity])

  async function handleStop() {
    setStopping(true)
    if (activityInterval.current) clearInterval(activityInterval.current)
    if (timerInterval.current) clearInterval(timerInterval.current)
    try {
      const summary = await api.sessions.stop(sessionId)
      onSessionEnded(summary)
    } catch {
      setStopping(false)
    }
  }

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const focusColor = focusScore === null
    ? 'text-white/30'
    : focusScore >= 0.7
    ? 'text-emerald-400'
    : focusScore >= 0.4
    ? 'text-amber-400'
    : 'text-red-400'

  const focusLabel = focusScore === null
    ? 'Warming up...'
    : isFocused
    ? 'Focused'
    : 'Distracted'

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0f0f0f] relative">
      {/* Check-in overlay — only appears when distracted */}
      {checkIn && (
        <CheckInOverlay
          checkinId={checkIn.checkin_id}
          question={checkIn.question}
          onDismiss={() => setCheckIn(null)}
        />
      )}

      <div className="flex flex-col items-center gap-8">
        {/* Topic */}
        <p className="text-white/40 text-sm">{topic}</p>

        {/* Timer */}
        <div className="text-7xl font-mono font-light text-white tracking-tight">
          {formatTime(elapsed)}
        </div>

        {/* Focus status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            focusScore === null ? 'bg-white/20' :
            isFocused ? 'bg-emerald-400' : 'bg-red-400'
          }`} />
          <span className={`text-sm font-medium ${focusColor}`}>{focusLabel}</span>
          {focusScore !== null && (
            <span className="text-xs text-white/20">
              {Math.round(focusScore * 100)}%
            </span>
          )}
        </div>

        {/* Stop button */}
        <button
          onClick={handleStop}
          disabled={stopping}
          className="mt-4 px-8 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {stopping ? 'Ending session...' : 'End session'}
        </button>
      </div>
    </div>
  )
}
