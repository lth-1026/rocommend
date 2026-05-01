import type { PriceRange, TagCategory } from '@prisma/client'

export type { PriceRange, TagCategory }

export interface TagItem {
  id: string
  name: string
  category: TagCategory
  isPrimary: boolean
}

/** Prisma RoasteryTag include 결과를 TagItem[]로 변환 (대표 지역 먼저) */
export function flattenTags(
  rawTags: { isPrimary: boolean; tag: { id: string; name: string; category: TagCategory } }[]
): TagItem[] {
  return rawTags
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
    .map(({ isPrimary, tag }) => ({ ...tag, isPrimary }))
}

export interface RoasteryWithStats {
  id: string
  name: string
  description: string | null
  tags: TagItem[]
  priceRange: PriceRange
  decaf: boolean
  imageUrl: string | null
  website: string | null // deprecated — 채널 마이그레이션 완료 후 제거
  avgRating: number | null
  ratingCount: number
}

/** 채널 정의 상수 — 어드민 UI 등에서 재사용 */
export const CHANNEL_DEFS = [
  { key: 'naver', label: '네이버 스마트스토어' },
  { key: 'website', label: '자사몰' },
  { key: 'cm29', label: '29cm' },
  { key: 'unspecialty', label: '언스페셜티' },
  { key: 'homebaristar', label: '홈바리스타' },
] as const

export type ChannelKey = (typeof CHANNEL_DEFS)[number]['key']

export interface ChannelWithPrice {
  channelId: string
  channelKey: string
  label: string
  url: string
  price: number | null // null = 가격 없이 링크만 (언스페셜티 등)
  order: number
  sizeGrams?: number | null
}

/** 채널 정렬: 가격 있는 것 오름차순 → 가격 없는 것 order 기준 */
export function sortChannels(channels: ChannelWithPrice[]): ChannelWithPrice[] {
  const withPrice = channels.filter((c) => c.price !== null).sort((a, b) => a.price! - b.price!)
  const noPrice = channels.filter((c) => c.price === null).sort((a, b) => a.order - b.order)
  return [...withPrice, ...noPrice]
}

export interface BeanWithDetails {
  id: string
  name: string
  origins: string[]
  roastingLevel: string
  decaf: boolean
  cupNotes: string[]
  imageUrl: string | null
  channelPrices: ChannelWithPrice[]
}

export interface RoasteryDetail extends RoasteryWithStats {
  address: string | null
  closedAt: Date | null
  beans: BeanWithDetails[]
  channels: ChannelWithPrice[] // 원두 미선택 시 또는 가격 없는 로스터리의 기본 채널 목록
}

export const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  LOW: '2만원 미만',
  MID: '2~3.5만원',
  HIGH: '3.5만원 이상',
}

export const PRICE_OPTIONS = Object.keys(PRICE_RANGE_LABELS) as PriceRange[]

export const ROASTING_LEVEL_LABELS: Record<string, string> = {
  LIGHT: '라이트',
  LIGHT_MEDIUM: '라이트 미디엄',
  MEDIUM_LIGHT: '미디움 라이트',
  MEDIUM: '미디엄',
  MEDIUM_DARK: '미디엄 다크',
  DARK: '다크',
}

export type SortOption = 'name' | 'popular'

// 대한민국 17개 광역자치단체 (2글자 약어)
export const REGIONS = [
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '세종',
  '경기',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
] as const

export type Region = (typeof REGIONS)[number]

// 로스터리 특성 태그 (어드민 폼 자동완성용)
export const CHARACTERISTIC_TAGS = [
  '싱글오리진',
  '블렌드',
  '내추럴',
  '워시드',
  '허니프로세스',
  '에스프레소',
  '핸드드립',
  '콜드브루',
  '구독서비스',
  '마이크로로스터리',
  '직수입',
  '공정무역',
  '유기농',
] as const

export type CharacteristicTag = (typeof CHARACTERISTIC_TAGS)[number]

/** tags 배열에서 REGION 카테고리만 추출 (isPrimary=true 먼저) */
export function getRegions(tags: TagItem[]): string[] {
  const regions = tags.filter((t) => t.category === 'REGION')
  return [
    ...regions.filter((t) => t.isPrimary).map((t) => t.name),
    ...regions.filter((t) => !t.isPrimary).map((t) => t.name),
  ]
}

/** tags 배열에서 CHARACTERISTIC 카테고리만 추출 */
export function getCharacteristicTags(tags: TagItem[]): string[] {
  return tags.filter((t) => t.category === 'CHARACTERISTIC').map((t) => t.name)
}

export interface FilterParams {
  q: string
  price: PriceRange[]
  decaf: boolean
  regions: string[]
  tags: string[] // CHARACTERISTIC 태그 필터
  rated: boolean
}
