import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { api } from '../lib/api'
import CheckInOverlay from './CheckInOverlay'

// /colorize: teal → green (#22c55e). Green = focused/real. Amber = distracted.
// /animate: ripple rings use green at 0.25/0.15 opacity — very subtle

interface Props {
  sessionId: string
  topic: string
  studyMode: string
  onSessionEnded: (summary: SessionSummary) => void
}

interface SessionSummary {
  total_minutes: number | null
  real_focus_min: number | null
  focus_score: number | null
  ai_feedback: string | null
  distraction_breakdown: Array<{ type: string; label: string; source: string | null; windows: number; minutes: number }>
}

interface CheckInData {
  checkin_id: string
  question: string
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const DISTRACTION_PATTERNS = [
  'youtube', 'youtu.be', 'instagram', 'tiktok', 'twitter', 'x.com',
  'facebook', 'reddit', 'netflix', 'hulu', 'twitch', 'discord',
  'snapchat', 'whatsapp', 'telegram', 'threads', 'pinterest',
  'primevideo', 'disneyplus', '9gag',
]

function isDistraction(app: string, url: string | null): boolean {
  const a = app.toLowerCase()
  const u = (url ?? '').toLowerCase()
  return DISTRACTION_PATTERNS.some(p => a.includes(p) || u.includes(p))
}

export default function TimerScreen({ sessionId, topic, studyMode, onSessionEnded }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const [focusScore, setFocusScore] = useState<number | null>(null)
  const [isFocused, setIsFocused] = useState(true)
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null)
  const [stopping, setStopping] = useState(false)
  const windowSwitchRef = useRef(0)
  const lastAppRef = useRef<string>('')
  const worstInWindowRef = useRef<{ app: string; browser_url: string | null } | null>(null)
  const activityInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const switchPollInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerInterval.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerInterval.current) clearInterval(timerInterval.current) }
  }, [])

  useEffect(() => {
    switchPollInterval.current = setInterval(async () => {
      try {
        const info = await window.electron.tracker.getAppInfo()
        if (lastAppRef.current && lastAppRef.current !== info.app) {
          windowSwitchRef.current += 1
        }
        lastAppRef.current = info.app
        if (isDistraction(info.app, info.browser_url) || !worstInWindowRef.current) {
          worstInWindowRef.current = info
        }
      } catch { /* ignore */ }
    }, 3_000)
    return () => { if (switchPollInterval.current) clearInterval(switchPollInterval.current) }
  }, [])

  const sendActivity = useCallback(async () => {
    try {
      const reportInfo = worstInWindowRef.current
        ?? await window.electron.tracker.getAppInfo()
      worstInWindowRef.current = null

      const idleSeconds = await window.electron.tracker.getIdleSeconds()

      const result = await api.activity.post({
        session_id: sessionId,
        signals: {
          face_present: true,
          looking_at_screen: true,
          phone_detected: false,
          active_app: reportInfo.app,
          browser_url: reportInfo.browser_url,
          window_switches: windowSwitchRef.current,
          idle_seconds: idleSeconds,
          study_mode: studyMode,
        },
      })
      setFocusScore(result.focus_score)
      setIsFocused(result.is_focused)
      windowSwitchRef.current = 0

      const trayStatus = result.is_focused ? 'focused' : 'distracted'
      window.electron.tray.setStatus(trayStatus)

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
    if (switchPollInterval.current) clearInterval(switchPollInterval.current)
    window.electron.tray.setStatus('idle')
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

  // /colorize: green = focused (real), amber = distracted
  const statusLabel = !isWarm ? 'Warming up' : isFocused ? 'Focused' : 'Distracted'
  const statusDot = !isWarm ? 'bg-white/15' : isFocused ? 'bg-[#22c55e]' : 'bg-[#fbbf24]'
  const statusText = !isWarm ? 'text-white/30' : isFocused ? 'text-[#22c55e]' : 'text-[#fbbf24]'

  return (
    <div className="flex flex-col items-center justify-between h-full bg-[#0f0f0f] relative">

      <AnimatePresence>
        {checkIn && (
          <CheckInOverlay
            checkinId={checkIn.checkin_id}
            question={checkIn.question}
            onDismiss={() => setCheckIn(null)}
          />
        )}
      </AnimatePresence>

      {/* Topic — top */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05, ease: EASE }}
        className="pt-10 flex flex-col items-center gap-1"
      >
        {/* /typeset: 10px micro-label, uppercase tracked */}
        <p className="text-[10px] text-white/20 uppercase tracking-[0.12em]">Now studying</p>
        {/* /typeset: 14px body, 60% opacity, medium weight */}
        <p className="text-[14px] text-white/60 font-medium tracking-[-0.01em] max-w-[300px] text-center leading-snug">
          {topic}
        </p>
      </motion.div>

      {/* Clock + status — center */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.38, ease: EASE }}
        className="flex flex-col items-center gap-8"
      >
        {/* Clock with ripple rings */}
        <div className="relative flex items-center justify-center" style={{ width: 280, height: 120 }}>
          {/* /animate: ripple rings only when focused, green at 0.25/0.15 — very subtle */}
          {showRipple && (
            <>
              <div className="absolute inset-0 rounded-full border border-[#22c55e]/25 ripple-ring" />
              <div className="absolute inset-0 rounded-full border border-[#22c55e]/12 ripple-ring"
                style={{ animationDelay: '1.3s' }} />
            </>
          )}
          {/* /typeset: timer hero — 76px, weight 300 (only use for this) */}
          <span className="tabular-nums text-[76px] font-light text-[#f0f0f0] tracking-[-0.04em] leading-none select-none">
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2.5 bg-[#191919] border border-[#272727] rounded-full px-4 py-2">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot} ${showRipple ? 'status-blink' : ''}`} />
          <span className={`text-[13px] font-medium ${statusText}`}>{statusLabel}</span>
          {isWarm && (
            <span className="text-[12px] text-white/20 tabular-nums">
              {Math.round(focusScore! * 100)}%
            </span>
          )}
        </div>
      </motion.div>

      {/* End session — bottom, deliberately de-emphasized */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.12, ease: EASE }}
        className="pb-10"
      >
        {/* /animate: ghost button, stopping requires intent — no orange here */}
        <motion.button
          onClick={handleStop}
          disabled={stopping}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.1, ease: EASE }}
          className="px-7 py-2.5 rounded-xl text-[13px] font-medium text-white/35 border border-[#252525] bg-[#161616] hover:border-[#383838] hover:text-white/60 disabled:opacity-40 transition-all duration-150 cursor-pointer"
        >
          {stopping ? 'Ending…' : 'End session'}
        </motion.button>
      </motion.div>

    </div>
  )
}
