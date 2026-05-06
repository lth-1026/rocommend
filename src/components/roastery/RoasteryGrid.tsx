'use client'

import { motion } from 'framer-motion'
import { RoasteryCard } from './RoasteryCard'
import type { RoasteryWithStats } from '@/types/roastery'
import { staggerContainerVariants, fadeUpVariants } from '@/lib/motion'

interface RoasteryGridProps {
  roasteries: RoasteryWithStats[]
  activeRegions?: string[]
  variant?: 'portrait' | 'landscape'
  onCardClick?: (id: string) => void
}

export function RoasteryGrid({
  roasteries,
  activeRegions,
  variant = 'landscape',
  onCardClick,
}: RoasteryGridProps) {
  const gridClass =
    variant === 'portrait'
      ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={gridClass}
    >
      {roasteries.map((roastery, i) => (
        <motion.div key={roastery.id} variants={fadeUpVariants}>
          <RoasteryCard
            roastery={roastery}
            priority={i < 4}
            activeRegions={activeRegions}
            variant={variant}
            onCardClick={onCardClick}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
