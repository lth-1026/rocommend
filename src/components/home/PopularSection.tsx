import { RoasteryCard } from '@/components/roastery/RoasteryCard'
import type { RoasteryWithStats } from '@/types/roastery'

interface PopularSectionProps {
  items: RoasteryWithStats[]
  onCardClick?: (roasteryId: string) => void
}

export function PopularSection({ items, onCardClick }: PopularSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">실시간 인기 로스터리</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((roastery, i) => (
          <div key={roastery.id} onClick={() => onCardClick?.(roastery.id)}>
            <RoasteryCard roastery={roastery} priority={i === 0} />
          </div>
        ))}
      </div>
    </section>
  )
}
