import { RoasteryCard } from '@/components/roastery/RoasteryCard'
import { ScrollRow, ScrollItem } from './ScrollRow'
import type { RecommendationItem } from '@/lib/recommender'

interface RecommendSectionProps {
  title: string
  items: RecommendationItem[]
  onCardClick?: (roasteryId: string) => void
}

export function RecommendSection({ title, items, onCardClick }: RecommendSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="page-wrapper text-base font-semibold">{title}</h2>
      <ScrollRow>
        {items.map((item, i) => (
          <ScrollItem key={item.roastery.id}>
            <div onClick={() => onCardClick?.(item.roastery.id)}>
              <RoasteryCard roastery={item.roastery} priority={i === 0} />
            </div>
          </ScrollItem>
        ))}
      </ScrollRow>
    </section>
  )
}
