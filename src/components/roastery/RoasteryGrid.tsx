'use client'

import { motion } from 'framer-motion'
import { RoasteryCard } from './RoasteryCard'
import type { RoasteryWithStats } from '@/types/roastery'
import { staggerContainerVariants, fadeUpVariants } from '@/lib/motion'

interface RoasteryGridProps {
  roasteries: RoasteryWithStats[]
  activeRegions?: string[]
}

export function RoasteryGrid({ roasteries, activeRegions }: RoasteryGridProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {roasteries.map((roastery, i) => (
        <motion.div key={roastery.id} variants={fadeUpVariants}>
          <RoasteryCard
            roastery={roastery}
            priority={i < 4}
            activeRegions={activeRegions}
            variant="landscape"
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
