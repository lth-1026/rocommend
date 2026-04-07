import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RatingForm } from './RatingForm'

const mockUpsertRating = vi.hoisted(() => vi.fn())
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@/actions/rating', () => ({ upsertRating: mockUpsertRating }))
vi.mock('sonner', () => ({ toast: mockToast }))

describe('RatingForm', () => {
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpsertRating.mockResolvedValue({ success: true })
  })

  // C-09: 별점 미선택 시 제출 버튼 비활성
  it('C-09: 별점을 선택하지 않으면 제출 버튼이 비활성 상태다', () => {
    render(<RatingForm roasteryId="r1" onSuccess={onSuccess} />)
    const button = screen.getByRole('button', { name: '평가 저장' })
    expect(button).toBeDisabled()
  })

  // C-10: 별 클릭 → 선택 상태 시각적 변화 및 버튼 활성화
  it('C-10: 별 클릭 후 제출 버튼이 활성화된다', async () => {
    render(<RatingForm roasteryId="r1" onSuccess={onSuccess} />)
    const starButton = screen.getByRole('button', { name: '4점' })
    await userEvent.click(starButton)
    const submitButton = screen.getByRole('button', { name: '평가 저장' })
    expect(submitButton).toBeEnabled()
  })

  // C-11: 한줄평 textarea에 maxLength=100 속성이 있다
  it('C-11: 한줄평 textarea는 maxLength=100 속성을 갖는다', () => {
    render(<RatingForm roasteryId="r1" onSuccess={onSuccess} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('maxLength', '100')
  })

  // C-12: 정상 제출 → upsertRating 호출
  it('C-12: 별점 선택 후 제출하면 upsertRating이 호출된다', async () => {
    render(<RatingForm roasteryId="r1" onSuccess={onSuccess} />)
    await userEvent.click(screen.getByRole('button', { name: '5점' }))
    fireEvent.submit(screen.getByRole('button', { name: '평가 저장' }).closest('form')!)
    await waitFor(() => {
      expect(mockUpsertRating).toHaveBeenCalledWith({
        roasteryId: 'r1',
        score: 5,
        comment: undefined,
      })
    })
  })

  // C-13: 제출 중 로딩 상태
  it('C-13: 제출 중에는 버튼 텍스트가 "저장 중..."으로 바뀐다', async () => {
    let resolve: (value: { success: boolean }) => void
    mockUpsertRating.mockReturnValue(
      new Promise((res) => {
        resolve = res
      })
    )
    render(<RatingForm roasteryId="r1" onSuccess={onSuccess} />)
    await userEvent.click(screen.getByRole('button', { name: '5점' }))
    fireEvent.submit(screen.getByRole('button', { name: '평가 저장' }).closest('form')!)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '저장 중...' })).toBeInTheDocument()
    })
    resolve!({ success: true })
  })

  // C-14: 에러 응답 → 에러 메시지 표시
  it('C-14: 서버 에러 시 toast.error를 호출한다', async () => {
    mockUpsertRating.mockResolvedValue({ success: false, error: '저장 실패', code: 'DB_ERROR' })
    render(<RatingForm roasteryId="r1" onSuccess={onSuccess} />)
    await userEvent.click(screen.getByRole('button', { name: '3점' }))
    fireEvent.submit(screen.getByRole('button', { name: '평가 저장' }).closest('form')!)
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('저장 실패')
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  // C-15: 기존 평가 있을 때 초기값 채워짐
  it('C-15: initialScore와 initialComment가 폼에 채워진다', () => {
    render(
      <RatingForm
        roasteryId="r1"
        initialScore={4}
        initialComment="맛있어요"
        onSuccess={onSuccess}
      />
    )
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('맛있어요')
    // 제출 버튼이 활성화돼 있어야 함 (초기 score=4)
    expect(screen.getByRole('button', { name: '평가 저장' })).toBeEnabled()
  })
})
