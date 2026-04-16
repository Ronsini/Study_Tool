import { useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'

// /colorize: green only, teal removed
// /animate: mandatory press feedback on every button

interface Props {
  onSwitchToLogin: () => void
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const INPUT = 'bg-[#1c1c1c] border border-[#2a2a2a] hover:border-[#3a3a3a] focus:border-[#22c55e] rounded-xl px-3.5 py-2.5 text-[14px] text-[#f0f0f0] placeholder-white/25 transition-colors duration-150 outline-none w-full'

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
    <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0a] px-6">
      <div className="w-full max-w-[320px]">

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="mb-10"
        >
          {/* Logomark — green */}
          <div className="w-7 h-7 rounded-lg bg-[#16a34a] mb-8 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="7" width="3" height="6" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="5.5" y="4" width="3" height="9" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="10" y="1" width="3" height="12" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f0] tracking-[-0.03em] leading-tight">
            Create account
          </h1>
          <p className="text-[13px] text-white/60 mt-1.5">
            Track real focus time, not just time logged
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.06, ease: EASE }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-white/35 uppercase tracking-[0.09em]">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" className={INPUT} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-white/35 uppercase tracking-[0.09em]">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@university.edu" className={INPUT} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-white/35 uppercase tracking-[0.09em]">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="At least 8 characters" className={INPUT} />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[12px] text-red-400/80 leading-snug"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.975 }}
            transition={{ duration: 0.1, ease: EASE }}
            className="mt-1 bg-[#f97316] hover:bg-[#fb923c] active:bg-[#ea6d0e] disabled:opacity-40 text-white text-[14px] font-semibold py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </motion.button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.16, ease: EASE }}
          className="text-center text-[13px] text-white/25 mt-8"
        >
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#22c55e] hover:text-[#4ade80] transition-colors duration-150 cursor-pointer"
          >
            Sign in
          </button>
        </motion.p>
      </div>
    </div>
  )
}
