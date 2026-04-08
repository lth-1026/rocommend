import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { testPrisma, cleanDb } from '@/tests/db-helpers'

const mockAuth = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))

const { toggleBookmark, removeBookmark } = await import('@/actions/bookmark')

let userId: string
let roasteryId: string

beforeAll(async () => {
  const roastery = await testPrisma.roastery.create({
    data: { name: 'Bookmark Test Roastery', priceRange: 'MID' },
  })
  roasteryId = roastery.id
})

beforeEach(async () => {
  await cleanDb()
  const user = await testPrisma.user.create({
    data: { email: 'test-bookmark@example.com', name: '북마크테스트' },
  })
  userId = user.id
  mockAuth.mockResolvedValue({ user: { id: userId } })
})

afterAll(async () => {
  await testPrisma.roastery.delete({ where: { id: roasteryId } })
  await testPrisma.$disconnect()
})

describe('toggleBookmark (integration)', () => {
  // I-10: 북마크 추가
  it('I-10: 북마크가 없으면 생성되고 DB에 저장된다', async () => {
    const result = await toggleBookmark({ roasteryId })
    expect(result).toEqual({ success: true, data: { isBookmarked: true } })

    const bookmark = await testPrisma.bookmark.findUnique({
      where: { userId_roasteryId: { userId, roasteryId } },
    })
    expect(bookmark).not.toBeNull()
  })

  // I-10: 북마크 제거
  it('I-10b: 북마크가 있으면 제거되고 DB에서 삭제된다', async () => {
    await testPrisma.bookmark.create({ data: { userId, roasteryId } })

    const result = await toggleBookmark({ roasteryId })
    expect(result).toEqual({ success: true, data: { isBookmarked: false } })

    const bookmark = await testPrisma.bookmark.findUnique({
      where: { userId_roasteryId: { userId, roasteryId } },
    })
    expect(bookmark).toBeNull()
  })

  // I-11: removeBookmark
  it('I-11: removeBookmark는 북마크를 삭제한다', async () => {
    await testPrisma.bookmark.create({ data: { userId, roasteryId } })

    const result = await removeBookmark({ roasteryId })
    expect(result).toEqual({ success: true })

    const count = await testPrisma.bookmark.count({ where: { userId, roasteryId } })
    expect(count).toBe(0)
  })
})
