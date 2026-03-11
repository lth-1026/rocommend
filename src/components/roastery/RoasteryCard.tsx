import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RegionDisplay } from './RegionDisplay'
import { RatingDisplay } from './RatingDisplay'
import type { RoasteryWithStats } from '@/types/roastery'
import { PRICE_RANGE_LABELS } from '@/types/roastery'

interface RoasteryCardProps {
  roastery: RoasteryWithStats
  priority?: boolean
  activeRegions?: string[]
}

export function RoasteryCard({ roastery, priority = false, activeRegions }: RoasteryCardProps) {
  return (
    <Link href={`/roasteries/${roastery.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className="hover:ring-foreground/20 transition-shadow h-full">
        {roastery.imageUrl && (
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={roastery.imageUrl}
              alt={roastery.name}
              fill
              priority={priority}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{roastery.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{PRICE_RANGE_LABELS[roastery.priceRange]}</Badge>
            {roastery.decaf && <Badge variant="secondary">디카페인</Badge>}
            {roastery.regions.length > 0 && (
              <span className="text-sm text-muted-foreground">
                <RegionDisplay regions={roastery.regions} activeRegions={activeRegions} />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <RatingDisplay avgRating={roastery.avgRating} ratingCount={roastery.ratingCount} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
