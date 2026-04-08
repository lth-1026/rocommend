import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.hoisted(() => vi.fn())
const mockPrisma = vi.hoisted(() => ({
  bookmark: {
    findUnique: vi.fn(),
    create: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

const { toggleBookmark, removeBookmark } = await import('@/actions/bookmark')

const authedSession = { user: { id: 'user-1' } }

describe('toggleBookmark', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.bookmark.create.mockResolvedValue({})
    mockPrisma.bookmark.delete.mockResolvedValue({})
  })

  // U-38: 미로그인 → UNAUTHORIZED
  it('U-38: 로그인되지 않은 경우 UNAUTHORIZED를 반환한다', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await toggleBookmark({ roasteryId: 'r1' })
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'UNAUTHORIZED' })
  })

  // U-39: 북마크 없음 → 생성
  it('U-39: 북마크가 없으면 생성하고 isBookmarked: true를 반환한다', async () => {
    mockAuth.mockResolvedValue(authedSession)
    mockPrisma.bookmark.findUnique.mockResolvedValue(null)
    const result = await toggleBookmark({ roasteryId: 'r1' })
    expect(result).toEqual({ success: true, data: { isBookmarked: true } })
    expect(mockPrisma.bookmark.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'user-1', roasteryId: 'r1' } })
    )
  })

  // U-40: 북마크 있음 → 제거 (toggle)
  it('U-40: 북마크가 있으면 제거하고 isBookmarked: false를 반환한다', async () => {
    mockAuth.mockResolvedValue(authedSession)
    mockPrisma.bookmark.findUnique.mockResolvedValue({ id: 'bm-1' })
    const result = await toggleBookmark({ roasteryId: 'r1' })
    expect(result).toEqual({ success: true, data: { isBookmarked: false } })
    expect(mockPrisma.bookmark.delete).toHaveBeenCalled()
  })
})

describe('removeBookmark', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.bookmark.delete.mockResolvedValue({})
  })

  // U-41: removeBookmark → 삭제
  it('U-41: 북마크를 삭제하고 success: true를 반환한다', async () => {
    mockAuth.mockResolvedValue(authedSession)
    const result = await removeBookmark({ roasteryId: 'r1' })
    expect(result).toEqual({ success: true })
    expect(mockPrisma.bookmark.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_roasteryId: { userId: 'user-1', roasteryId: 'r1' } },
      })
    )
  })

  it('미로그인 시 UNAUTHORIZED를 반환한다', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await removeBookmark({ roasteryId: 'r1' })
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'UNAUTHORIZED' })
  })
})
