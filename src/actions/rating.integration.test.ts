import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { testPrisma, cleanDb } from '@/tests/db-helpers'

const mockAuth = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('next/server', () => ({ after: vi.fn((fn: () => unknown) => fn()) }))
vi.mock('@/lib/recommender', () => ({ computeAndSaveCF: vi.fn().mockResolvedValue(undefined) }))

const { upsertRating, deleteRating } = await import('@/actions/rating')

let userId: string
let roasteryId: string

beforeAll(async () => {
  const roastery = await testPrisma.roastery.create({
    data: { name: 'Rating Test Roastery', priceRange: 'MID' },
  })
  roasteryId = roastery.id
})

beforeEach(async () => {
  await cleanDb()
  const user = await testPrisma.user.create({
    data: { email: 'test-rating@example.com', name: '평가테스트' },
  })
  userId = user.id
  mockAuth.mockResolvedValue({ user: { id: userId } })
})

afterAll(async () => {
  await testPrisma.roastery.delete({ where: { id: roasteryId } })
  await testPrisma.$disconnect()
})

describe('upsertRating (integration)', () => {
  // I-05: Rating DB 저장
  it('I-05: 평가가 DB에 저장된다', async () => {
    await upsertRating({ roasteryId, score: 4, comment: '맛있어요' })

    const rating = await testPrisma.rating.findUnique({
      where: { userId_roasteryId: { userId, roasteryId } },
    })
    expect(rating).not.toBeNull()
    expect(rating?.score).toBe(4)
    expect(rating?.comment).toBe('맛있어요')
  })

  // I-06: 기존 Rating 업데이트
  it('I-06: 기존 평가를 제출하면 업데이트된다', async () => {
    await upsertRating({ roasteryId, score: 3 })
    await upsertRating({ roasteryId, score: 5, comment: '최고예요' })

    const count = await testPrisma.rating.count({ where: { userId, roasteryId } })
    expect(count).toBe(1)

    const rating = await testPrisma.rating.findUnique({
      where: { userId_roasteryId: { userId, roasteryId } },
    })
    expect(rating?.score).toBe(5)
  })

  // I-07: source 보존 (onboarding source가 있으면 update 시 빈 update로 보존)
  it('I-07: onboarding source를 직접 평가로 upsert해도 update 필드는 덮어쓴다', async () => {
    // 먼저 onboarding source로 직접 생성
    await testPrisma.rating.create({
      data: { userId, roasteryId, score: 5, source: 'onboarding' },
    })

    // 직접 평가 제출 (upsert update: { score, comment } → source는 DB 값 유지)
    await upsertRating({ roasteryId, score: 3, comment: '직접 평가' })

    const rating = await testPrisma.rating.findUnique({
      where: { userId_roasteryId: { userId, roasteryId } },
    })
    // score와 comment는 업데이트됨
    expect(rating?.score).toBe(3)
    expect(rating?.comment).toBe('직접 평가')
    // source는 update 필드에 없으므로 기존 값 유지
    expect(rating?.source).toBe('onboarding')
  })

  // I-08: EventLog 생성
  it('I-08: rating_submitted EventLog가 생성된다', async () => {
    await upsertRating({ roasteryId, score: 4 })

    const log = await testPrisma.eventLog.findFirst({
      where: { userId, event: 'rating_submitted' },
    })
    expect(log).not.toBeNull()
    expect((log?.payload as Record<string, unknown>)?.roasteryId).toBe(roasteryId)
  })
})

describe('deleteRating (integration)', () => {
  it('I-09: 평가를 삭제하면 DB에서 제거된다', async () => {
    await testPrisma.rating.create({ data: { userId, roasteryId, score: 4 } })

    await deleteRating({ roasteryId })

    const rating = await testPrisma.rating.findUnique({
      where: { userId_roasteryId: { userId, roasteryId } },
    })
    expect(rating).toBeNull()
  })
})
