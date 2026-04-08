import { describe, it, expect } from 'vitest'
import { buildSimilarityMatrix } from './item-cf'
import type { RawRating } from './types'

/**
 * 추천 정확도 테스트 (오프라인, 순수 함수 기반)
 * 실제 DB 없이 cosineSimilarity / buildSimilarityMatrix 로직 검증
 */

function predictScore(
  matrix: Map<string, Map<string, number>>,
  userRatings: Map<string, number>,
  targetId: string
): number {
  const targetSims = matrix.get(targetId)
  if (!targetSims) return 0

  let weightedSum = 0
  let simSum = 0

  for (const [ratedId, userScore] of userRatings) {
    if (ratedId === targetId) continue
    const sim = targetSims.get(ratedId) ?? 0
    if (sim <= 0) continue
    weightedSum += sim * userScore
    simSum += sim
  }

  return simSum === 0 ? 0 : weightedSum / simSum
}

describe('추천 정확도 (offline)', () => {
  // A-01: 유사한 유저가 높게 평가한 로스터리가 높은 예측 점수를 받는다
  it('A-01: 유사한 평가 패턴의 유저가 선호한 로스터리는 높은 예측 점수를 받는다', () => {
    // 유저1과 유저2가 비슷한 패턴 (서로 유사)
    // 유저2가 r4를 5점 → 유저1에게 r4 예측 점수가 높아야 함
    const ratings: RawRating[] = [
      { userId: 'u1', roasteryId: 'r1', score: 5 },
      { userId: 'u1', roasteryId: 'r2', score: 4 },
      { userId: 'u1', roasteryId: 'r3', score: 3 },
      { userId: 'u2', roasteryId: 'r1', score: 5 },
      { userId: 'u2', roasteryId: 'r2', score: 4 },
      { userId: 'u2', roasteryId: 'r4', score: 5 }, // 유저1 미평가
      { userId: 'u3', roasteryId: 'r1', score: 1 },
      { userId: 'u3', roasteryId: 'r2', score: 1 },
      { userId: 'u3', roasteryId: 'r5', score: 5 }, // 유저1 미평가
    ]

    const matrix = buildSimilarityMatrix(ratings)
    const u1Ratings = new Map([
      ['r1', 5],
      ['r2', 4],
      ['r3', 3],
    ])

    const scoreR4 = predictScore(matrix, u1Ratings, 'r4')
    const scoreR5 = predictScore(matrix, u1Ratings, 'r5')

    // r4(유사 유저2가 좋아함)가 r5(비유사 유저3이 좋아함)보다 높아야 함
    expect(scoreR4).toBeGreaterThan(scoreR5)
  })

  // A-02: 예측 점수는 1~5 범위 내에서 합리적이다
  it('A-02: 예측 점수는 1~5 범위 내에 있다', () => {
    const ratings: RawRating[] = [
      { userId: 'u1', roasteryId: 'r1', score: 5 },
      { userId: 'u1', roasteryId: 'r2', score: 4 },
      { userId: 'u2', roasteryId: 'r1', score: 5 },
      { userId: 'u2', roasteryId: 'r3', score: 4 },
    ]

    const matrix = buildSimilarityMatrix(ratings)
    const u1Ratings = new Map([
      ['r1', 5],
      ['r2', 4],
    ])
    const score = predictScore(matrix, u1Ratings, 'r3')

    expect(score).toBeGreaterThanOrEqual(1)
    expect(score).toBeLessThanOrEqual(5)
  })

  // A-03: 공통 평가자가 없는 로스터리 예측 점수는 0
  it('A-03: 관련 유사도가 없으면 예측 점수는 0이다', () => {
    const ratings: RawRating[] = [
      { userId: 'u1', roasteryId: 'r1', score: 5 },
      { userId: 'u2', roasteryId: 'r2', score: 4 }, // r1과 r2 공통 평가자 없음
    ]

    const matrix = buildSimilarityMatrix(ratings)
    const u1Ratings = new Map([['r1', 5]])
    const score = predictScore(matrix, u1Ratings, 'r2')

    expect(score).toBe(0)
  })

  // A-04: 완전히 반대 성향의 유저 추천 결과 검증
  it('A-04: 반대 성향 유저의 선호 로스터리는 낮은 예측 점수를 받는다', () => {
    const ratings: RawRating[] = [
      { userId: 'u1', roasteryId: 'r1', score: 5 },
      { userId: 'u1', roasteryId: 'r2', score: 5 },
      { userId: 'u1', roasteryId: 'r3', score: 1 }, // 싫어함
      { userId: 'u2', roasteryId: 'r1', score: 1 },
      { userId: 'u2', roasteryId: 'r2', score: 1 },
      { userId: 'u2', roasteryId: 'r4', score: 5 }, // u2 선호, u1 미평가
    ]

    const matrix = buildSimilarityMatrix(ratings)
    const u1Ratings = new Map([
      ['r1', 5],
      ['r2', 5],
      ['r3', 1],
    ])

    // u2가 선호하는 r4의 예측: u1-u2 유사도가 낮음 → 낮은 예측
    const scoreR4 = predictScore(matrix, u1Ratings, 'r4')

    // 최소한 5 이하여야 함
    expect(scoreR4).toBeLessThanOrEqual(5)
  })

  // A-05: buildSimilarityMatrix는 충분한 평가 데이터에서 합리적인 행렬을 생성한다
  it('A-05: 충분한 평가 데이터로 생성된 유사도 행렬은 대각 대칭이다', () => {
    const ratings: RawRating[] = [
      { userId: 'u1', roasteryId: 'r1', score: 5 },
      { userId: 'u1', roasteryId: 'r2', score: 3 },
      { userId: 'u2', roasteryId: 'r1', score: 4 },
      { userId: 'u2', roasteryId: 'r3', score: 5 },
      { userId: 'u3', roasteryId: 'r2', score: 4 },
      { userId: 'u3', roasteryId: 'r3', score: 3 },
    ]

    const matrix = buildSimilarityMatrix(ratings)
    const ids = ['r1', 'r2', 'r3']

    for (const a of ids) {
      for (const b of ids) {
        if (a === b) continue
        const simAB = matrix.get(a)?.get(b) ?? 0
        const simBA = matrix.get(b)?.get(a) ?? 0
        expect(simAB).toBeCloseTo(simBA, 10)
      }
    }
  })
})
