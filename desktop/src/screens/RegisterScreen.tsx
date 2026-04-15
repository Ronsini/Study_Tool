import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface Props {
  onSwitchToLogin: () => void
}

export default function RegisterScreen({ onSwitchToLogin }: Props) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, name, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0f0f0f]">
      <div className="w-full max-w-sm px-8 py-10 bg-[#1a1a1a] rounded-2xl border border-white/10">
        <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
        <p className="text-sm text-white/40 mb-8">Start studying smarter</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-violet-500 transition-colors"
              placeholder="Your name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-violet-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-violet-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 mt-6">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
