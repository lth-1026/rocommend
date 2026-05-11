import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 한국 주소 첫 부분 → 광역시/도 약어 매핑 (긴 prefix 먼저)
const ADDRESS_PREFIX_MAP: [prefix: string, region: string][] = [
  ['충청북도', '충북'],
  ['충청남도', '충남'],
  ['전북특별자치도', '전북'],
  ['전라북도', '전북'],
  ['전라남도', '전남'],
  ['경상북도', '경북'],
  ['경상남도', '경남'],
  ['강원특별자치도', '강원'],
  ['제주특별자치도', '제주'],
  ['서울', '서울'],
  ['부산', '부산'],
  ['대구', '대구'],
  ['인천', '인천'],
  ['광주', '광주'],
  ['대전', '대전'],
  ['울산', '울산'],
  ['세종', '세종'],
  ['경기', '경기'],
  ['강원', '강원'],
  ['제주', '제주'],
]

// 광역시/도 약어 → 주소 prefix 역방향 매핑 (필터 쿼리용)
const REGION_TO_PREFIXES: Record<string, string[]> = {
  서울: ['서울'],
  부산: ['부산'],
  대구: ['대구'],
  인천: ['인천'],
  광주: ['광주'],
  대전: ['대전'],
  울산: ['울산'],
  세종: ['세종'],
  경기: ['경기'],
  강원: ['강원특별자치도', '강원'],
  충북: ['충청북도'],
  충남: ['충청남도'],
  전북: ['전북특별자치도', '전라북도'],
  전남: ['전라남도'],
  경북: ['경상북도'],
  경남: ['경상남도'],
  제주: ['제주특별자치도', '제주'],
}

/** 한국 도로명/지번 주소에서 광역시/도 약어를 추출한다. 매핑 실패 시 null. */
export function getRegionFromAddress(address: string | null): string | null {
  if (!address) return null
  for (const [prefix, region] of ADDRESS_PREFIX_MAP) {
    if (address.startsWith(prefix)) return region
  }
  return null
}

/** 지역 약어를 Prisma address startsWith 조건용 prefix 배열로 변환한다. */
export function regionToAddressPrefixes(region: string): string[] {
  return REGION_TO_PREFIXES[region] ?? []
}

/** locations 배열에서 지역 약어 배열을 추출한다 (대표 지점 먼저). */
export function getRegionsFromLocations(
  locations: { address: string | null; isPrimary: boolean }[]
): string[] {
  const sorted = [...locations].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
  const seen = new Set<string>()
  const result: string[] = []
  for (const loc of sorted) {
    const region = getRegionFromAddress(loc.address)
    if (region && !seen.has(region)) {
      seen.add(region)
      result.push(region)
    }
  }
  return result
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
