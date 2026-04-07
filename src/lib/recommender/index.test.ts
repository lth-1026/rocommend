import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUserRatingCount = vi.hoisted(() => vi.fn())
const mockGetStoredRecommendations = vi.hoisted(() => vi.fn())
const mockGetPopularFallback = vi.hoisted(() => vi.fn())

// index.ts가 item-cf.ts를 재수출하며, item-cf.ts는 prisma를 import하므로 목 처리
vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/lib/queries/recommendation', () => ({
  getUserRatingCount: mockGetUserRatingCount,
  getStoredRecommendations: mockGetStoredRecommendations,
  getAllRatings: vi.fn(),
}))

vi.mock('./popular', () => ({
  getPopularFallback: mockGetPopularFallback,
}))

const { getRecommendations } = await import('./index')

function makeRoastery(id: string) {
  return {
    id,
    name: `로스터리 ${id}`,
    description: null,
    tags: [],
    priceRange: 'MID' as const,
    decaf: false,
    imageUrl: null,
    website: null,
    avgRating: 4.0,
    ratingCount: 5,
  }
}

const fallbackResult = {
  source: 'fallback' as const,
  newItems: [{ roastery: makeRoastery('popular-1'), cfScore: 4.5 }],
  repeatItems: [],
}

describe('getRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPopularFallback.mockResolvedValue(fallbackResult)
  })

  // U-17: 평가 ≥3, stored 있음 → CF 결과
  it('U-17: 평가 3개 이상이고 stored 추천이 있으면 CF 결과를 반환한다', async () => {
    mockGetUserRatingCount.mockResolvedValue(3)
    mockGetStoredRecommendations.mockResolvedValue([
      { roasteryId: 'r1', cfScore: 4.8, roastery: makeRoastery('r1'), userRating: undefined },
      { roasteryId: 'r2', cfScore: 4.5, roastery: makeRoastery('r2'), userRating: undefined },
    ])

    const result = await getRecommendations('user-1')
    expect(result.source).toBe('cf')
    expect(result.newItems.length).toBeGreaterThan(0)
    expect(mockGetPopularFallback).not.toHaveBeenCalled()
  })

  // U-18: 평가 2개 → fallback 위임
  it('U-18: 평가가 3개 미만이면 fallback을 반환한다', async () => {
    mockGetUserRatingCount.mockResolvedValue(2)

    const result = await getRecommendations('user-1')
    expect(result.source).toBe('fallback')
    expect(mockGetPopularFallback).toHaveBeenCalledWith('user-1')
  })

  // U-19: CF 결과 없음 → fallback 위임
  it('U-19: stored 추천이 없으면 fallback을 반환한다', async () => {
    mockGetUserRatingCount.mockResolvedValue(5)
    mockGetStoredRecommendations.mockResolvedValue([])

    const result = await getRecommendations('user-1')
    expect(result.source).toBe('fallback')
    expect(mockGetPopularFallback).toHaveBeenCalled()
  })

  // U-20: newItems 7개 limit (상위 7개)
  it('U-20: newItems는 cfScore 내림차순 상위 7개로 제한된다', async () => {
    mockGetUserRatingCount.mockResolvedValue(3)
    const manyRecs = Array.from({ length: 10 }, (_, i) => ({
      roasteryId: `r${i}`,
      cfScore: 5 - i * 0.1,
      roastery: makeRoastery(`r${i}`),
      userRating: undefined,
    }))
    mockGetStoredRecommendations.mockResolvedValue(manyRecs)

    const result = await getRecommendations('user-1')
    expect(result.source).toBe('cf')
    expect(result.newItems.length).toBeLessThanOrEqual(7)
    // 상위 7개이므로 첫 번째가 가장 높은 cfScore
    if (result.newItems.length > 1) {
      expect(result.newItems[0].cfScore).toBeGreaterThanOrEqual(result.newItems[1].cfScore)
    }
  })

  // U-21: userId 없음 → fallback
  it('U-21: userId가 없으면 fallback을 반환한다', async () => {
    const result = await getRecommendations(undefined)
    expect(result.source).toBe('fallback')
    expect(mockGetPopularFallback).toHaveBeenCalledWith()
  })
})
