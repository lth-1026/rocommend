import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Navigation } from './Navigation'

// next/navigation 모킹
vi.mock('next/navigation', () => ({
  usePathname: () => '/home',
}))

// next-auth/react 모킹
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: '테스트', image: null } } }),
  signOut: vi.fn(),
}))

// next/image 모킹 (eslint no-img-element 우회: 테스트 전용 stub)
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

// FeedbackButton / FeedbackForm은 서버 액션·next-auth 내부를 로드하므로 렌더링 테스트에서는 stub 처리
vi.mock('@/components/feedback/FeedbackButton', () => ({ FeedbackButton: () => null }))
vi.mock('@/components/feedback/FeedbackForm', () => ({ FeedbackForm: () => null }))

describe('Navigation', () => {
  // C-25: lg 미만 화면 — BottomTab 표시, Header 숨김
  it('Header는 lg 미만에서 hidden 클래스를 갖는다', () => {
    const { container } = render(<Navigation />)
    const header = container.querySelector('header')
    expect(header?.className).toContain('hidden')
    expect(header?.className).toContain('lg:flex')
  })

  // C-26: lg 이상 화면 — Header 표시, BottomTab 숨김
  it('BottomTab은 lg 이상에서 hidden 클래스를 갖는다', () => {
    const { container } = render(<Navigation />)
    // BottomTab은 fixed bottom-0 클래스를 가진 nav — Header 내부 nav와 구분
    const bottomTabNav = container.querySelector('nav[class*="fixed"]')
    expect(bottomTabNav?.className).toContain('lg:hidden')
  })
})
