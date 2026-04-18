import { motion } from 'motion/react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function SettingsScreen() {
  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE }}
        className="shrink-0 px-6 pt-8 pb-6 border-b border-[#1e1e1e]"
      >
        <p className="text-[11px] text-white/25 uppercase tracking-[0.12em] mb-3 font-medium">Study Tool</p>
        <h1 className="text-[42px] font-bold text-[#f0f0f0] tracking-[-0.04em] leading-[1.05]">
          Settings
        </h1>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.06, ease: EASE }}
        className="flex-1 overflow-y-auto px-6 pt-8"
      >
        <p className="text-[14px] text-white/30">Coming soon.</p>
      </motion.div>
    </div>
  )
}
