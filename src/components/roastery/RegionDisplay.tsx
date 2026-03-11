interface RegionDisplayProps {
  regions: string[]
}

export function RegionDisplay({ regions }: RegionDisplayProps) {
  if (regions.length === 0) return null
  if (regions.length === 1) return <span>{regions[0]}</span>
  return (
    <span>
      {regions[0]} 외 {regions.length - 1}곳
    </span>
  )
}
