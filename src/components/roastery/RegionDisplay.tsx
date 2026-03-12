import { formatRegions } from '@/lib/utils'

interface RegionDisplayProps {
  regions: string[]
  activeRegions?: string[]
}

export function RegionDisplay({ regions, activeRegions }: RegionDisplayProps) {
  const text = formatRegions(regions, activeRegions)
  if (!text) return null
  return <span>{text}</span>
}
