export type RatingSortOption = 'SIMILAR' | 'HIGH' | 'LOW'

export type MyRatingSort = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'

export interface RatingListItem {
  id: string
  score: number
  comment: string
  updatedAt: Date
  user: { nickname: string | null; image: string | null }
  isOwnRating: boolean
  hasReported: boolean
}

export interface MyRatingItem {
  id: string
  score: number
  comment?: string
  updatedAt: Date
  roastery: { id: string; name: string; imageUrl: string | null }
}

export interface RatingsPage {
  items: RatingListItem[]
  nextCursor: string | null
}

export interface MyRatingsPage {
  items: MyRatingItem[]
  nextCursor: string | null
}
