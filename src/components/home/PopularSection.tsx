import { RoasteryCard } from '@/components/roastery/RoasteryCard'
import { ScrollRow, ScrollItem } from './ScrollRow'
import type { RoasteryWithStats } from '@/types/roastery'

interface PopularSectionProps {
  title?: string
  items: RoasteryWithStats[]
  onCardClick?: (roasteryId: string) => void
}

export function PopularSection({
  title = '실시간 인기 로스터리',
  items,
  onCardClick,
}: PopularSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="page-wrapper text-base font-semibold">{title}</h2>
      <ScrollRow>
        {items.map((roastery, i) => (
          <ScrollItem key={roastery.id}>
            <div onClick={() => onCardClick?.(roastery.id)}>
              <RoasteryCard roastery={roastery} priority={i === 0} />
            </div>
          </ScrollItem>
        ))}
      </ScrollRow>
    </section>
  )
}
