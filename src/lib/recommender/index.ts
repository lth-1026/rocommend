import { getUserRatingCount, getStoredRecommendations } from '@/lib/queries/recommendation'
import { getPopularFallback } from './popular'
import type { RecommendationResult } from './types'

export type { RecommendationResult, RecommendationItem } from './types'
export { computeAndSaveCF } from './item-cf'

export async function getRecommendations(userId: string): Promise<RecommendationResult> {
  const ratingCount = await getUserRatingCount(userId)

  if (ratingCount < 3) {
    return getPopularFallback(userId)
  }

  const stored = await getStoredRecommendations(userId)

  if (stored.length === 0) {
    // Recommendation 테이블 비어있음 (배치 실패 케이스) → 인기 폴백
    return getPopularFallback(userId)
  }

  // new: 유저가 평가하지 않은 로스터리, cfScore 내림차순 상위 5개
  const newItems = stored
    .filter((r) => r.userRating === undefined)
    .sort((a, b) => b.cfScore - a.cfScore)
    .slice(0, 8)
    .map(({ roastery, cfScore }) => ({ roastery, cfScore }))

  // repeat: 유저가 평가한 로스터리 중 CF >= 4.0 AND 내 평점 >= 4, 상위 8개
  const repeatItems = stored
    .filter((r) => r.userRating !== undefined && r.cfScore >= 4.0 && r.userRating >= 4)
    .sort((a, b) => b.cfScore - a.cfScore)
    .slice(0, 8)
    .map(({ roastery, cfScore, userRating }) => ({ roastery, cfScore, userRating }))

  if (newItems.length === 0 && repeatItems.length === 0) {
    return getPopularFallback(userId)
  }

  return { source: 'cf', newItems, repeatItems }
}
