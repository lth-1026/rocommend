import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { testPrisma, cleanDb } from '@/tests/db-helpers'
import { getRecommendations } from './index'
import { computeAndSaveCF } from './item-cf'
import { getUserRatingCount } from '@/lib/queries/recommendation'

let userId: string
let userId2: string
let roasteryIds: string[]

beforeAll(async () => {
  // 5개 로스터리 생성
  const roasteries = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      testPrisma.roastery.create({
        data: { name: `CF Test Roastery ${i + 1}`, priceRange: 'MID' },
      })
    )
  )
  roasteryIds = roasteries.map((r) => r.id)
})

beforeEach(async () => {
  await cleanDb()
  const [u1, u2] = await Promise.all([
    testPrisma.user.create({ data: { email: 'cf-user1@example.com', name: 'CF유저1' } }),
    testPrisma.user.create({ data: { email: 'cf-user2@example.com', name: 'CF유저2' } }),
  ])
  userId = u1.id
  userId2 = u2.id
})

afterAll(async () => {
  await testPrisma.roastery.deleteMany({ where: { id: { in: roasteryIds } } })
  await testPrisma.$disconnect()
})

describe('getRecommendations (integration)', () => {
  // I-15: 평가 2개 → 폴백 동작
  it('I-15: 평가 2개이면 fallback(인기 순)을 반환한다', async () => {
    await testPrisma.rating.createMany({
      data: [
        { userId, roasteryId: roasteryIds[0], score: 5 },
        { userId, roasteryId: roasteryIds[1], score: 4 },
      ],
    })

    const result = await getRecommendations(userId)
    expect(result.source).toBe('fallback')
  })

  // I-16: getUserRatingCount
  it('I-16: getUserRatingCount는 유저의 평가 수를 반환한다', async () => {
    await testPrisma.rating.createMany({
      data: [
        { userId, roasteryId: roasteryIds[0], score: 5 },
        { userId, roasteryId: roasteryIds[1], score: 4 },
        { userId, roasteryId: roasteryIds[2], score: 3 },
      ],
    })

    const count = await getUserRatingCount(userId)
    expect(count).toBe(3)
  })
})

describe('computeAndSaveCF (integration)', () => {
  // I-13: CF 실행
  it('I-13: 평가 3개 이상이면 CF를 실행하고 Recommendation을 저장한다', async () => {
    // 두 유저가 공통으로 평가한 로스터리 생성
    await testPrisma.rating.createMany({
      data: [
        { userId, roasteryId: roasteryIds[0], score: 5 },
        { userId, roasteryId: roasteryIds[1], score: 4 },
        { userId, roasteryId: roasteryIds[2], score: 3 },
        // 유저2도 같은 로스터리 평가 → 유사도 생성
        { userId: userId2, roasteryId: roasteryIds[0], score: 5 },
        { userId: userId2, roasteryId: roasteryIds[1], score: 4 },
        { userId: userId2, roasteryId: roasteryIds[3], score: 5 }, // 유저1이 안 본 것
      ],
    })

    await computeAndSaveCF(userId)

    const recs = await testPrisma.recommendation.findMany({ where: { userId } })
    // 적어도 하나의 추천이 생성돼야 함
    expect(recs.length).toBeGreaterThan(0)
  })

  // I-14: Recommendation upsert
  it('I-14: 같은 userId+roasteryId로 두 번 CF를 실행하면 upsert된다', async () => {
    await testPrisma.rating.createMany({
      data: [
        { userId, roasteryId: roasteryIds[0], score: 5 },
        { userId, roasteryId: roasteryIds[1], score: 4 },
        { userId, roasteryId: roasteryIds[2], score: 3 },
        { userId: userId2, roasteryId: roasteryIds[0], score: 4 },
        { userId: userId2, roasteryId: roasteryIds[1], score: 5 },
        { userId: userId2, roasteryId: roasteryIds[3], score: 5 },
      ],
    })

    await computeAndSaveCF(userId)
    const countFirst = await testPrisma.recommendation.count({ where: { userId } })

    await computeAndSaveCF(userId)
    const countSecond = await testPrisma.recommendation.count({ where: { userId } })

    // 두 번 실행해도 같은 수 (upsert)
    expect(countSecond).toBe(countFirst)
  })
})
