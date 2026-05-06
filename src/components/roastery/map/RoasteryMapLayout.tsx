'use client'

import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, List, MapPin, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoasteryGrid } from '@/components/roastery/RoasteryGrid'
import { RoasteryDetail } from '@/components/roastery/RoasteryDetail'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { RoasteryWithStats, RoasteryDetail as RoasteryDetailType } from '@/types/roastery'
import type { RatingListItem, RatingSortOption } from '@/types/rating'
import type { MapMarkerData } from './RoasteryMapView'

// Naver Map을 SSR 없이 로드
const RoasteryMapView = dynamic(
  () => import('./RoasteryMapView').then((m) => ({ default: m.RoasteryMapView })),
  { ssr: false }
)

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SelectedRoasteryData {
  roastery: RoasteryDetailType
  isBookmarked: boolean
  userRating?: { score: number; comment?: string }
  initialRatings: RatingListItem[]
  initialNextCursor: string | null
  initialSort: RatingSortOption
}

interface Props {
  roasteries: RoasteryWithStats[]
  selectedDetail: SelectedRoasteryData | null
  isLoggedIn: boolean
  activeRegions: string[]
  listUrl: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RoasteryMapLayout({
  roasteries,
  selectedDetail,
  isLoggedIn,
  activeRegions,
  listUrl,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const [hoveredId, setHoveredId] = useState<string | undefined>()
  const [panelOpen, setPanelOpen] = useState(true)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [snapId, setSnapId] = useState<string | undefined>() // mobile map marker tap

  const selectedId = selectedDetail?.roastery.id

  // Extract markers from roasteries (locations with valid coordinates)
  const markers = useMemo<MapMarkerData[]>(() => {
    const result: MapMarkerData[] = []
    for (const r of roasteries) {
      for (const loc of r.locations) {
        if (loc.lat !== null && loc.lng !== null) {
          result.push({
            roasteryId: r.id,
            roasteryName: r.name,
            lat: loc.lat,
            lng: loc.lng,
            isPrimary: loc.isPrimary,
          })
        }
      }
    }
    return result
  }, [roasteries])

  const snapRoastery = useMemo(
    () => (snapId ? roasteries.find((r) => r.id === snapId) : undefined),
    [snapId, roasteries]
  )

  // URL helpers
  const buildUrl = useCallback(
    (id: string | null) => {
      const p = new URLSearchParams(searchParams.toString())
      if (id) p.set('id', id)
      else p.delete('id')
      return `/roasteries?${p.toString()}`
    },
    [searchParams]
  )

  const selectRoastery = useCallback(
    (roasteryId: string) => {
      if (isDesktop) {
        setPanelOpen(true)
        router.push(buildUrl(roasteryId), { scroll: false })
      } else {
        // mobile map: show snap card
        setSnapId(roasteryId)
      }
    },
    [isDesktop, router, buildUrl]
  )

  const clearSelection = useCallback(() => {
    router.push(buildUrl(null), { scroll: false })
    setSnapId(undefined)
  }, [router, buildUrl])

  const handleCardClick = useCallback(
    (roasteryId: string) => {
      if (isDesktop) {
        setPanelOpen(true)
        router.push(buildUrl(roasteryId), { scroll: false })
      }
      // mobile list: navigate to detail page directly
    },
    [isDesktop, router, buildUrl]
  )

  // ─── Desktop Layout ─────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="flex gap-0 h-[calc(100vh-120px)] min-h-[500px]">
        {/* Left panel */}
        {panelOpen && (
          <div className="w-[360px] xl:w-[420px] shrink-0 flex flex-col border-r overflow-hidden">
            {selectedDetail ? (
              <>
                {/* Detail panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-muted-foreground"
                    onClick={clearSelection}
                  >
                    <ChevronLeft className="size-4" />
                    목록
                  </Button>
                  <Link href={`/roasteries/${selectedDetail.roastery.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      자세히 보기
                      <ArrowUpRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
                {/* Detail content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <RoasteryDetail
                    roastery={selectedDetail.roastery}
                    isLoggedIn={isLoggedIn}
                    userRating={selectedDetail.userRating}
                    isBookmarked={selectedDetail.isBookmarked}
                    initialRatings={selectedDetail.initialRatings}
                    initialNextCursor={selectedDetail.initialNextCursor}
                    initialSort={selectedDetail.initialSort}
                    hideBackButton
                  />
                </div>
              </>
            ) : (
              <>
                {/* List panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                  <Link
                    href={listUrl}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="size-4" />
                    목록으로
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {roasteries.length}개 로스터리
                  </span>
                </div>
                {/* List content */}
                <div className="flex-1 overflow-y-auto">
                  <RoasteryGrid
                    roasteries={roasteries}
                    activeRegions={activeRegions}
                    variant="landscape"
                    onCardClick={handleCardClick}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Panel toggle button */}
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="relative z-10 flex items-center justify-center w-6 bg-background border-y border-r hover:bg-muted transition-colors shrink-0"
          aria-label={panelOpen ? '목록 닫기' : '목록 열기'}
        >
          {panelOpen ? (
            <ChevronLeft className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground" />
          )}
        </button>

        {/* Map */}
        <div className="flex-1 relative">
          <RoasteryMapView
            markers={markers}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onMarkerClick={selectRoastery}
            onMarkerHover={setHoveredId}
          />
        </div>
      </div>
    )
  }

  // ─── Mobile Layout ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      {/* Back to list */}
      <Link
        href={listUrl}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 self-start"
      >
        <ChevronLeft className="size-4" />
        목록으로
      </Link>

      {/* View toggle */}
      <div className="flex rounded-lg border overflow-hidden self-center mb-4">
        <button
          onClick={() => setMobileView('list')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${mobileView === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
        >
          <List className="size-4" />
          목록
        </button>
        <button
          onClick={() => setMobileView('map')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${mobileView === 'map' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
        >
          <MapPin className="size-4" />
          지도
        </button>
      </div>

      {mobileView === 'list' ? (
        <RoasteryGrid roasteries={roasteries} activeRegions={activeRegions} />
      ) : (
        <div className="relative" style={{ height: 'calc(100vh - 260px)', minHeight: 400 }}>
          <RoasteryMapView markers={markers} selectedId={snapId} onMarkerClick={selectRoastery} />

          {/* Snap card */}
          {snapRoastery && (
            <div className="absolute bottom-4 left-4 right-4 bg-background rounded-xl shadow-lg border p-4">
              <button
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                onClick={() => setSnapId(undefined)}
              >
                <X className="size-4" />
              </button>
              <Link href={`/roasteries/${snapRoastery.id}`} className="flex flex-col gap-1">
                <p className="font-medium text-sm pr-6">{snapRoastery.name}</p>
                <p className="text-xs text-muted-foreground">
                  {snapRoastery.locations[0]?.address ?? ''}
                </p>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
