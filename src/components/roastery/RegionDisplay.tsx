interface RegionDisplayProps {
  regions: string[]
  activeRegions?: string[]
}

export function RegionDisplay({ regions, activeRegions }: RegionDisplayProps) {
  if (regions.length === 0) return null
  if (regions.length === 1) return <span>{regions[0]}</span>

  // 필터 없거나 대표 지역(첫 번째)이 필터에 해당하면 "서울 외 n곳"
  if (!activeRegions || activeRegions.length === 0 || activeRegions.includes(regions[0])) {
    return (
      <span>
        {regions[0]} 외 {regions.length - 1}곳
      </span>
    )
  }

  // 대표 지역이 아닌 지역이 필터에 해당하면 "대표지역 · 매치지역" 병기
  const matchedNonPrimary = regions.slice(1).find((r) => activeRegions.includes(r))
  if (matchedNonPrimary) {
    return (
      <span>
        {regions[0]} · {matchedNonPrimary}
      </span>
    )
  }

  return (
    <span>
      {regions[0]} 외 {regions.length - 1}곳
    </span>
  )
}
