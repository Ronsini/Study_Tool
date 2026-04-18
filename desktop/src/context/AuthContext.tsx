import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  email: string
  name: string
  subscription: string
  daily_goal_min: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount, check if a token is already stored and fetch the user
    api.users.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const data = await api.auth.login(email, password)
    await window.electron.store.set('access_token', data.access_token)
    await window.electron.store.set('refresh_token', data.refresh_token)
    const me = await api.users.me()
    setUser(me)
  }

  async function register(email: string, name: string, password: string) {
    const data = await api.auth.register(email, name, password)
    await window.electron.store.set('access_token', data.access_token)
    await window.electron.store.set('refresh_token', data.refresh_token)
    const me = await api.users.me()
    setUser(me)
  }

  async function logout() {
    await window.electron.store.delete('access_token')
    await window.electron.store.delete('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
