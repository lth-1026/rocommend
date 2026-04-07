import { describe, it, expect, vi } from 'vitest'

// item-cf.ts가 prisma를 import하지만 순수 함수 테스트에서는 불필요하므로 목 처리
vi.mock('@/lib/prisma', () => ({ prisma: {} }))
vi.mock('@/lib/queries/recommendation', () => ({ getAllRatings: vi.fn() }))

import { cosineSimilarity, buildSimilarityMatrix } from './item-cf'
import type { RawRating } from './types'

describe('cosineSimilarity', () => {
  // U-07: 동일 벡터 → 1.0
  it('U-07: 동일 벡터의 코사인 유사도는 1.0이다', () => {
    const a = new Map([
      ['user1', 4],
      ['user2', 3],
    ])
    const b = new Map([
      ['user1', 4],
      ['user2', 3],
    ])
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0)
  })

  // U-08: 공통 평가자 없음 → 0.0
  it('U-08: 공통 평가자가 없으면 유사도는 0.0이다', () => {
    const a = new Map([['user1', 5]])
    const b = new Map([['user2', 3]])
    expect(cosineSimilarity(a, b)).toBe(0.0)
  })

  // U-09: 부분 겹침 → 0 < sim < 1
  it('U-09: 부분적으로 겹치는 평가자가 있으면 0 < sim < 1이다', () => {
    const a = new Map([
      ['user1', 5],
      ['user2', 3],
    ])
    const b = new Map([
      ['user1', 5],
      ['user3', 4],
    ])
    const sim = cosineSimilarity(a, b)
    expect(sim).toBeGreaterThan(0)
    expect(sim).toBeLessThan(1)
  })

  // U-10: 영벡터 → 0.0
  it('U-10: 영벡터(빈 맵)와의 유사도는 0.0이다', () => {
    const a = new Map<string, number>()
    const b = new Map([['user1', 3]])
    expect(cosineSimilarity(a, b)).toBe(0.0)
    expect(cosineSimilarity(b, a)).toBe(0.0)
  })

  // U-11: 단일 공통 평가자 동점 → 1.0
  it('U-11: 단일 공통 평가자가 동일한 점수를 줬으면 유사도는 1.0이다', () => {
    const a = new Map([['user1', 4]])
    const b = new Map([['user1', 4]])
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0)
  })

  // U-12: 단일 공통 평가자 다른 점수 → 계산값
  it('U-12: 단일 공통 평가자가 다른 점수를 줬으면 계산된 유사도를 반환한다', () => {
    const a = new Map([['user1', 3]])
    const b = new Map([['user1', 5]])
    // cosine = (3*5) / (sqrt(9) * sqrt(25)) = 15 / 15 = 1.0
    // 단일 평가자로는 항상 1.0 (방향 일치)
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0)
  })
})

describe('buildSimilarityMatrix', () => {
  // U-13: 2개 로스터리, 동일 평점 → 1.0
  it('U-13: 같은 유저가 두 로스터리에 동일한 점수를 줬으면 유사도는 1.0이다', () => {
    const ratings: RawRating[] = [
      { userId: 'u1', roasteryId: 'r1', score: 4 },
      { userId: 'u1', roasteryId: 'r2', score: 4 },
    ]
    const matrix = buildSimilarityMatrix(ratings)
    expect(matrix.get('r1')?.get('r2')).toBeCloseTo(1.0)
    expect(matrix.get('r2')?.get('r1')).toBeCloseTo(1.0)
  })

  // U-14: 공통 평가자 없음 → 0.0
  it('U-14: 공통 평가자가 없는 두 로스터리의 유사도는 0.0이다', () => {
    const ratings: RawRating[] = [
      { userId: 'u1', roasteryId: 'r1', score: 5 },
      { userId: 'u2', roasteryId: 'r2', score: 3 },
    ]
    const matrix = buildSimilarityMatrix(ratings)
    expect(matrix.get('r1')?.get('r2')).toBe(0.0)
  })

  // U-15: 3개 로스터리, 대칭 검증
  it('U-15: 유사도 행렬은 대칭이다', () => {
    const ratings: RawRating[] = [
      { userId: 'u1', roasteryId: 'r1', score: 5 },
      { userId: 'u1', roasteryId: 'r2', score: 4 },
      { userId: 'u2', roasteryId: 'r2', score: 5 },
      { userId: 'u2', roasteryId: 'r3', score: 3 },
      { userId: 'u1', roasteryId: 'r3', score: 4 },
    ]
    const matrix = buildSimilarityMatrix(ratings)
    const r1r2 = matrix.get('r1')?.get('r2') ?? 0
    const r2r1 = matrix.get('r2')?.get('r1') ?? 0
    expect(r1r2).toBeCloseTo(r2r1)

    const r1r3 = matrix.get('r1')?.get('r3') ?? 0
    const r3r1 = matrix.get('r3')?.get('r1') ?? 0
    expect(r1r3).toBeCloseTo(r3r1)
  })

  // U-16: 로스터리 1개 → 빈 행렬 (자기 자신과의 비교 없음)
  it('U-16: 로스터리가 1개뿐이면 빈 행렬을 반환한다', () => {
    const ratings: RawRating[] = [{ userId: 'u1', roasteryId: 'r1', score: 5 }]
    const matrix = buildSimilarityMatrix(ratings)
    expect(matrix.get('r1')?.size).toBe(0)
  })
})
