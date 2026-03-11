import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BeanList } from './BeanList'
import { RatingDisplay } from './RatingDisplay'
import type { RoasteryDetail as RoasteryDetailType } from '@/types/roastery'
import { PRICE_RANGE_LABELS } from '@/types/roastery'

interface RoasteryDetailProps {
  roastery: RoasteryDetailType
}

export function RoasteryDetail({ roastery }: RoasteryDetailProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* 헤더 이미지 */}
      {roastery.imageUrl && (
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
          <Image
            src={roastery.imageUrl}
            alt={roastery.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1440px) 90vw, 1300px"
          />
        </div>
      )}

      {/* 기본 정보 */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{roastery.name}</h1>
          {roastery.regions.length > 0 && (
            <p className="text-sm text-muted-foreground">{roastery.regions[0]}</p>
          )}
          {roastery.description && (
            <p className="text-sm text-foreground leading-relaxed max-w-prose">
              {roastery.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{PRICE_RANGE_LABELS[roastery.priceRange]}</Badge>
            {roastery.decaf && <Badge variant="secondary">디카페인</Badge>}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <RatingDisplay avgRating={roastery.avgRating} ratingCount={roastery.ratingCount} size="lg" />
          </div>
          {roastery.website && (
            <Link
              href={roastery.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-info underline-offset-4 hover:underline"
            >
              웹사이트 방문
            </Link>
          )}
        </div>
      </div>

      <Separator />

      {/* 원두 목록 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">원두 라인업 ({roastery.beans.length})</h2>
        <BeanList beans={roastery.beans} />
      </section>
    </div>
  )
}
