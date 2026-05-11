'use client'

import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
  type TouchEvent,
} from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, List, MapPin, ChevronLeft, ChevronRight, Plus, Minus, LocateFixed } from 'lucide-react'
import { toast } from 'sonner'
import { RoasteryGrid } from '@/components/roastery/RoasteryGrid'
import { RoasteryCard } from '@/components/roastery/RoasteryCard'
import { RoasteryDetail } from '@/components/roastery/RoasteryDetail'
import { FilterPanel } from '@/components/roastery/FilterPanel'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { getNearbyLocations, formatDistance } from '@/lib/geo'
import type { NearbyLocation } from '@/lib/geo'
import type {
  RoasteryWithStats,
  RoasteryDetail as RoasteryDetailType,
  FilterParams,
  SortOption,
} from '@/types/roastery'
import type { RatingListItem, RatingSortOption } from '@/types/rating'
import type { MapMarkerData, ZoomHandle } from './RoasteryMapView'
import { staggerContainerVariants, fadeUpVariants } from '@/lib/motion'

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
  isFiltered: boolean
  mobileHeader?: ReactNode
  listUrl: string
  filter: FilterParams
  sort: SortOption
}

// ─── Session-level card position memory ──────────────────────────────────────

let savedCarouselIndex = 0
let savedSnapId: string | undefined = undefined
let savedNearbyMode = false
let savedNearbyLocations: NearbyLocation[] = []
let savedNearbyIndex = 0
let savedNearbySelectedId: string | undefined = undefined
let savedUserLocation: { lat: number; lng: number } | null = null

// ─── Component ───────────────────────────────────────────────────────────────

