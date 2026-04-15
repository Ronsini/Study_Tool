import { useState } from 'react'
import { api } from '../lib/api'

interface Props {
  checkinId: string
  question: string
  onDismiss: () => void
}

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
      setFeedback('Could not evaluate answer. Keep going!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Quick check-in</p>
            <p className="text-white text-base leading-relaxed">{question}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/20 hover:text-white/60 text-xl transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {!feedback ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              rows={3}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-violet-500 resize-none transition-colors"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !answer.trim()}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {loading ? 'Checking...' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 text-sm rounded-lg transition-colors"
              >
                Skip
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <div className={`p-4 rounded-lg text-sm leading-relaxed ${
              isCorrect
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
            }`}>
              {feedback}
            </div>
            <button
              onClick={onDismiss}
              className="bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Back to studying
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
