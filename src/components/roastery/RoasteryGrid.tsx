import { RoasteryCard } from './RoasteryCard'
import type { RoasteryWithStats } from '@/types/roastery'

interface RoasteryGridProps {
  roasteries: RoasteryWithStats[]
  activeRegions?: string[]
}

export function RoasteryGrid({ roasteries, activeRegions }: RoasteryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {roasteries.map((roastery, i) => (
        <RoasteryCard
          key={roastery.id}
          roastery={roastery}
          priority={i < 4}
          activeRegions={activeRegions}
        />
      ))}
    </div>
  )
}
