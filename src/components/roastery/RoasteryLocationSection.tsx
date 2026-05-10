'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import type { LocationItem } from '@/types/roastery'

interface Props {
  primaryLocation: LocationItem | null
  otherLocations: LocationItem[]
  roasteryId: string
}

export function RoasteryLocationSection({ primaryLocation, otherLocations, roasteryId }: Props) {
  const [expanded, setExpanded] = useState(false)

  const hasAddress = primaryLocation?.address || otherLocations.some((l) => l.address)
  const hasMap =
    (primaryLocation?.lat != null && primaryLocation?.lng != null) ||
    otherLocations.some((l) => l.lat != null && l.lng != null)

  if (!hasAddress && !hasMap) return null

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {primaryLocation?.address && (
            <p className="text-xs text-muted-foreground/70">{primaryLocation.address}</p>
          )}
          {otherLocations.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              외 {otherLocations.length}개
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>
          )}
        </div>
        {hasMap && (
          <Link
            href={`/roasteries?view=map&id=${roasteryId}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <MapPin className="size-3.5" />
            지도 보기
          </Link>
        )}
      </div>

      {expanded && (
        <div className="flex flex-col gap-0.5 pt-0.5">
          {otherLocations
            .filter((l) => l.address)
            .map((loc) => (
              <p key={loc.id} className="text-xs text-muted-foreground/70">
                {loc.address}
              </p>
            ))}
        </div>
      )}
    </div>
  )
}
