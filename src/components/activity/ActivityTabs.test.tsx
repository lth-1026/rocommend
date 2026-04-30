import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityTabs } from './ActivityTabs'

const mockGet = vi.fn(() => null)
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: mockGet }),
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/components/profile/MyRatingList', () => ({
  MyRatingList: () => <div data-testid="my-rating-list" />,
}))

vi.mock('@/components/bookmark/BookmarkList', () => ({
  BookmarkList: () => <div data-testid="bookmark-list" />,
}))

vi.mock('@/components/bookmark/EmptyBookmark', () => ({
  EmptyBookmark: () => <div data-testid="empty-bookmark" />,
}))

const emptyRatings = { items: [], nextCursor: null }

describe('ActivityTabs', () => {
  // C-27: tab 파라미터 없으면 내 평가 탭이 활성 상태
  it('기본 탭은 내 평가다', () => {
    mockGet.mockReturnValue(null)
    render(<ActivityTabs ratings={emptyRatings} bookmarks={[]} />)
    const ratingsBtn = screen.getByRole('button', { name: '내 평가' })
    expect(ratingsBtn.className).toContain('border-b-2')
    expect(screen.getByTestId('my-rating-list')).toBeDefined()
  })

  // C-28: tab=bookmarks일 때 즐겨찾기 탭 활성 + EmptyBookmark 표시
  it('tab=bookmarks이면 즐겨찾기 탭이 활성이고 빈 상태를 보여준다', () => {
    mockGet.mockReturnValue('bookmarks')
    render(<ActivityTabs ratings={emptyRatings} bookmarks={[]} />)
    const bookmarksBtn = screen.getByRole('button', { name: '즐겨찾기' })
    expect(bookmarksBtn.className).toContain('border-b-2')
    expect(screen.getByTestId('empty-bookmark')).toBeDefined()
  })

  // C-29: tab=bookmarks이고 북마크가 있으면 BookmarkList 표시
  it('tab=bookmarks이고 북마크가 있으면 BookmarkList를 보여준다', () => {
    mockGet.mockReturnValue('bookmarks')
    const bookmarks = [{ id: '1' }] as never
    render(<ActivityTabs ratings={emptyRatings} bookmarks={bookmarks} />)
    expect(screen.getByTestId('bookmark-list')).toBeDefined()
  })
})
