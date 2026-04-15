import { useState } from 'react'
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

function AppContent() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState<Screen>('login')
  const [sessionId, setSessionId] = useState('')
  const [sessionTopic, setSessionTopic] = useState('')
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f0f0f]">
        <div className="text-white/20 text-sm">Loading...</div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    if (screen === 'register') {
      return <RegisterScreen onSwitchToLogin={() => setScreen('login')} />
    }
    return <LoginScreen onSwitchToRegister={() => setScreen('register')} />
  }

  // Logged in — session flow
  if (screen === 'timer' && sessionId) {
    return (
      <TimerScreen
        sessionId={sessionId}
        topic={sessionTopic}
        onSessionEnded={(s) => { setSummary(s); setScreen('summary') }}
      />
    )
  }

  if (screen === 'summary' && summary) {
    return (
      <SummaryScreen
        summary={summary}
        topic={sessionTopic}
        onStartNew={() => { setSummary(null); setScreen('start') }}
      />
    )
  }

  return (
    <StartSessionScreen
      onSessionStarted={(id, topic) => {
        setSessionId(id)
        setSessionTopic(topic)
        setScreen('timer')
      }}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
