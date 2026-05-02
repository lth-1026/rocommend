'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPRING_SNAPPY, TAP_SCALE } from '@/lib/motion'

interface StarSelectorProps {
  value: number
  onChange: (score: number) => void
}

const LABELS: Record<number, string> = {
  1: '별로예요',
  2: '그저 그래요',
  3: '괜찮아요',
  4: '좋아요',
  5: '최고예요',
}

export function StarSelector({ value, onChange }: StarSelectorProps) {
  const [hovered, setHovered] = useState(0)

  const active = hovered || value

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            aria-label={`${star}점`}
            className="text-3xl leading-none focus-visible:outline-none"
            whileHover={{ scale: 1.3 }}
            whileTap={TAP_SCALE}
            transition={SPRING_SNAPPY}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            <motion.span
              animate={{ scale: star === value ? [1, 1.45, 1] : 1 }}
              transition={{
                duration: 0.38,
                ease: ['easeOut', 'easeIn'],
                times: [0, 0.4, 1],
              }}
              className={star <= active ? 'text-accent' : 'text-muted'}
              style={{ display: 'inline-block' }}
            >
              ★
            </motion.span>
          </motion.button>
        ))}
      </div>

      <div className="h-5 flex items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SPRING_SNAPPY}
            className="text-sm text-muted-foreground"
          >
            {active > 0 ? LABELS[active] : '별점을 선택하세요'}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
