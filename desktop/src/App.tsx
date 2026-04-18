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
import SettingsScreen from './screens/SettingsScreen'
import AppSidebar from './components/AppSidebar'
import type { NavTab } from './components/AppSidebar'

type Screen = 'login' | 'register' | 'start' | 'timer' | 'summary' | 'history' | 'profile' | 'settings'

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
          <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#22c55e] spin" />
          <span className="text-[11px] text-white/20 uppercase tracking-[0.1em]">Loading</span>
        </div>
      </div>
    )
  }

  // ── Auth screens (full-width, no sidebar) ─────────────────────────────────
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
      <div className="h-full bg-[#0f0f0f]">
        <TimerScreen
          sessionId={sessionId}
          topic={sessionTopic}
          studyMode={sessionStudyMode}
          onSessionEnded={(s) => { setSummary(s); setScreen('summary') }}
        />
      </div>
    )
  }

  // ── Main app — sidebar + content ──────────────────────────────────────────
  const navTab: NavTab =
    screen === 'history'  ? 'history'     :
    screen === 'profile'  ? 'profile'     :
    screen === 'settings' ? 'settings'    :
    screen === 'summary'  ? 'home'        :
    screen === 'start'    ? 'new-session' :
    'home'

  function handleNavChange(tab: NavTab) {
    if (tab === 'home' || tab === 'new-session') setScreen('start')
    else setScreen(tab as Screen)
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
  } else if (screen === 'settings') {
    content = <SettingsScreen />
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
    <div className="flex h-full bg-[#0a0a0a]">
      {/* Left sidebar */}
      <AppSidebar active={navTab} onChange={handleNavChange} />

      {/* Content area */}
      <div className="flex-1 min-w-0 overflow-hidden">
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
