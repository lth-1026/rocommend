import { describe, expect, it } from 'vitest'
import { cn, formatRegions, getRegionFromAddress, getRegionsFromLocations } from './utils'

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

describe('getRegionFromAddress', () => {
  it('서울특별시 주소에서 "서울"을 반환한다', () => {
    expect(getRegionFromAddress('서울특별시 마포구 도화동 179-9')).toBe('서울')
  })
  it('경기도 주소에서 "경기"를 반환한다', () => {
    expect(getRegionFromAddress('경기도 고양시 일산동구 정발산로')).toBe('경기')
  })
  it('충청북도 주소에서 "충북"을 반환한다', () => {
    expect(getRegionFromAddress('충청북도 청주시 흥덕구')).toBe('충북')
  })
  it('전북특별자치도 주소에서 "전북"을 반환한다', () => {
    expect(getRegionFromAddress('전북특별자치도 전주시 완산구')).toBe('전북')
  })
  it('전라북도 주소에서 "전북"을 반환한다', () => {
    expect(getRegionFromAddress('전라북도 전주시 완산구')).toBe('전북')
  })
  it('null 입력 시 null을 반환한다', () => {
    expect(getRegionFromAddress(null)).toBeNull()
  })
  it('매핑 불가 주소는 null을 반환한다', () => {
    expect(getRegionFromAddress('알 수 없는 주소')).toBeNull()
  })
})

describe('getRegionsFromLocations', () => {
  it('대표 지점 지역이 먼저 온다', () => {
    const locations = [
      { address: '부산광역시 해운대구', isPrimary: false },
      { address: '서울특별시 강남구', isPrimary: true },
    ]
    expect(getRegionsFromLocations(locations)).toEqual(['서울', '부산'])
  })
  it('같은 지역의 복수 지점은 중복 제거한다', () => {
    const locations = [
      { address: '서울특별시 강남구', isPrimary: true },
      { address: '서울특별시 마포구', isPrimary: false },
    ]
    expect(getRegionsFromLocations(locations)).toEqual(['서울'])
  })
  it('주소가 null인 지점은 무시한다', () => {
    const locations = [
      { address: null, isPrimary: true },
      { address: '부산광역시 해운대구', isPrimary: false },
    ]
    expect(getRegionsFromLocations(locations)).toEqual(['부산'])
  })
})
