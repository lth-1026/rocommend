import { getPopularRoasteries } from '@/lib/queries/recommendation'
import type { RecommendationResult } from './types'
import type { PriceRange } from '@/types/roastery'

export async function getPopularFallback(
  userId?: string,
  preferredPriceRanges?: PriceRange[]
): Promise<RecommendationResult> {
  const roasteries = await getPopularRoasteries(userId, preferredPriceRanges)

  return {
    source: 'fallback',
    newItems: roasteries.map((roastery) => ({ roastery, cfScore: roastery.avgRating ?? 0 })),
    repeatItems: [],
  }
}
