'use client'

import type { MouseEvent } from 'react'
import { RoasteryCard } from './RoasteryCard'
import type { RoasteryWithStats } from '@/types/roastery'

interface RoasteryGridProps {
  roasteries: RoasteryWithStats[]
  activeRegions?: string[]
  variant?: 'portrait' | 'landscape'
  onCardClick?: (id: string, e: MouseEvent<HTMLAnchorElement>) => void
  singleCol?: boolean
}

export function RoasteryGrid({
  roasteries,
  activeRegions,
  variant = 'landscape',
  onCardClick,
  singleCol,
}: RoasteryGridProps) {
  const gridClass = singleCol
    ? 'grid grid-cols-1 gap-4'
    : variant === 'portrait'
      ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <div className={gridClass}>
      {roasteries.map((roastery, i) => (
        <div
          key={roastery.id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
        >
          <RoasteryCard
            roastery={roastery}
            priority={i < 4}
            activeRegions={activeRegions}
            variant={variant}
            onCardClick={onCardClick}
          />
        </div>
      ))}
    </div>
  )
}
