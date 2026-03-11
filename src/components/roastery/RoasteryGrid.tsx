import { RoasteryCard } from './RoasteryCard'
import type { RoasteryWithStats } from '@/types/roastery'

interface RoasteryGridProps {
  roasteries: RoasteryWithStats[]
}

export function RoasteryGrid({ roasteries }: RoasteryGridProps) {
  if (roasteries.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        등록된 로스터리가 없습니다.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {roasteries.map((roastery, i) => (
        <RoasteryCard key={roastery.id} roastery={roastery} priority={i < 4} />
      ))}
    </div>
  )
}
