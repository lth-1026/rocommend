import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BeanList } from './BeanList'
import { RatingDisplay } from './RatingDisplay'
import { BackButton } from './BackButton'
import { WebsiteLink } from './WebsiteLink'
import { RatingButton } from '@/components/rating/RatingButton'
import { BookmarkButton } from '@/components/bookmark/BookmarkButton'
import type { RoasteryDetail as RoasteryDetailType } from '@/types/roastery'
import { PRICE_RANGE_LABELS, getRegions, getCharacteristicTags } from '@/types/roastery'

interface RoasteryDetailProps {
  roastery: RoasteryDetailType
  isLoggedIn: boolean
  userRating?: { score: number; comment?: string }
  isBookmarked: boolean
}

export function RoasteryDetail({
  roastery,
  isLoggedIn,
  userRating,
  isBookmarked,
}: RoasteryDetailProps) {
  const regions = getRegions(roastery.tags)
  const charTags = getCharacteristicTags(roastery.tags)

  return (
    <div className="flex flex-col gap-8">
      <BackButton />

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
            unoptimized={roastery.imageUrl.startsWith('/')}
          />
        </div>
      )}

      {/* 기본 정보 */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{roastery.name}</h1>
          {regions.length > 0 && (
            <p className="text-sm text-muted-foreground">{regions[0]}</p>
          )}
          {roastery.description && (
            <p className="text-sm text-foreground leading-relaxed max-w-prose">
              {roastery.description}
            </p>
          )}
          {charTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {charTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{PRICE_RANGE_LABELS[roastery.priceRange]}</Badge>
            {roastery.decaf && <Badge variant="secondary">디카페인</Badge>}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <RatingDisplay
              avgRating={roastery.avgRating}
              ratingCount={roastery.ratingCount}
              size="lg"
            />
          </div>
          {/* 주 CTA: 평가하기 + 보조: 즐겨찾기 */}
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <RatingButton
                roasteryId={roastery.id}
                roasteryName={roastery.name}
                isLoggedIn={isLoggedIn}
                existingScore={userRating?.score}
                existingComment={userRating?.comment}
              />
              <BookmarkButton roasteryId={roastery.id} initialIsBookmarked={isBookmarked} />
            </div>
          )}
          {!isLoggedIn && (
            <RatingButton
              roasteryId={roastery.id}
              roasteryName={roastery.name}
              isLoggedIn={false}
            />
          )}
          {roastery.website && <WebsiteLink href={roastery.website} roasteryId={roastery.id} />}
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
