import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.hoisted(() => vi.fn())
const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    onboarding: { upsert: vi.fn().mockResolvedValue({}) },
    rating: { upsert: vi.fn().mockResolvedValue({}) },
    user: { update: vi.fn().mockResolvedValue({}) },
    roastery: { count: vi.fn().mockResolvedValue(3) },
  }
  return {
    mockTx: tx,
    mockPrisma: {
      $transaction: vi
        .fn()
        .mockImplementation(async (fn: (tx: typeof tx) => Promise<unknown>) => fn(tx)),
      eventLog: { create: vi.fn().mockResolvedValue({}) },
    },
  }
})
const mockRedirect = vi.hoisted(() => vi.fn())
const mockComputeAndSaveCF = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('next/navigation', () => ({ redirect: mockRedirect }))
vi.mock('next/server', () => ({ after: vi.fn((fn: () => unknown) => fn()) }))
vi.mock('@/lib/recommender', () => ({ computeAndSaveCF: mockComputeAndSaveCF }))

const { submitOnboarding } = await import('@/actions/onboarding')

const validData = {
  q1: ['ESPRESSO' as const],
  q2: 'ONLINE' as const,
  q3: ['MID' as const],
  q4: 'MONTHLY' as const,
  q5: ['r1', 'r2', 'r3'],
}

describe('submitOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTx.onboarding.upsert.mockResolvedValue({})
    mockTx.rating.upsert.mockResolvedValue({})
    mockTx.user.update.mockResolvedValue({})
    mockTx.roastery.count.mockResolvedValue(3)
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)
    )
    mockPrisma.eventLog.create.mockResolvedValue({})
    mockComputeAndSaveCF.mockResolvedValue(undefined)
  })

  // U-26: 미로그인 → UNAUTHORIZED
  it('U-26: 로그인되지 않은 경우 UNAUTHORIZED를 반환한다', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await submitOnboarding(validData)
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'UNAUTHORIZED' })
  })

  // U-27: 스키마 validation 실패 → VALIDATION
  it('U-27: 유효하지 않은 입력값이면 VALIDATION을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    const result = await submitOnboarding({
      q1: [], // 최소 1개 필요
      q2: 'ONLINE' as const,
      q3: ['MID' as const],
      q4: 'MONTHLY' as const,
      q5: ['r1', 'r2', 'r3'],
    })
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'VALIDATION' })
  })

  // U-28: Q4=FIRST_TIME, q5 빈 배열 → Rating 생성 없음
  it('U-28: Q4=FIRST_TIME이면 Rating을 생성하지 않는다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    await submitOnboarding({
      q1: ['ESPRESSO' as const],
      q2: 'ONLINE' as const,
      q3: ['NO_PREFERENCE' as const],
      q4: 'FIRST_TIME' as const,
    })
    expect(mockTx.rating.upsert).not.toHaveBeenCalled()
  })

  // U-29: Q4=MONTHLY, q5=3개 → Rating 3개 upsert
  it('U-29: Q4=MONTHLY이고 q5가 3개이면 Rating 3개를 upsert한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    await submitOnboarding(validData)
    expect(mockTx.rating.upsert).toHaveBeenCalledTimes(3)
    expect(mockTx.rating.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ score: 5, source: 'onboarding' }),
      })
    )
  })

  // U-30: DB 에러 → DB_ERROR
  it('U-30: DB 트랜잭션 에러가 발생하면 DB_ERROR를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockPrisma.$transaction.mockRejectedValue(new Error('DB connection failed'))
    const result = await submitOnboarding(validData)
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'DB_ERROR' })
  })

  // 성공 케이스: redirect 호출 확인
  it('성공 시 /home으로 redirect된다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    await submitOnboarding(validData)
    expect(mockRedirect).toHaveBeenCalledWith('/home')
  })
})
