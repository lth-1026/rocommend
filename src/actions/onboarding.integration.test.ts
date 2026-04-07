import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { testPrisma, cleanDb } from '@/tests/db-helpers'

const mockAuth = vi.hoisted(() => vi.fn())
const mockRedirect = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('next/navigation', () => ({ redirect: mockRedirect }))
vi.mock('next/server', () => ({ after: vi.fn((fn: () => unknown) => fn()) }))
vi.mock('@/lib/recommender', () => ({ computeAndSaveCF: vi.fn().mockResolvedValue(undefined) }))

const { submitOnboarding } = await import('@/actions/onboarding')

let userId: string
let roasteryIds: string[]

beforeAll(async () => {
  // 테스트용 로스터리 3개 생성 (onboardingCandidate=true)
  const [r1, r2, r3] = await Promise.all([
    testPrisma.roastery.create({
      data: { name: 'R1', priceRange: 'LOW', isOnboardingCandidate: true },
    }),
    testPrisma.roastery.create({
      data: { name: 'R2', priceRange: 'MID', isOnboardingCandidate: true },
    }),
    testPrisma.roastery.create({
      data: { name: 'R3', priceRange: 'HIGH', isOnboardingCandidate: true },
    }),
  ])
  roasteryIds = [r1.id, r2.id, r3.id]
})

beforeEach(async () => {
  await cleanDb()
  // 사용자 재생성
  const user = await testPrisma.user.create({
    data: { email: 'test-onboarding@example.com', name: '통합테스트' },
  })
  userId = user.id
  mockAuth.mockResolvedValue({ user: { id: userId } })
  mockRedirect.mockClear()
})

afterAll(async () => {
  await testPrisma.roastery.deleteMany({ where: { name: { in: ['R1', 'R2', 'R3'] } } })
  await testPrisma.$disconnect()
})

describe('submitOnboarding (integration)', () => {
  // I-01: Onboarding 저장
  it('I-01: Onboarding 레코드가 DB에 저장된다', async () => {
    await submitOnboarding({
      q1: ['ESPRESSO'],
      q2: 'ONLINE',
      q3: ['NO_PREFERENCE'],
      q4: 'FIRST_TIME',
    })

    const onboarding = await testPrisma.onboarding.findUnique({ where: { userId } })
    expect(onboarding).not.toBeNull()
    expect(onboarding?.version).toBe(3)
    expect(onboarding?.q4).toBe('FIRST_TIME')
  })

  // I-02: Rating bulk upsert (Q5)
  it('I-02: Q5로 선택한 로스터리에 대한 Rating이 생성된다', async () => {
    await submitOnboarding({
      q1: ['ESPRESSO'],
      q2: 'ONLINE',
      q3: ['MID'],
      q4: 'MONTHLY',
      q5: roasteryIds,
    })

    const ratings = await testPrisma.rating.findMany({ where: { userId } })
    expect(ratings).toHaveLength(3)
    expect(ratings.every((r) => r.score === 5)).toBe(true)
    expect(ratings.every((r) => r.source === 'onboarding')).toBe(true)
  })

  // I-03: User.preferences 갱신
  it('I-03: User.preferences에 onboardingVersion과 inferredProfile이 저장된다', async () => {
    await submitOnboarding({
      q1: ['POUR_OVER'],
      q2: 'BOTH',
      q3: ['LOW', 'MID'],
      q4: 'FIRST_TIME',
    })

    const user = await testPrisma.user.findUnique({ where: { id: userId } })
    const prefs = user?.preferences as Record<string, unknown>
    expect(prefs?.onboardingVersion).toBe(3)
    expect((prefs?.inferredProfile as Record<string, unknown>)?.brewingMethods).toContain(
      'POUR_OVER'
    )
  })

  // I-04: 중복 제출 (upsert 덮어쓰기)
  it('I-04: 온보딩을 두 번 제출하면 upsert로 덮어쓴다', async () => {
    await submitOnboarding({
      q1: ['ESPRESSO'],
      q2: 'ONLINE',
      q3: ['NO_PREFERENCE'],
      q4: 'FIRST_TIME',
    })

    await submitOnboarding({
      q1: ['POUR_OVER'],
      q2: 'OFFLINE',
      q3: ['HIGH'],
      q4: 'FIRST_TIME',
    })

    const count = await testPrisma.onboarding.count({ where: { userId } })
    expect(count).toBe(1)

    const onboarding = await testPrisma.onboarding.findUnique({ where: { userId } })
    expect(onboarding?.q2).toBe('OFFLINE')
  })
})
