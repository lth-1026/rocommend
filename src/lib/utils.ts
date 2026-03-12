import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 로스터리 지역 목록을 표시용 문자열로 변환
 *
 * - 단일 지역: "서울"
 * - 복수 + 필터 없음: "서울 외 2곳"
 * - 복수 + 비대표 지역이 필터에 해당: "서울 · 부산"
 *
 * @param regions 전체 지역 배열 (첫 번째 = 대표 지역)
 * @param filterRegions 현재 적용 중인 지역 필터 (없으면 undefined)
 */
export function toArray(val: string | string[] | undefined): string[] {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}

export function formatRegions(regions: string[], filterRegions?: string[]): string {
  if (regions.length === 0) return ''
  if (regions.length === 1) return regions[0]

  const primary = regions[0]
  const others = regions.slice(1)

  // 필터가 없거나 비대표 지역이 필터에 해당하지 않으면 "서울 외 N곳"
  if (!filterRegions || filterRegions.length === 0) {
    return `${primary} 외 ${others.length}곳`
  }

  // 비대표 지역 중 필터에 해당하는 것 추출
  const matchedOthers = others.filter((r) => filterRegions.includes(r))

  if (matchedOthers.length === 0) {
    return `${primary} 외 ${others.length}곳`
  }

  // 대표 지역 + 필터에 해당하는 비대표 지역 병기
  return [primary, ...matchedOthers].join(' · ')
}
