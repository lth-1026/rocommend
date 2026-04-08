import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookmarkButton } from './BookmarkButton'

const mockToggleBookmark = vi.hoisted(() => vi.fn())
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@/actions/bookmark', () => ({ toggleBookmark: mockToggleBookmark }))
vi.mock('sonner', () => ({ toast: mockToast }))

describe('BookmarkButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToggleBookmark.mockResolvedValue({ success: true, data: { isBookmarked: true } })
  })

  // C-16: 북마크 없는 상태 → aria-label "즐겨찾기 추가"
  it('C-16: 북마크가 없으면 "즐겨찾기 추가" 레이블의 버튼이 렌더링된다', () => {
    render(<BookmarkButton roasteryId="r1" initialIsBookmarked={false} />)
    expect(screen.getByRole('button', { name: '즐겨찾기 추가' })).toBeInTheDocument()
  })

  // C-19: 북마크 있는 상태 → aria-label "즐겨찾기 해제"
  it('C-19: 북마크가 있으면 "즐겨찾기 해제" 레이블의 버튼이 렌더링된다', () => {
    render(<BookmarkButton roasteryId="r1" initialIsBookmarked={true} />)
    expect(screen.getByRole('button', { name: '즐겨찾기 해제' })).toBeInTheDocument()
  })

  // C-17: 클릭 → 즉시 낙관적 업데이트
  it('C-17: 클릭하면 서버 응답 전에 낙관적으로 상태가 토글된다', async () => {
    let resolve: (value: { success: boolean; data: { isBookmarked: boolean } }) => void
    mockToggleBookmark.mockReturnValue(
      new Promise((res) => {
        resolve = res
      })
    )

    render(<BookmarkButton roasteryId="r1" initialIsBookmarked={false} />)
    const button = screen.getByRole('button', { name: '즐겨찾기 추가' })

    await act(async () => {
      await userEvent.click(button)
    })

    // 낙관적 업데이트: 즉시 "즐겨찾기 해제"로 변경
    expect(screen.getByRole('button', { name: '즐겨찾기 해제' })).toBeInTheDocument()

    resolve!({ success: true, data: { isBookmarked: true } })
  })

  // C-18: 서버 실패 → toast.error 호출
  it('C-18: 서버 실패 시 toast.error를 호출한다', async () => {
    mockToggleBookmark.mockResolvedValue({ success: false, error: '서버 오류', code: 'DB_ERROR' })

    render(<BookmarkButton roasteryId="r1" initialIsBookmarked={false} />)
    await userEvent.click(screen.getByRole('button', { name: '즐겨찾기 추가' }))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('서버 오류')
    })
  })
})
