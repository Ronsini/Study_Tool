import { useState } from 'react'
import { motion } from 'motion/react'
import { api } from '../lib/api'

interface Props {
  checkinId: string
  question: string
  onDismiss: () => void
}

const SPRING = { type: 'spring' as const, stiffness: 380, damping: 34 }

export default function CheckInOverlay({ checkinId, question, onDismiss }: Props) {
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim()) return
    setLoading(true)
    try {
      const result = await api.checkins.answer(checkinId, answer.trim())
      setFeedback(result.feedback)
      setIsCorrect(result.is_correct)
    } catch {
      setFeedback('Could not evaluate your answer. Keep going!')
      setIsCorrect(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={SPRING}
        className="w-full max-w-md bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-6 flex flex-col gap-5 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-medium text-teal-400/70 uppercase tracking-[0.1em] mb-2">
              Check-in
            </p>
            <p className="text-[15px] text-white/90 leading-relaxed font-medium tracking-[-0.01em]">
              {question}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/20 hover:text-white/50 transition-colors duration-150 shrink-0 mt-0.5 text-lg leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {!feedback ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Write your answer…"
              rows={3}
              className="bg-[#1c1c1c] border border-[#303030] hover:border-[#3e3e3e] focus:border-teal-500 rounded-xl px-4 py-3 text-[14px] text-white placeholder-white/30 resize-none transition-colors duration-150 leading-relaxed"
            />
            <div className="flex gap-2">
              <motion.button
                type="submit"
                disabled={loading || !answer.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1 }}
                className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-35 text-white text-[13px] font-semibold py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
              >
                {loading ? 'Checking…' : 'Submit'}
              </motion.button>
              <motion.button
                type="button"
                onClick={onDismiss}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1 }}
                className="px-4 py-2.5 text-[13px] text-white/35 hover:text-white/55 transition-colors duration-150 cursor-pointer"
              >
                Skip
              </motion.button>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3"
          >
            <div
              className={`p-4 rounded-xl text-[13px] leading-relaxed border ${
                isCorrect === true
                  ? 'bg-teal-500/[0.08] border-teal-500/25 text-teal-300/90'
                  : isCorrect === false
                  ? 'bg-amber-500/[0.08] border-amber-500/25 text-amber-300/90'
                  : 'bg-white/[0.05] border-white/[0.08] text-white/70'
              }`}
            >
              {feedback}
            </div>
            <motion.button
              onClick={onDismiss}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.975 }}
              transition={{ duration: 0.1 }}
              className="w-full py-2.5 bg-[#222222] hover:bg-[#2a2a2a] border border-[#343434] text-white/70 text-[13px] font-medium rounded-xl transition-all duration-150 cursor-pointer"
            >
              Back to studying
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
