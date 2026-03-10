import { describe, expect, it } from 'vitest'
import { cn, formatRegions } from './utils'

describe('cn', () => {
  it('클래스를 합친다', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('falsy 값을 제거한다', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })

  it('Tailwind 충돌 클래스를 병합한다', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})

describe('formatRegions', () => {
  // U-01: 단일 지역
  it('단일 지역은 그대로 반환한다', () => {
    expect(formatRegions(['서울'])).toBe('서울')
  })

  // U-02: 복수 지역, 필터 없음
  it('복수 지역에 필터가 없으면 "대표지역 외 N곳" 형식으로 반환한다', () => {
    expect(formatRegions(['서울', '부산', '제주'])).toBe('서울 외 2곳')
  })

  // U-03: 복수 지역, 비대표 지역이 필터에 해당
  it('비대표 지역이 필터에 해당하면 "대표 · 해당지역" 형식으로 반환한다', () => {
    expect(formatRegions(['서울', '부산'], ['부산'])).toBe('서울 · 부산')
  })

  // U-04: 3개 지역 중 마지막 지역이 필터에 해당
  it('3개 지역 중 마지막 지역이 필터에 해당하면 해당 지역만 병기한다', () => {
    expect(formatRegions(['서울', '부산', '제주'], ['제주'])).toBe('서울 · 제주')
  })

  // U-05: 빈 배열
  it('빈 배열이면 빈 문자열을 반환한다', () => {
    expect(formatRegions([])).toBe('')
  })

  // U-06: 단일 지역이 필터에 해당 (대표 지역 = 필터 지역)
  it('단일 지역이고 그 지역이 필터에 해당하면 지역명만 반환한다', () => {
    expect(formatRegions(['서울'], ['서울'])).toBe('서울')
  })
})
