import { RoasteryCard } from '@/components/roastery/RoasteryCard'
import type { RecommendationItem } from '@/lib/recommender'

interface RecommendSectionProps {
  title: string
  items: RecommendationItem[]
  onCardClick?: (roasteryId: string) => void
}

export function RecommendSection({ title, items, onCardClick }: RecommendSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={item.roastery.id} onClick={() => onCardClick?.(item.roastery.id)}>
            <RoasteryCard roastery={item.roastery} priority={i === 0} />
          </div>
        ))}
      </div>
    </section>
  )
}
