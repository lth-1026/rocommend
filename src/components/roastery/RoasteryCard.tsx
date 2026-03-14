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
      <div className="group flex flex-row items-start gap-3 rounded-xl p-2 hover:bg-muted/50 transition-colors">
        {/* 정사각형 이미지 — 텍스트 블록과 동일 크기 */}
        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          {roastery.imageUrl ? (
            <Image
              src={roastery.imageUrl}
              alt={roastery.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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

        {/* 텍스트 — 이미지와 같은 높이(h-16)에 맞춰 배치 */}
        <div className="flex flex-col justify-between h-16 min-w-0">
          <p className="font-medium text-sm leading-tight line-clamp-1">{roastery.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {roastery.regions.length > 0 && (
              <RegionDisplay regions={roastery.regions} activeRegions={activeRegions} />
            )}
            {roastery.regions.length > 0 && ' · '}
            {PRICE_RANGE_LABELS[roastery.priceRange]}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs">
              <RatingDisplay avgRating={roastery.avgRating} ratingCount={roastery.ratingCount} />
            </span>
            {roastery.decaf && (
              <Badge variant="secondary" className="text-xs py-0 px-1.5">
                디카페인
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
