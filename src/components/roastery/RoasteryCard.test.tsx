import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoasteryCard } from './RoasteryCard'
import type { RoasteryWithStats } from '@/types/roastery'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}))

function makeRoastery(overrides: Partial<RoasteryWithStats> = {}): RoasteryWithStats {
  return {
    id: 'r1',
    name: '테스트 로스터리',
    description: null,
    tags: [],
    locations: [],
    priceRange: 'MID',
    decaf: false,
    imageUrl: null,
    website: null,
    avgRating: null,
    ratingCount: 0,
    ...overrides,
  }
}

function makeTagItem(name: string, category: 'REGION' | 'CHARACTERISTIC', isPrimary = true) {
  return {
    id: `tag-${name}`,
    name,
    category: category as import('@/types/roastery').TagCategory,
    isPrimary,
  }
}

describe('RoasteryCard', () => {
  // C-01: 이름 렌더링
  it('C-01: 로스터리 이름이 렌더링된다', () => {
    render(<RoasteryCard roastery={makeRoastery({ name: '블루보틀 서울' })} />)
    expect(screen.getByText('블루보틀 서울')).toBeInTheDocument()
  })

  // C-02: 단일 지역 표시
  it('C-02: 단일 지역이 그대로 표시된다', () => {
    const roastery = makeRoastery({
      tags: [makeTagItem('서울', 'REGION', true)],
    })
    render(<RoasteryCard roastery={roastery} />)
    expect(screen.getByText('서울')).toBeInTheDocument()
  })

  // C-03: 복수 지역 "서울 외 N곳" 표시
  it('C-03: 복수 지역이면 "서울 외 N곳" 형식으로 표시된다', () => {
    const roastery = makeRoastery({
      tags: [
        makeTagItem('서울', 'REGION', true),
        makeTagItem('부산', 'REGION', false),
        makeTagItem('제주', 'REGION', false),
      ],
    })
    render(<RoasteryCard roastery={roastery} />)
    expect(screen.getByText('서울 외 2곳')).toBeInTheDocument()
  })

  // C-04: 가격대(LOW/MID/HIGH) 렌더링
  it('C-04: 가격대 레이블이 렌더링된다', () => {
    render(<RoasteryCard roastery={makeRoastery({ priceRange: 'HIGH' })} />)
    expect(screen.getByText('3.5만원 이상')).toBeInTheDocument()
  })

  // C-05: 평균 평점 표시
  it('C-05: 평균 평점과 평가 수가 표시된다', () => {
    const roastery = makeRoastery({ avgRating: 4.3, ratingCount: 12 })
    render(<RoasteryCard roastery={roastery} />)
    expect(screen.getByText(/4\.3/)).toBeInTheDocument()
    expect(screen.getByText(/12/)).toBeInTheDocument()
  })

  // C-06: 디카페인 배지 표시/미표시
  it('C-06: decaf=true이면 디카페인 배지가 표시된다', () => {
    render(<RoasteryCard roastery={makeRoastery({ decaf: true })} />)
    expect(screen.getByText('디카페인')).toBeInTheDocument()
  })

  it('C-06b: decaf=false이면 디카페인 배지가 표시되지 않는다', () => {
    render(<RoasteryCard roastery={makeRoastery({ decaf: false })} />)
    expect(screen.queryByText('디카페인')).not.toBeInTheDocument()
  })

  // C-07: 링크가 /roasteries/:id 포함
  it('C-07: 로스터리 상세 링크가 포함된다', () => {
    render(<RoasteryCard roastery={makeRoastery({ id: 'r-abc' })} />)
    const links = screen.getAllByRole('link')
    const roasteryLink = links.find((l) => l.getAttribute('href') === '/roasteries/r-abc')
    expect(roasteryLink).toBeDefined()
    expect(roasteryLink).toHaveAttribute('href', '/roasteries/r-abc')
  })

  // C-08: 평점 0개 처리
  it('C-08: 평가가 없으면 "아직 평가 없음"이 표시된다', () => {
    render(<RoasteryCard roastery={makeRoastery({ ratingCount: 0, avgRating: null })} />)
    expect(screen.getByText('아직 평가 없음')).toBeInTheDocument()
  })
})
