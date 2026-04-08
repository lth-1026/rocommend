import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.hoisted(() => vi.fn())
const mockPrisma = vi.hoisted(() => ({
  rating: {
    upsert: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
  eventLog: { create: vi.fn().mockResolvedValue({}) },
}))
const mockComputeAndSaveCF = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))
vi.mock('next/server', () => ({ after: vi.fn((fn: () => unknown) => fn()) }))
vi.mock('@/lib/recommender', () => ({ computeAndSaveCF: mockComputeAndSaveCF }))

const { upsertRating, deleteRating } = await import('@/actions/rating')

const authedSession = { user: { id: 'user-1' } }

describe('upsertRating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.rating.upsert.mockResolvedValue({})
    mockPrisma.eventLog.create.mockResolvedValue({})
    mockComputeAndSaveCF.mockResolvedValue(undefined)
  })

  // U-31: 미로그인 → UNAUTHORIZED
  it('U-31: 로그인되지 않은 경우 UNAUTHORIZED를 반환한다', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await upsertRating({ roasteryId: 'r1', score: 4 })
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'UNAUTHORIZED' })
  })

  // U-32: score < 1 → VALIDATION
  it('U-32: 점수가 1 미만이면 VALIDATION을 반환한다', async () => {
    mockAuth.mockResolvedValue(authedSession)
    const result = await upsertRating({ roasteryId: 'r1', score: 0 })
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'VALIDATION' })
  })

  // U-33: score > 5 → VALIDATION
  it('U-33: 점수가 5 초과이면 VALIDATION을 반환한다', async () => {
    mockAuth.mockResolvedValue(authedSession)
    const result = await upsertRating({ roasteryId: 'r1', score: 6 })
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'VALIDATION' })
  })

  // U-34: 정상 제출 → upsert + EventLog
  it('U-34: 정상 제출 시 rating을 upsert하고 EventLog를 생성한다', async () => {
    mockAuth.mockResolvedValue(authedSession)
    const result = await upsertRating({ roasteryId: 'r1', score: 4, comment: '좋아요' })
    expect(result).toEqual({ success: true })
    expect(mockPrisma.rating.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ userId: 'user-1', roasteryId: 'r1', score: 4 }),
      })
    )
  })

  // U-35: 수정 (기존 있음) → upsert (덮어쓰기)
  it('U-35: upsert는 기존 평가를 덮어쓴다', async () => {
    mockAuth.mockResolvedValue(authedSession)
    await upsertRating({ roasteryId: 'r1', score: 4 })
    await upsertRating({ roasteryId: 'r1', score: 5 })
    expect(mockPrisma.rating.upsert).toHaveBeenCalledTimes(2)
    expect(mockPrisma.rating.upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ score: 5 }),
      })
    )
  })
})

describe('deleteRating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.rating.delete.mockResolvedValue({})
    mockComputeAndSaveCF.mockResolvedValue(undefined)
  })

  // U-36: 정상 삭제
  it('U-36: 정상적으로 rating을 삭제한다', async () => {
    mockAuth.mockResolvedValue(authedSession)
    const result = await deleteRating({ roasteryId: 'r1' })
    expect(result).toEqual({ success: true })
    expect(mockPrisma.rating.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_roasteryId: { userId: 'user-1', roasteryId: 'r1' } },
      })
    )
  })

  // U-37: 미로그인 → UNAUTHORIZED
  it('U-37: 로그인되지 않은 경우 UNAUTHORIZED를 반환한다', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await deleteRating({ roasteryId: 'r1' })
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'UNAUTHORIZED' })
  })
})
