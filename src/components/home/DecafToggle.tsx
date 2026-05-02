'use client'

import { motion } from 'framer-motion'
import { SPRING_SNAPPY, TAP_SCALE } from '@/lib/motion'

interface DecafToggleProps {
  decafOn: boolean
  onToggle: () => void
}

export function DecafToggle({ decafOn, onToggle }: DecafToggleProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={decafOn}
      onClick={onToggle}
      whileTap={TAP_SCALE}
      transition={SPRING_SNAPPY}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
        decafOn
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:bg-muted'
      }`}
    >
      디카페인만 보기
    </motion.button>
  )
}
