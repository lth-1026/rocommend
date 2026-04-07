import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingWizard } from './OnboardingWizard'

const mockSubmitOnboarding = vi.hoisted(() => vi.fn())
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@/actions/onboarding', () => ({ submitOnboarding: mockSubmitOnboarding }))
vi.mock('sonner', () => ({ toast: mockToast }))

const roasteries = [
  {
    id: 'r1',
    name: '블루보틀',
    tags: [{ id: 't1', name: '서울', category: 'REGION', isPrimary: true }],
  },
  {
    id: 'r2',
    name: '프리츠',
    tags: [{ id: 't2', name: '서울', category: 'REGION', isPrimary: true }],
  },
  {
    id: 'r3',
    name: '센터커피',
    tags: [{ id: 't3', name: '부산', category: 'REGION', isPrimary: true }],
  },
]

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // submitOnboarding은 성공 시 redirect를 호출하므로 never return을 모방
    mockSubmitOnboarding.mockResolvedValue(undefined)
  })

  // C-20: 초기 렌더 → Q1 표시
  it('C-20: 초기 렌더 시 Q1 브루잉 방법 질문이 표시된다', () => {
    render(<OnboardingWizard roasteries={roasteries} />)
    expect(screen.getByText(/어떤 방법으로 커피를 즐기시나요/i)).toBeInTheDocument()
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  // C-21: Q1 선택 → 다음 버튼 활성화
  it('C-21: Q1에서 항목을 선택하면 다음 버튼이 활성화된다', async () => {
    render(<OnboardingWizard roasteries={roasteries} />)
    const nextButton = screen.getByRole('button', { name: '다음' })
    expect(nextButton).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: '에스프레소 머신' }))
    expect(nextButton).toBeEnabled()
  })

  // C-22: Q4=FIRST_TIME → Q5 스킵, 진행바 "4/4"
  it('C-22: Q4에서 FIRST_TIME을 선택하면 총 4단계가 되고 "완료 및 제출" 버튼이 표시된다', async () => {
    render(<OnboardingWizard roasteries={roasteries} />)

    // Q1
    await userEvent.click(screen.getByRole('button', { name: '에스프레소 머신' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))

    // Q2
    await userEvent.click(screen.getByRole('button', { name: '주로 온라인' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))

    // Q3
    await userEvent.click(screen.getByRole('button', { name: '크게 신경 안 써요' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))

    // Q4 - FIRST_TIME 선택
    await userEvent.click(screen.getByRole('button', { name: '처음 구매해보려고요' }))

    // 진행바 "4/4"
    expect(screen.getByText('4 / 4')).toBeInTheDocument()
    // "완료 및 제출" 버튼
    expect(screen.getByRole('button', { name: '완료 및 제출' })).toBeInTheDocument()
  })

  // C-23: Q4≠FIRST_TIME → Q5 표시, 진행바 "5/5"
  it('C-23: Q4에서 FIRST_TIME 외를 선택하고 다음으로 넘어가면 Q5가 표시된다', async () => {
    render(<OnboardingWizard roasteries={roasteries} />)

    // Q1
    await userEvent.click(screen.getByRole('button', { name: '에스프레소 머신' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))
    // Q2
    await userEvent.click(screen.getByRole('button', { name: '주로 온라인' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))
    // Q3
    await userEvent.click(screen.getByRole('button', { name: '크게 신경 안 써요' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))
    // Q4 - MONTHLY
    await userEvent.click(screen.getByRole('button', { name: '한 달에 한 번' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))

    // Q5
    expect(screen.getByText('5 / 5')).toBeInTheDocument()
    expect(screen.getByText(/좋아하는 로스터리/i)).toBeInTheDocument()
  })

  // C-24: Q5 3개 미만 → 제출 버튼 비활성
  it('C-24: Q5에서 3개 미만 선택 시 제출 버튼이 비활성 상태다', async () => {
    render(<OnboardingWizard roasteries={roasteries} />)

    // Q1~Q4 통과
    await userEvent.click(screen.getByRole('button', { name: '에스프레소 머신' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))
    await userEvent.click(screen.getByRole('button', { name: '주로 온라인' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))
    await userEvent.click(screen.getByRole('button', { name: '크게 신경 안 써요' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))
    await userEvent.click(screen.getByRole('button', { name: '한 달에 한 번' }))
    await userEvent.click(screen.getByRole('button', { name: '다음' }))

    const submitButton = screen.getByRole('button', { name: '완료 및 제출' })
    expect(submitButton).toBeDisabled()

    // 2개 선택
    await userEvent.click(screen.getByText('블루보틀'))
    await userEvent.click(screen.getByText('프리츠'))
    expect(submitButton).toBeDisabled()

    // 3개 선택 → 활성화
    await userEvent.click(screen.getByText('센터커피'))
    await waitFor(() => expect(submitButton).toBeEnabled())
  })
})
