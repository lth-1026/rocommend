import type { PriceRange } from '@prisma/client'

export type { PriceRange }

export interface RoasteryWithStats {
  id: string
  name: string
  description: string | null
  regions: string[]
  priceRange: PriceRange
  decaf: boolean
  imageUrl: string | null
  website: string | null
  avgRating: number | null
  ratingCount: number
}

export interface BeanWithDetails {
  id: string
  name: string
  origins: string[]
  roastingLevel: string
  decaf: boolean
  cupNotes: string[]
  imageUrl: string | null
}

export interface RoasteryDetail extends RoasteryWithStats {
  beans: BeanWithDetails[]
}

export const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  LOW: '2만원 미만',
  MID: '2~3.5만원',
  HIGH: '3.5만원 이상',
}

export const ROASTING_LEVEL_LABELS: Record<string, string> = {
  LIGHT: '라이트',
  MEDIUM: '미디엄',
  MEDIUM_DARK: '미디엄 다크',
  DARK: '다크',
}

export type SortOption = 'name' | 'popular'

// 대한민국 17개 광역자치단체 (2글자 약어)
export const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
] as const

export type Region = (typeof REGIONS)[number]

export interface FilterParams {
  q: string
  price: PriceRange[]
  decaf: boolean
  regions: string[]
}
