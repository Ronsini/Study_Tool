import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
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

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function TimerScreen({ sessionId, topic, onSessionEnded }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const [focusScore, setFocusScore] = useState<number | null>(null)
  const [isFocused, setIsFocused] = useState(true)
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null)
  const [stopping, setStopping] = useState(false)
  const windowSwitchRef = useRef(0)
  const activityInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerInterval.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerInterval.current) clearInterval(timerInterval.current) }
  }, [])

  const sendActivity = useCallback(async () => {
    try {
      const result = await api.activity.post({
        session_id: sessionId,
        face_present: true,
        looking_at_screen: true,
        phone_detected: false,
        active_app: 'Study Tool',
        window_switches: windowSwitchRef.current,
        idle_seconds: 0,
      })
      setFocusScore(result.focus_score)
      setIsFocused(result.is_focused)
      windowSwitchRef.current = 0

      if (result.fire_checkin) {
        try {
          const token = await window.electron.store.get('access_token')
          const res = await fetch('http://localhost:8000/checkins/generate', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data = await res.json()
            if (data?.id) setCheckIn({ checkin_id: data.id, question: data.question })
          }
        } catch { /* no question available */ }
      }
    } catch { /* network hiccup */ }
  }, [sessionId])

  useEffect(() => {
    sendActivity()
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

  function formatTime(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const isWarm = focusScore !== null
  const showRipple = isWarm && isFocused

  const statusLabel = !isWarm ? 'Warming up…' : isFocused ? 'Focused' : 'Distracted'
  const statusDot = !isWarm ? 'bg-white/20' : isFocused ? 'bg-teal-400' : 'bg-amber-400'
  const statusText = !isWarm ? 'text-white/30' : isFocused ? 'text-teal-400' : 'text-amber-400'

  return (
    <div className="flex flex-col items-center justify-between h-full bg-[#0f0f0f] relative">

      {/* Check-in overlay */}
      <AnimatePresence>
        {checkIn && (
          <CheckInOverlay
            checkinId={checkIn.checkin_id}
            question={checkIn.question}
            onDismiss={() => setCheckIn(null)}
          />
        )}
      </AnimatePresence>

      {/* Top: topic label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05, ease: EASE }}
        className="pt-8 flex flex-col items-center gap-1"
      >
        <p className="text-[10px] text-white/25 uppercase tracking-[0.12em]">Now studying</p>
        <p className="text-[14px] text-white/65 font-medium tracking-[-0.01em] max-w-[340px] text-center leading-snug">
          {topic}
        </p>
      </motion.div>

      {/* Center: clock + ripple rings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col items-center gap-6"
      >
        {/* Clock with ambient rings */}
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 120 }}>
          {showRipple && (
            <>
              <div className="absolute inset-0 rounded-full border border-teal-500/25 ripple-ring" />
              <div className="absolute inset-0 rounded-full border border-teal-500/15 ripple-ring"
                style={{ animationDelay: '1.3s' }} />
            </>
          )}
          <span className="tabular-nums text-[76px] font-light text-white tracking-[-0.04em] leading-none select-none">
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 py-2">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot} ${showRipple ? 'status-blink' : ''}`} />
          <span className={`text-[13px] font-medium ${statusText}`}>{statusLabel}</span>
          {isWarm && (
            <span className="text-[12px] text-white/20 tabular-nums">
              {Math.round(focusScore! * 100)}%
            </span>
          )}
        </div>
      </motion.div>

      {/* Bottom: end session */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1, ease: EASE }}
        className="pb-8"
      >
        <motion.button
          onClick={handleStop}
          disabled={stopping}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="px-7 py-2.5 rounded-xl text-[13px] font-medium text-white/40 border border-[#282828] bg-[#181818] hover:border-[#3c3c3c] hover:text-white/65 disabled:opacity-40 transition-all duration-150 cursor-pointer"
        >
          {stopping ? 'Ending…' : 'End session'}
        </motion.button>
      </motion.div>

    </div>
  )
}
