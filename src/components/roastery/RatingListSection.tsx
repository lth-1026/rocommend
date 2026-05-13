import { getRoasteryRatings } from '@/lib/queries/rating'
import { RatingList } from '@/components/rating/RatingList'

interface RatingListSectionProps {
  roasteryId: string
  userId: string | undefined
  ratingCount: number
  isLoggedIn: boolean
}

export async function RatingListSection({
  roasteryId,
  userId,
  ratingCount,
  isLoggedIn,
}: RatingListSectionProps) {
  // 평가 3개 미만이면 유사도 계산 불가 → HIGH fallback
  const initialSort = userId && ratingCount >= 3 ? 'SIMILAR' : 'HIGH'

  const initialRatings = await getRoasteryRatings({
    roasteryId,
    sort: initialSort,
    currentUserId: userId,
  })

  return (
    <RatingList
      roasteryId={roasteryId}
      initialItems={initialRatings.items}
      initialNextCursor={initialRatings.nextCursor}
      initialSort={initialSort}
      isLoggedIn={isLoggedIn}
    />
  )
}
