import type { RoasteryWithStats } from './roastery'

export interface BookmarkWithRoastery {
  id: string
  roasteryId: string
  roastery: RoasteryWithStats
  myRating: number | null
}

export type BookmarkSort = 'name' | 'myRating'
