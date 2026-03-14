import type { RoasteryWithStats } from '@/types/roastery'

export interface RecommendationItem {
  roastery: RoasteryWithStats
  cfScore: number
  userRating?: number
}

export interface RecommendationResult {
  source: 'cf' | 'fallback'
  newItems: RecommendationItem[]
  repeatItems: RecommendationItem[]
}

export interface RawRating {
  userId: string
  roasteryId: string
  score: number
}
