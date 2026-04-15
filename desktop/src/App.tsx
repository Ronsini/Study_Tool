import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import StartSessionScreen from './screens/StartSessionScreen'
import TimerScreen from './screens/TimerScreen'
import SummaryScreen from './screens/SummaryScreen'

type Screen = 'login' | 'register' | 'start' | 'timer' | 'summary'

interface SessionSummary {
  total_minutes: number
  real_focus_min: number
  focus_score: number
  ai_feedback: string
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function AppContent() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState<Screen>('login')
  const [sessionId, setSessionId] = useState('')
  const [sessionTopic, setSessionTopic] = useState('')
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  let key: string
  let content: React.ReactNode

  if (loading) {
    key = 'loading'
    content = (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-teal-500 spin" />
          <span className="text-[11px] text-white/20 uppercase tracking-[0.1em]">Loading</span>
        </div>
      </div>
    )
  } else if (!user) {
    key = screen
    content = screen === 'register'
      ? <RegisterScreen onSwitchToLogin={() => setScreen('login')} />
      : <LoginScreen onSwitchToRegister={() => setScreen('register')} />
  } else if (screen === 'timer' && sessionId) {
    key = 'timer'
    content = (
      <TimerScreen
        sessionId={sessionId}
        topic={sessionTopic}
        onSessionEnded={(s) => { setSummary(s); setScreen('summary') }}
      />
    )
  } else if (screen === 'summary' && summary) {
    key = 'summary'
    content = (
      <SummaryScreen
        summary={summary}
        topic={sessionTopic}
        onStartNew={() => { setSummary(null); setScreen('start') }}
      />
    )
  } else {
    key = 'start'
    content = (
      <StartSessionScreen
        onSessionStarted={(id, topic) => {
          setSessionId(id)
          setSessionTopic(topic)
          setScreen('timer')
        }}
      />
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="h-full"
      >
        {content}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
