import { useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'

interface Props {
  onSwitchToLogin: () => void
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

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

  const inputClass =
    'bg-[#1c1c1c] border border-[#303030] hover:border-[#3e3e3e] focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-[14px] text-white placeholder-white/30 transition-colors duration-150'

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0a] px-6">
      <div className="w-full max-w-[340px]">

        {/* Brand + headline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mb-9"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-600 mb-7 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="7" width="3" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="5.5" y="4" width="3" height="9" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="10" y="1" width="3" height="12" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="text-[21px] font-semibold text-white tracking-[-0.025em] leading-tight">
            Create account
          </h1>
          <p className="text-[13px] text-white/35 mt-1.5 leading-relaxed">
            Track real focus time, not just time logged
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06, ease: EASE }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-white/35 uppercase tracking-[0.08em]">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Your name"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-white/35 uppercase tracking-[0.08em]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-white/35 uppercase tracking-[0.08em]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[13px] text-red-400/80 leading-snug"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.975 }}
            transition={{ duration: 0.12 }}
            className="mt-1 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:opacity-40 text-white text-[14px] font-semibold py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </motion.button>
        </motion.form>

        {/* Switch */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15, ease: EASE }}
          className="text-center text-[13px] text-white/25 mt-7"
        >
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-teal-400 hover:text-teal-300 transition-colors duration-150"
          >
            Sign in
          </button>
        </motion.p>
      </div>
    </div>
  )
}
