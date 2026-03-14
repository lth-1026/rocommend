import Link from 'next/link'
import Image from 'next/image'
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
    <Link
      href={`/roasteries/${roastery.id}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <div className="group flex flex-col gap-2">
        {/* 정사각형 이미지 */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
          {roastery.imageUrl ? (
            <Image
              src={roastery.imageUrl}
              alt={roastery.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" x2="6" y1="2" y2="4" />
                <line x1="10" x2="10" y1="2" y2="4" />
                <line x1="14" x2="14" y1="2" y2="4" />
              </svg>
            </div>
          )}
        </div>

        {/* 텍스트 정보 */}
        <div className="flex flex-col gap-1 px-0.5">
          <p className="font-medium leading-tight line-clamp-1">{roastery.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {roastery.regions.length > 0 && (
              <RegionDisplay regions={roastery.regions} activeRegions={activeRegions} />
            )}
            {roastery.regions.length > 0 && ' · '}
            {PRICE_RANGE_LABELS[roastery.priceRange]}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              <RatingDisplay avgRating={roastery.avgRating} ratingCount={roastery.ratingCount} />
            </span>
            {roastery.decaf && (
              <Badge variant="secondary" className="text-xs py-0">
                디카페인
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