export function RoasteryMapLayout({
  roasteries,
  selectedDetail,
  isLoggedIn,
  activeRegions,
  isFiltered,
  mobileHeader,
  listUrl,
  filter,
  sort,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isXL = useMediaQuery('(min-width: 1280px)')
  const overlayWidthPx = isXL ? 400 : 360

  const [hoveredId, setHoveredId] = useState<string | undefined>()
  const [snapId, setSnapId] = useState<string | undefined>(
    selectedDetail?.roastery.id ?? savedSnapId
  )
  const [carouselIndex, setCarouselIndex] = useState(savedCarouselIndex)
  const [nearbyMode, setNearbyMode] = useState(savedNearbyMode)
  const [nearbyLocations, setNearbyLocations] = useState<NearbyLocation[]>(savedNearbyLocations)
  const [nearbyIndex, setNearbyIndex] = useState(savedNearbyIndex)
  const [nearbySelectedId, setNearbySelectedId] = useState<string | undefined>(
    savedNearbySelectedId
  )
  const [carouselDismissed, setCarouselDismissed] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    savedUserLocation
  )
  const [isGpsLoading, setIsGpsLoading] = useState(false)
  const [clickedAddress, setClickedAddress] = useState<string | null>(null)
  const touchStartX = useRef(0)
  const zoomRef = useRef<ZoomHandle | null>(null)
  const handleMapReady = useCallback((handle: ZoomHandle) => {
    zoomRef.current = handle
  }, [])

  const handleGpsClick = useCallback(() => {
    if (nearbyMode) {
      setNearbyMode(false)
      setNearbyLocations([])
      setNearbyIndex(0)
      setNearbySelectedId(undefined)
      setUserLocation(null)
      return
    }
    if (!navigator.geolocation) return
    setIsGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const nearby = getNearbyLocations(roasteries, lat, lng)
        setUserLocation({ lat, lng })
        setNearbyLocations(nearby)
        setNearbyIndex(0)
        setNearbySelectedId(nearby[0]?.roastery.id)
        setNearbyMode(true)
        zoomRef.current?.panTo(lat, lng, 14)
        zoomRef.current?.skipNextFlyTo()
        setIsGpsLoading(false)
      },
      (err) => {
        setIsGpsLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('위치 권한이 필요해요', {
            description: '브라우저 설정에서 위치 접근을 허용해주세요.',
          })
        } else {
          toast.error('위치를 가져올 수 없어요', { description: '잠시 후 다시 시도해주세요.' })
        }
      }
    )
  }, [nearbyMode, roasteries])

  useEffect(() => {
    savedCarouselIndex = carouselIndex
  }, [carouselIndex])
  useEffect(() => {
    savedSnapId = snapId
  }, [snapId])
  useEffect(() => {
    savedNearbyMode = nearbyMode
  }, [nearbyMode])
  useEffect(() => {
    savedNearbyLocations = nearbyLocations
  }, [nearbyLocations])
  useEffect(() => {
    savedNearbyIndex = nearbyIndex
  }, [nearbyIndex])
  useEffect(() => {
    savedNearbySelectedId = nearbySelectedId
  }, [nearbySelectedId])
  useEffect(() => {
    savedUserLocation = userLocation
  }, [userLocation])

  const selectedId = selectedDetail?.roastery.id

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
            address: loc.address,
          })
        }
      }
    }
    return result
  }, [roasteries])

  const nearbyMarkers = useMemo<MapMarkerData[]>(
    () =>
      nearbyLocations.map((item) => ({
        roasteryId: item.roastery.id,
        roasteryName: item.roastery.name,
        lat: item.location.lat!,
        lng: item.location.lng!,
        isPrimary: item.location.isPrimary,
        address: item.location.address,
      })),
    [nearbyLocations]
  )

  // 필터 결과가 바뀌면 캐러셀 인덱스 초기화 (React 공식 파생 상태 패턴)
  const roasteriesKey = useMemo(() => roasteries.map((r) => r.id).join(','), [roasteries])
  const [prevRoasteriesKey, setPrevRoasteriesKey] = useState(roasteriesKey)
  if (prevRoasteriesKey !== roasteriesKey) {
    setPrevRoasteriesKey(roasteriesKey)
    setCarouselIndex(0)
    setCarouselDismissed(false)
    if (nearbyMode) {
      setNearbyMode(false)
      setNearbyLocations([])
      setNearbyIndex(0)
      setNearbySelectedId(undefined)
      setUserLocation(null)
    }
  }

  const snapRoastery = useMemo(
    () => (snapId ? roasteries.find((r) => r.id === snapId) : undefined),
    [snapId, roasteries]
  )

  const carouselRoastery = isFiltered ? (roasteries[carouselIndex] ?? null) : null

  // 모바일에서 지도에 넘기는 selectedId (nearby: 카드 스와이프 시에만 fly-to)
  const mobileSelectedId = nearbyMode
    ? nearbySelectedId
    : isFiltered
      ? carouselDismissed
        ? undefined
        : carouselRoastery?.id
      : snapId

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
    (roasteryId: string, lat: number, lng: number) => {
      // 클릭한 마커의 주소 추적 (스냅 카드용)
      const clicked = markers.find(
        (m) => m.roasteryId === roasteryId && m.lat === lat && m.lng === lng
      )
      setClickedAddress(clicked?.address ?? null)

      if (isDesktop) {
        if (nearbyMode) {
          setNearbySelectedId(roasteryId)
          const idx = nearbyLocations.findIndex((item) => item.roastery.id === roasteryId)
          if (idx !== -1) setNearbyIndex(idx)
        }
        router.push(buildUrl(roasteryId), { scroll: false })
      } else if (nearbyMode) {
        router.push(`/roasteries/${roasteryId}`)
      } else if (isFiltered) {
        const idx = roasteries.findIndex((r) => r.id === roasteryId)
        if (idx !== -1) {
          setCarouselIndex(idx)
          setCarouselDismissed(false)
        }
      } else {
        setSnapId(roasteryId)
      }
    },
    [isDesktop, nearbyMode, nearbyLocations, isFiltered, roasteries, markers, router, buildUrl]
  )

  const clearSelection = useCallback(() => {
    router.push(buildUrl(null), { scroll: false })
    setSnapId(undefined)
    setNearbySelectedId(undefined)
  }, [router, buildUrl])

  const handleCardClick = useCallback(
    (roasteryId: string) => {
      if (isDesktop && !nearbyMode) {
        zoomRef.current?.clearSelection()
        router.push(buildUrl(roasteryId), { scroll: false })
      }
    },
    [isDesktop, nearbyMode, router, buildUrl]
  )

  const handleNearbyCardClick = useCallback(
    (roasteryId: string, lat: number, lng: number) => {
      const idx = nearbyLocations.findIndex(
        (item) =>
          item.roastery.id === roasteryId && item.location.lat === lat && item.location.lng === lng
      )
      if (idx === -1) return
      const item = nearbyLocations[idx]!
      setNearbyIndex(idx)
      setNearbySelectedId(roasteryId)
      zoomRef.current?.panTo(item.location.lat!, item.location.lng!, 15)
    },
    [nearbyLocations]
  )

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      const delta = e.changedTouches[0].clientX - touchStartX.current
      if (delta < -50 && carouselIndex < roasteries.length - 1) {
        setCarouselIndex((i) => i + 1)
      } else if (delta > 50 && carouselIndex > 0) {
        setCarouselIndex((i) => i - 1)
      }
    },
    [carouselIndex, roasteries.length]
  )

  // ─── Desktop Layout ─────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="relative flex gap-0 h-full min-h-[500px]">
        {/* Left panel — 항상 리스트 표시 */}
        <div className="w-[360px] xl:w-[400px] shrink-0 flex flex-col border-r overflow-hidden">
          {/* 검색 */}
          <div className="shrink-0 px-4 py-4 border-b">
            <FilterPanel filter={filter} sort={sort} isLoggedIn={isLoggedIn} variant="map-search" />
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            {nearbyMode ? (
              <span className="text-sm text-primary font-medium flex items-center gap-1">
                <LocateFixed className="size-3" />내 주변 {nearbyLocations.length}개 매장
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">{roasteries.length}개 로스터리</span>
            )}
            <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
              <Link
                href={listUrl}
                className="flex items-center justify-center w-7 h-6 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                aria-label="목록으로 보기"
              >
                <List className="size-3.5" />
              </Link>
              <span className="flex items-center justify-center w-7 h-6 rounded-md bg-background shadow-sm text-foreground">
                <MapPin className="size-3.5" />
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pt-2">
            {nearbyMode && nearbyLocations.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2 text-center">
                <p className="text-sm font-medium">주변 10km 내 매장이 없어요</p>
                <p className="text-xs text-muted-foreground">다른 지역에서 다시 시도해보세요</p>
              </div>
            ) : nearbyMode ? (
              <motion.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-4"
              >
                {nearbyLocations.map((item, i) => (
                  <motion.div
                    key={`${item.roastery.id}-${item.location.lat}-${item.location.lng}`}
                    variants={fadeUpVariants}
                  >
                    <RoasteryCard
                      roastery={item.roastery}
                      priority={i < 4}
                      variant="landscape"
                      nearbyAddress={item.location.address ?? undefined}
                      nearbyDistance={item.distance}
                      onCardClick={() =>
                        handleNearbyCardClick(
                          item.roastery.id,
                          item.location.lat!,
                          item.location.lng!
                        )
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : roasteries.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2 text-center">
                <p className="text-sm font-medium">찾는 로스터리가 없어요</p>
                <p className="text-xs text-muted-foreground">
                  필터를 조정하거나 검색어를 바꿔보세요.
                </p>
              </div>
            ) : (
              <RoasteryGrid
                roasteries={roasteries}
                activeRegions={activeRegions}
                variant="landscape"
                onCardClick={handleCardClick}
                singleCol
              />
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <RoasteryMapView
            markers={nearbyMode ? nearbyMarkers : markers}
            selectedId={nearbyMode ? nearbySelectedId : selectedId}
            primarySelectedId={selectedDetail?.roastery.id}
            hoveredId={hoveredId}
            onMarkerClick={selectRoastery}
            onMarkerHover={setHoveredId}
            onMapReady={handleMapReady}
            showZoomControl={false}
            userLocation={userLocation}
            overlayWidth={selectedDetail ? overlayWidthPx : 0}
          />
          {/* 필터 칩 오버레이 */}
          <div className="absolute top-4 left-4 right-14 z-10">
            <div className="flex items-center gap-2 w-max">
              <FilterPanel
                filter={filter}
                sort={sort}
                isLoggedIn={isLoggedIn}
                variant="map-pills"
              />
              <button
                onClick={handleGpsClick}
                disabled={isGpsLoading}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors shadow-md whitespace-nowrap disabled:opacity-50 ${
                  nearbyMode
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background hover:border-foreground/40'
                }`}
              >
                <LocateFixed className="size-3.5" />내 주변
              </button>
            </div>
          </div>
          {/* 줌 · GPS 버튼 */}
          <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-2">
            <div className="flex flex-col rounded-lg border bg-background shadow-md overflow-hidden">
              <button
                onClick={() => zoomRef.current?.zoomIn()}
                className="flex items-center justify-center w-9 h-9 hover:bg-muted transition-colors"
                aria-label="확대"
              >
                <Plus className="size-4" />
              </button>
              <div className="h-px bg-border" />
              <button
                onClick={() => zoomRef.current?.zoomOut()}
                className="flex items-center justify-center w-9 h-9 hover:bg-muted transition-colors"
                aria-label="축소"
              >
                <Minus className="size-4" />
              </button>
            </div>
            <button
              onClick={handleGpsClick}
              disabled={isGpsLoading}
              className={`flex items-center justify-center w-9 h-9 rounded-lg border shadow-md transition-colors disabled:opacity-50 ${nearbyMode ? 'bg-foreground text-background border-foreground hover:bg-foreground/90' : 'bg-background hover:bg-muted'}`}
              aria-label="내 주변 로스터리"
            >
              <LocateFixed className="size-4" />
            </button>
          </div>

          {/* nearby 모드: 결과 없음 */}

          {/* 상세 패널 오버레이 */}
          <AnimatePresence>
            {selectedDetail && (
              <motion.div
                className="absolute top-[60px] bottom-3 left-3 w-[360px] xl:w-[400px] bg-background z-20 shadow-2xl rounded-xl flex flex-col overflow-hidden"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <div className="flex items-center justify-end px-3 py-2 shrink-0">
                  <button
                    onClick={clearSelection}
                    className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="닫기"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-4">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // ─── Mobile Layout ───────────────────────────────────────────────────────────
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        height: 'calc(100svh - var(--bottom-tab-height) - env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* 페이지 헤더 (h1 + 필터) */}
      {mobileHeader && (
        <div className="shrink-0 bg-background border-b pt-8 pb-3 px-[var(--page-padding)]">
          {mobileHeader}
        </div>
      )}

      {/* 지도 */}
      <div className="flex-1 min-h-0 relative">
        <RoasteryMapView
          markers={nearbyMode ? nearbyMarkers : markers}
          selectedId={mobileSelectedId}
          primarySelectedId={mobileSelectedId}
          onMarkerClick={selectRoastery}
          showZoomControl={false}
          onMapReady={handleMapReady}
          userLocation={userLocation}
        />
        <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-2">
          <div className="flex flex-col rounded-lg border bg-background shadow-md overflow-hidden">
            <button
              onClick={() => zoomRef.current?.zoomIn()}
              className="flex items-center justify-center w-9 h-9 hover:bg-muted transition-colors"
              aria-label="확대"
            >
              <Plus className="size-4" />
            </button>
            <div className="h-px bg-border" />
            <button
              onClick={() => zoomRef.current?.zoomOut()}
              className="flex items-center justify-center w-9 h-9 hover:bg-muted transition-colors"
              aria-label="축소"
            >
              <Minus className="size-4" />
            </button>
          </div>
          <button
            onClick={handleGpsClick}
            disabled={isGpsLoading}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border shadow-md transition-colors disabled:opacity-50 ${nearbyMode ? 'bg-foreground text-background border-foreground hover:bg-foreground/90' : 'bg-background hover:bg-muted'}`}
            aria-label="내 주변 로스터리"
          >
            <LocateFixed className="size-4" />
          </button>
        </div>
      </div>

      {/* FAB + 캐러셀 / 스냅 카드 */}
      <div
        className="absolute left-4 right-4 z-50 flex flex-col gap-4 items-end pointer-events-none"
        style={{ bottom: '20px' }}
      >
        <Link
          href={listUrl}
          className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="목록으로 보기"
        >
          <List className="size-5" />
        </Link>

        {/* 내 주변 모드: 결과 없음 */}
        {nearbyMode && nearbyLocations.length === 0 && (
          <div className="pointer-events-auto w-full bg-background rounded-2xl shadow-lg border px-4 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">주변 10km 내 매장이 없어요</p>
            <button
              onClick={() => {
                setNearbyMode(false)
                setUserLocation(null)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* 내 주변 모드: 캐러셀 카드 */}
        {nearbyMode &&
          nearbyLocations.length > 0 &&
          (() => {
            const item = nearbyLocations[nearbyIndex]
            return item ? (
              <div
                className="pointer-events-auto relative w-full bg-background rounded-2xl shadow-lg border px-4 pt-5 pb-0"
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => {
                  const delta = e.changedTouches[0].clientX - touchStartX.current
                  if (delta < -50 && nearbyIndex < nearbyLocations.length - 1) {
                    const next = nearbyIndex + 1
                    const nextItem = nearbyLocations[next]!
                    setNearbyIndex(next)
                    setNearbySelectedId(nextItem.roastery.id)
                    zoomRef.current?.panTo(nextItem.location.lat!, nextItem.location.lng!, 15)
                  } else if (delta > 50 && nearbyIndex > 0) {
                    const prev = nearbyIndex - 1
                    const prevItem = nearbyLocations[prev]!
                    setNearbyIndex(prev)
                    setNearbySelectedId(prevItem.roastery.id)
                    zoomRef.current?.panTo(prevItem.location.lat!, prevItem.location.lng!, 15)
                  }
                }}
              >
                <button
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setNearbyMode(false)
                    setNearbyLocations([])
                    setNearbyIndex(0)
                    setNearbySelectedId(undefined)
                    setUserLocation(null)
                  }}
                >
                  <X className="size-4" />
                </button>
                {nearbyIndex > 0 && (
                  <button
                    className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-background border shadow-sm"
                    onClick={() => {
                      const prev = nearbyIndex - 1
                      setNearbyIndex(prev)
                      setNearbySelectedId(nearbyLocations[prev]?.roastery.id)
                    }}
                    aria-label="이전 매장"
                  >
                    <ChevronLeft className="size-3 text-muted-foreground" />
                  </button>
                )}
                {nearbyIndex < nearbyLocations.length - 1 && (
                  <button
                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-background border shadow-sm"
                    onClick={() => {
                      const next = nearbyIndex + 1
                      setNearbyIndex(next)
                      setNearbySelectedId(nearbyLocations[next]?.roastery.id)
                    }}
                    aria-label="다음 매장"
                  >
                    <ChevronRight className="size-3 text-muted-foreground" />
                  </button>
                )}
                <Link
                  href={`/roasteries/${item.roastery.id}`}
                  className="flex w-full flex-col gap-1 pr-6"
                >
                  <p className="font-medium text-base leading-tight">
                    {item.roastery.name}
                    <span className="ml-1.5 text-xs text-primary font-medium">
                      {formatDistance(item.distance)}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">{item.location.address}</p>
                </Link>
                <div className="flex h-4 items-center justify-center">
                  {nearbyLocations.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      {nearbyIndex + 1} / {nearbyLocations.length}
                    </span>
                  )}
                </div>
              </div>
            ) : null
          })()}

        {/* 필터 활성: 캐러셀 카드 */}
        {!nearbyMode && isFiltered && carouselRoastery && !carouselDismissed && (
          <div
            className="pointer-events-auto relative w-full bg-background rounded-2xl shadow-lg border px-4 pt-4 pb-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              onClick={() => setCarouselDismissed(true)}
            >
              <X className="size-4" />
            </button>
            {carouselIndex > 0 && (
              <button
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-background border shadow-sm"
                onClick={() => setCarouselIndex((i) => i - 1)}
                aria-label="이전 로스터리"
              >
                <ChevronLeft className="size-3 text-muted-foreground" />
              </button>
            )}
            {carouselIndex < roasteries.length - 1 && (
              <button
                className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-background border shadow-sm"
                onClick={() => setCarouselIndex((i) => i + 1)}
                aria-label="다음 로스터리"
              >
                <ChevronRight className="size-3 text-muted-foreground" />
              </button>
            )}
            <div>
              <Link href={`/roasteries/${carouselRoastery.id}`} className="flex flex-col gap-1">
                <p className="font-medium text-base">{carouselRoastery.name}</p>
                <p className="text-sm text-muted-foreground">
                  {carouselRoastery.locations[0]?.address ?? ''}
                </p>
              </Link>
            </div>
            <div className="flex h-4 items-center justify-center">
              {roasteries.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {carouselIndex + 1} / {roasteries.length}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 필터 없음: 기존 스냅 카드 */}
        {!nearbyMode && !isFiltered && snapRoastery && (
          <div className="pointer-events-auto w-full bg-background rounded-2xl shadow-lg border p-4 relative">
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              onClick={() => setSnapId(undefined)}
            >
              <X className="size-4" />
            </button>
            <Link href={`/roasteries/${snapRoastery.id}`} className="flex flex-col gap-1">
              <p className="font-medium text-base pr-6">{snapRoastery.name}</p>
              <p className="text-sm text-muted-foreground">
                {clickedAddress ?? snapRoastery.locations[0]?.address ?? ''}
              </p>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
