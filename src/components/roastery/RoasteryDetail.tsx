import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { RatingDisplay } from './RatingDisplay'
import { BackButton } from './BackButton'
import { RoasteryBuyAndBeans } from './RoasteryBuyAndBeans'
import { RatingButton } from '@/components/rating/RatingButton'
import { BookmarkButton } from '@/components/bookmark/BookmarkButton'
import { RatingList } from '@/components/rating/RatingList'
import type { RoasteryDetail as RoasteryDetailType } from '@/types/roastery'
import { PRICE_RANGE_LABELS, getRegions, getCharacteristicTags } from '@/types/roastery'
import type { RatingListItem, RatingSortOption } from '@/types/rating'

interface RoasteryDetailProps {
  roastery: RoasteryDetailType
  isLoggedIn: boolean
  userRating?: { score: number; comment?: string }
  isBookmarked: boolean
  initialRatings: RatingListItem[]
  initialNextCursor: string | null
  initialSort: RatingSortOption
}

export function RoasteryDetail({
  roastery,
  isLoggedIn,
  userRating,
  isBookmarked,
  initialRatings,
  initialNextCursor,
  initialSort,
}: RoasteryDetailProps) {
  const regions = getRegions(roastery.tags)
  const charTags = getCharacteristicTags(roastery.tags)

  return (
    <div className="flex flex-col gap-8">
      <BackButton />

      {/* 기본 정보 */}
      <div className="flex flex-col gap-2">
        {/* 이미지 + 이름 행 */}
        <div className="flex gap-4 items-start">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            {roastery.imageUrl && (
              <Image
                src={roastery.imageUrl}
                alt={roastery.name}
                fill
                className="object-cover"
                priority
                sizes="80px"
                unoptimized={roastery.imageUrl.startsWith('/')}
              />
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold leading-tight">{roastery.name}</h1>
                {roastery.closedAt && (
                  <Badge
                    variant="outline"
                    className="text-xs text-amber-700 border-amber-300 bg-amber-50"
                  >
                    폐업
                  </Badge>
                )}
              </div>
              {isLoggedIn && (
                <BookmarkButton roasteryId={roastery.id} initialIsBookmarked={isBookmarked} />
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <RatingDisplay
                  avgRating={roastery.avgRating}
                  ratingCount={roastery.ratingCount}
                  size="lg"
                />
              </div>
              <RatingButton
                roasteryId={roastery.id}
                roasteryName={roastery.name}
                isLoggedIn={isLoggedIn}
                existingScore={userRating?.score}
                existingComment={userRating?.comment}
              />
            </div>
          </div>
        </div>

        {/* 지역 + 주소 */}
        <div className="flex flex-col gap-0.5">
          {regions.length > 0 && <p className="text-sm text-muted-foreground">{regions[0]}</p>}
          {roastery.locations[0]?.address && (
            <p className="text-xs text-muted-foreground/70">{roastery.locations[0].address}</p>
          )}
        </div>

        {/* 설명 */}
        {roastery.description && (
          <p className="text-sm text-foreground leading-relaxed max-w-prose">
            {roastery.description}
          </p>
        )}

        {/* 가격 뱃지 + 디카페인 + 특성 태그 통합 */}
        {(charTags.length > 0 || roastery.decaf || roastery.priceRange) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="outline">{PRICE_RANGE_LABELS[roastery.priceRange]}</Badge>
            {roastery.decaf && <Badge variant="secondary">디카페인</Badge>}
            {charTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 구매하기 + 원두 라인업 */}
      <RoasteryBuyAndBeans
        roasteryId={roastery.id}
        baseChannels={roastery.channels}
        beans={roastery.beans}
      />

      {/* 한줄평 목록 */}
      <RatingList
        roasteryId={roastery.id}
        initialItems={initialRatings}
        initialNextCursor={initialNextCursor}
        initialSort={initialSort}
        isLoggedIn={isLoggedIn}
      />
    </div>
  )
}
