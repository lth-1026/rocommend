import { prisma } from '@/lib/prisma'
import { getAllRatings } from '@/lib/queries/recommendation'
import type { RawRating } from './types'

/**
 * 두 로스터리 벡터(userId→score)의 코사인 유사도 계산.
 * 공통 평가자 없거나 영벡터이면 0.0 반환.
 */
export function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dot = 0
  let normA = 0
  let normB = 0

  for (const [userId, scoreA] of vecA) {
    normA += scoreA * scoreA
    const scoreB = vecB.get(userId)
    if (scoreB !== undefined) {
      dot += scoreA * scoreB
    }
  }

  for (const scoreB of vecB.values()) {
    normB += scoreB * scoreB
  }

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * 전체 평가 데이터로 로스터리 간 코사인 유사도 행렬 구성.
 * 반환: Map<roasteryId, Map<roasteryId, similarity>>
 */
export function buildSimilarityMatrix(ratings: RawRating[]): Map<string, Map<string, number>> {
  // 로스터리별 userId→score 맵 구성
  const roasteryVecs = new Map<string, Map<string, number>>()
  for (const { roasteryId, userId, score } of ratings) {
    if (!roasteryVecs.has(roasteryId)) {
      roasteryVecs.set(roasteryId, new Map())
    }
    roasteryVecs.get(roasteryId)!.set(userId, score)
  }

  const roasteryIds = [...roasteryVecs.keys()]
  const matrix = new Map<string, Map<string, number>>()

  for (let i = 0; i < roasteryIds.length; i++) {
    const idA = roasteryIds[i]
    if (!matrix.has(idA)) matrix.set(idA, new Map())

    for (let j = i + 1; j < roasteryIds.length; j++) {
      const idB = roasteryIds[j]
      if (!matrix.has(idB)) matrix.set(idB, new Map())

      const sim = cosineSimilarity(roasteryVecs.get(idA)!, roasteryVecs.get(idB)!)
      matrix.get(idA)!.set(idB, sim)
      matrix.get(idB)!.set(idA, sim) // 대칭 행렬
    }
  }

  return matrix
}

/**
 * userId의 CF 추천 결과를 계산하고 Recommendation 테이블에 upsert.
 * `after()` 콜백에서 호출됨 (응답 후 비동기 실행).
 */
export async function computeAndSaveCF(userId: string): Promise<void> {
  const ratings = await getAllRatings()
  if (ratings.length === 0) return

  const userRatings = ratings.filter((r) => r.userId === userId)
  if (userRatings.length < 3) return

  const matrix = buildSimilarityMatrix(ratings)
  const userRatedMap = new Map(userRatings.map((r) => [r.roasteryId, r.score]))

  // 전체 로스터리 ID 목록
  const allRoasteryIds = new Set(ratings.map((r) => r.roasteryId))

  const recommendations: { roasteryId: string; score: number }[] = []

  for (const targetId of allRoasteryIds) {
    const targetSims = matrix.get(targetId)
    if (!targetSims) continue

    let weightedSum = 0
    let simSum = 0

    for (const [ratedId, userScore] of userRatedMap) {
      if (ratedId === targetId) continue
      const sim = targetSims.get(ratedId) ?? 0
      if (sim <= 0) continue
      weightedSum += sim * userScore
      simSum += sim
    }

    if (simSum === 0) continue

    const predicted = weightedSum / simSum
    const isRated = userRatedMap.has(targetId)
    const userScore = userRatedMap.get(targetId)

    // 미평가: 예측 점수 저장
    // 평가함: CF >= 4.0 AND 내 평점 >= 4 → "또 사고 싶은" 후보
    if (!isRated || (predicted >= 4.0 && (userScore ?? 0) >= 4)) {
      recommendations.push({ roasteryId: targetId, score: predicted })
    }
  }

  if (recommendations.length === 0) return

  // Recommendation 테이블 upsert
  await Promise.all(
    recommendations.map((rec) =>
      prisma.recommendation.upsert({
        where: { userId_roasteryId: { userId, roasteryId: rec.roasteryId } },
        create: { userId, roasteryId: rec.roasteryId, score: rec.score },
        update: { score: rec.score },
      })
    )
  )

  // 이번 계산에 포함되지 않은 기존 추천 레코드 삭제 (더 이상 유효하지 않은 것)
  const keepIds = new Set(recommendations.map((r) => r.roasteryId))
  await prisma.recommendation.deleteMany({
    where: {
      userId,
      roasteryId: { notIn: [...keepIds] },
    },
  })
}
