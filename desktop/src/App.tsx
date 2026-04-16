import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import StartSessionScreen from './screens/StartSessionScreen'
import TimerScreen from './screens/TimerScreen'
import SummaryScreen from './screens/SummaryScreen'
import HistoryScreen from './screens/HistoryScreen'
import ProfileScreen from './screens/ProfileScreen'
import BottomNav from './components/BottomNav'
import type { NavTab } from './components/BottomNav'

type Screen = 'login' | 'register' | 'start' | 'timer' | 'summary' | 'history' | 'profile'

interface DistractionEvent {
  type: string
  label: string
  source: string | null
  windows: number
  minutes: number
}

interface SessionSummary {
  total_minutes: number | null
  real_focus_min: number | null
  focus_score: number | null
  ai_feedback: string | null
  distraction_breakdown: DistractionEvent[]
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function AppContent() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState<Screen>('login')
  const [sessionId, setSessionId] = useState('')
  const [sessionTopic, setSessionTopic] = useState('')
  const [sessionStudyMode, setSessionStudyMode] = useState('mac_pc')
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-teal-500 spin" />
          <span className="text-[11px] text-white/20 uppercase tracking-[0.1em]">Loading</span>
        </div>
      </div>
    )
  }

  // ── Auth screens (no nav) ─────────────────────────────────────────────────
  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="h-full"
        >
          {screen === 'register'
            ? <RegisterScreen onSwitchToLogin={() => setScreen('login')} />
            : <LoginScreen onSwitchToRegister={() => setScreen('register')} />
          }
        </motion.div>
      </AnimatePresence>
    )
  }

  // ── Active timer (no nav — user should not navigate away mid-session) ─────
  if (screen === 'timer' && sessionId) {
    return (
      <div className="flex h-full justify-center bg-[#0f0f0f]">
        <div className="w-full max-w-[720px]">
          <TimerScreen
            sessionId={sessionId}
            topic={sessionTopic}
            studyMode={sessionStudyMode}
            onSessionEnded={(s) => { setSummary(s); setScreen('summary') }}
          />
        </div>
      </div>
    )
  }

  // ── Main app layout with bottom nav ───────────────────────────────────────
  const navTab: NavTab =
    screen === 'history' ? 'history' :
    screen === 'profile' ? 'profile' :
    'home'

  function handleNavChange(tab: NavTab) {
    if (tab === 'home') setScreen('start')
    else setScreen(tab)
  }

  let content: React.ReactNode
  if (screen === 'summary' && summary) {
    content = (
      <SummaryScreen
        summary={summary}
        topic={sessionTopic}
        onStartNew={() => { setSummary(null); setScreen('start') }}
      />
    )
  } else if (screen === 'history') {
    content = <HistoryScreen />
  } else if (screen === 'profile') {
    content = <ProfileScreen />
  } else {
    content = (
      <StartSessionScreen
        onSessionStarted={(id, topic, mode) => {
          setSessionId(id)
          setSessionTopic(topic)
          setSessionStudyMode(mode)
          setScreen('timer')
        }}
      />
    )
  }

  return (
    <div className="flex h-full justify-center bg-[#080808]">
      {/* Centered column — content + nav stay inside max-720px at any window size */}
      <div className="w-full max-w-[720px] flex flex-col">
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="h-full"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </div>
        <BottomNav active={navTab} onChange={handleNavChange} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
