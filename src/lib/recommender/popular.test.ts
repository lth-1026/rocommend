import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetPopularRoasteries = vi.hoisted(() => vi.fn())

vi.mock('@/lib/queries/recommendation', () => ({
  getPopularRoasteries: mockGetPopularRoasteries,
}))

const { getPopularFallback } = await import('./popular')

function makeRoastery(id: string, avgRating: number | null = 4.5) {
  return {
    id,
    name: `로스터리 ${id}`,
    description: null,
    tags: [],
    priceRange: 'MID' as const,
    decaf: false,
    imageUrl: null,
    website: null,
    avgRating,
    ratingCount: 10,
  }
}

describe('getPopularFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // U-22: 평점 상위 5개 반환
  it('U-22: 인기 로스터리 목록을 반환한다', async () => {
    const roasteries = [makeRoastery('r1'), makeRoastery('r2')]
    mockGetPopularRoasteries.mockResolvedValue(roasteries)

    const result = await getPopularFallback()
    expect(result.source).toBe('fallback')
    expect(result.newItems).toHaveLength(2)
    expect(result.newItems[0].roastery.id).toBe('r1')
  })

  // U-23: 이미 평가한 로스터리 제외 (getPopularRoasteries에 userId 전달)
  it('U-23: userId가 있으면 getPopularRoasteries에 전달한다', async () => {
    mockGetPopularRoasteries.mockResolvedValue([makeRoastery('r2')])

    await getPopularFallback('user-1')
    expect(mockGetPopularRoasteries).toHaveBeenCalledWith('user-1', undefined)
  })

  // U-24: 전부 평가 → 빈 배열
  it('U-24: getPopularRoasteries가 빈 배열을 반환하면 newItems가 비어있다', async () => {
    mockGetPopularRoasteries.mockResolvedValue([])

    const result = await getPopularFallback('user-1')
    expect(result.newItems).toHaveLength(0)
    expect(result.repeatItems).toHaveLength(0)
  })

  // U-25: preferredPriceRanges 필터 적용
  it('U-25: preferredPriceRanges를 getPopularRoasteries에 전달한다', async () => {
    mockGetPopularRoasteries.mockResolvedValue([makeRoastery('r1')])

    await getPopularFallback('user-1', ['LOW', 'MID'])
    expect(mockGetPopularRoasteries).toHaveBeenCalledWith('user-1', ['LOW', 'MID'])
  })
})
