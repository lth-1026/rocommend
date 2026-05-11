'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import Script from 'next/script'

// ─── Minimal Naver Maps type declarations ────────────────────────────────────

type NaverLatLng = object
type NaverSize = object
type NaverPoint = object

interface NaverMapInstance {
  setCenter(latLng: NaverLatLng): void
  setZoom(zoom: number, animate?: boolean): void
  getZoom(): number
  getCenter(): { lat(): number; lng(): number }
  fitBounds(bounds: object, opts?: object): void
  morph(latLng: NaverLatLng, zoom?: number): void
  destroy(): void
}

interface NaverMarkerInstance {
  setIcon(icon: object): void
  setZIndex(z: number): void
  setMap(map: NaverMapInstance | null): void
  getPosition(): NaverLatLng
}

interface NaverMapsAPI {
  Map: new (el: HTMLElement, opts: object) => NaverMapInstance
  Marker: new (opts: object) => NaverMarkerInstance
  LatLng: new (lat: number, lng: number) => NaverLatLng
  LatLngBounds: new (
    sw?: NaverLatLng,
    ne?: NaverLatLng
  ) => {
    extend(latLng: NaverLatLng): void
  }
  Size: new (w: number, h: number) => NaverSize
  Point: new (x: number, y: number) => NaverPoint
  Event: {
    addListener(target: object, type: string, fn: (...args: unknown[]) => void): object
  }
}

declare global {
  interface Window {
    naver?: { maps: NaverMapsAPI }
  }
}

// ─── Session-level map position memory ───────────────────────────────────────

let savedMapView: { lat: number; lng: number; zoom: number } | null = null

// ─── Props & marker data ─────────────────────────────────────────────────────

export interface MapMarkerData {
  roasteryId: string
  roasteryName: string
  lat: number
  lng: number
  isPrimary: boolean
  address: string
}

export interface ZoomHandle {
  zoomIn: () => void
  zoomOut: () => void
  panTo: (lat: number, lng: number, zoom?: number) => void
  skipNextFlyTo: () => void
  clearSelection: () => void
}

interface Props {
  markers: MapMarkerData[]
  selectedId?: string
  primarySelectedId?: string
  hoveredId?: string
  onMarkerClick: (roasteryId: string, lat: number, lng: number) => void
  onMarkerHover?: (roasteryId: string | undefined) => void
  showZoomControl?: boolean
  onMapReady?: (handle: ZoomHandle) => void
  userLocation?: { lat: number; lng: number } | null
  overlayWidth?: number
}

// ─── Fit-view helper (morph 애니메이션용 중심점·줌 계산) ────────────────────────

const PAD = { top: 60, right: 20, bottom: 60, left: 20 }

// overlayWidth: 지도 왼쪽을 가리는 패널 너비(px). 보이는 영역 중앙에 마커가 오도록 lng 오프셋 적용.
function computeFitView(
  markers: MapMarkerData[],
  container: HTMLElement,
  overlayWidth = 0
): { lat: number; lng: number; zoom: number } {
  const lats = markers.map((m) => m.lat)
  const lngs = markers.map((m) => m.lng)
  const maxLat = Math.max(...lats)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const minLng = Math.min(...lngs)
  const centerLat = (maxLat + minLat) / 2
  const centerLng = (maxLng + minLng) / 2

  // 오버레이가 왼쪽을 overlayWidth px 가리므로 마커를 보이는 영역 중앙(화면 중앙 + overlayWidth/2)에 두려면
  // 카메라 중심을 마커보다 서쪽(경도 -)으로 이동 → marker.lng - offset = cameraCenter.lng
  const lngOffset = (z: number) => (overlayWidth / 2) * (360 / (256 * 2 ** z))

  const leftPad = PAD.left + overlayWidth
  const availW = container.clientWidth - leftPad - PAD.right
  const availH = container.clientHeight - PAD.top - PAD.bottom

  if (markers.length === 1) {
    return { lat: centerLat, lng: centerLng - lngOffset(16), zoom: 16 }
  }

  if (availW <= 0 || availH <= 0) {
    return { lat: centerLat, lng: centerLng - lngOffset(11), zoom: 11 }
  }

  const TILE = 256
  const lngToX = (lng: number, z: number) => ((lng + 180) / 360) * TILE * 2 ** z
  const latToY = (lat: number, z: number) => {
    const sin = Math.sin((lat * Math.PI) / 180)
    return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * TILE * 2 ** z
  }

  for (let z = 21; z >= 1; z--) {
    const dx = Math.abs(lngToX(maxLng, z) - lngToX(minLng, z))
    const dy = Math.abs(latToY(maxLat, z) - latToY(minLat, z))
    if (dx <= availW && dy <= availH)
      return { lat: centerLat, lng: centerLng - lngOffset(z), zoom: z }
  }

  return { lat: centerLat, lng: centerLng - lngOffset(1), zoom: 1 }
}

// ─── Marker icon helper ───────────────────────────────────────────────────────

function markerIcon(selected: boolean, hovered: boolean, primarySelected = false) {
  const size = primarySelected ? 32 : selected ? 24 : hovered ? 26 : 20
  const nv = window.naver!
  return {
    content: `<div style="width:${size}px;height:${size}px;background:${selected ? '#fff' : '#1A1917'};border:${selected ? '2px solid #1A1917' : 'none'};border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;font-size:${Math.round(size * 0.55)}px;display:flex;align-items:center;justify-content:center;overflow:hidden;">☕️</div>`,
    size: new nv.maps.Size(size, size),
    anchor: new nv.maps.Point(size / 2, size / 2),
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const NCPKEY = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID!

export function RoasteryMapView({
  markers,
  selectedId,
  primarySelectedId,
  hoveredId,
  onMarkerClick,
  onMarkerHover,
  showZoomControl = true,
  onMapReady,
  userLocation,
  overlayWidth = 0,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<NaverMapInstance | null>(null)
  const showZoomControlRef = useRef(showZoomControl)
  const onMapReadyRef = useRef(onMapReady)
  const userLocationMarkerRef = useRef<NaverMarkerInstance | null>(null)
  useEffect(() => {
    onMapReadyRef.current = onMapReady
  }, [onMapReady])
  const markerMapRef = useRef<Map<string, NaverMarkerInstance[]>>(new Map())
  const clickedPosRef = useRef<{ lat: number; lng: number } | null>(null)
  const markersKeyRef = useRef<string>('')
  const justFitBoundsRef = useRef(false)
  const prevSelectedIdRef = useRef<string | undefined>(undefined)
  const restoredFromSavedRef = useRef(!!savedMapView)
  const [selection, setSelection] = useState<{
    roasteryId: string
    lat: number
    lng: number
  } | null>(null)
  const clearSelectionRef = useRef<() => void>(() => setSelection(null))
  const [mapReady, setMapReady] = useState(false)

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current || !window.naver?.maps) return
    const nv = window.naver.maps

    const initialCenter = savedMapView
      ? new nv.LatLng(savedMapView.lat, savedMapView.lng)
      : new nv.LatLng(37.5665, 126.978)
    const initialZoom = savedMapView?.zoom ?? 11

    const map = new nv.Map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
      zoomControl: showZoomControlRef.current,
      zoomControlOptions: { position: 3 /* TOP_RIGHT */ },
    })

    nv.Event.addListener(map, 'idle', () => {
      const center = map.getCenter()
      savedMapView = { lat: center.lat(), lng: center.lng(), zoom: map.getZoom() }
    })

    mapRef.current = map
    onMapReadyRef.current?.({
      zoomIn: () => map.setZoom(map.getZoom() + 1, true),
      zoomOut: () => map.setZoom(map.getZoom() - 1, true),
      panTo: (lat: number, lng: number, zoom?: number) => {
        const latLng = new nv.LatLng(lat, lng)
        if (zoom !== undefined) map.morph(latLng, zoom)
        else map.setCenter(latLng)
      },
      skipNextFlyTo: () => {
        justFitBoundsRef.current = true
      },
      clearSelection: () => clearSelectionRef.current(),
    })
    setMapReady(true)
  }, [])

  const handleScriptLoad = useCallback(() => {
    initMap()
  }, [initMap])

  // Sync markers whenever data or selection changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.naver?.maps) return
    const nv = window.naver.maps
    const map = mapRef.current
    const markerMap = markerMapRef.current

    // Clear existing markers
    for (const list of markerMap.values()) {
      for (const m of list) m.setMap(null)
    }
    markerMap.clear()

    // Add fresh markers
    for (const data of markers) {
      const isSelected = data.roasteryId === selectedId
      // 사용자가 이 로스터리의 특정 마커를 클릭한 적이 있으면 true
      const hasExplicitSelection = selection?.roasteryId === selectedId
      const isPrimarySelected =
        isSelected &&
        (hasExplicitSelection
          ? data.lat === selection!.lat && data.lng === selection!.lng
          : primarySelectedId !== undefined
            ? data.roasteryId === primarySelectedId
            : data.isPrimary)
      const isHovered = data.roasteryId === hoveredId

      // 마커 클릭 전(초기): 로스터리 마커 전체 selected 스타일
      // 마커 클릭 후: 클릭한 마커만 selected, 나머지는 일반 스타일
      const isVisuallySelected = hasExplicitSelection ? isPrimarySelected : isSelected

      const marker = new nv.Marker({
        position: new nv.LatLng(data.lat, data.lng),
        map,
        icon: markerIcon(isVisuallySelected, isHovered, isPrimarySelected),
        title: data.roasteryName,
        zIndex: isPrimarySelected ? 100 : isSelected ? 60 : isHovered ? 50 : 10,
      })

      nv.Event.addListener(marker, 'click', () => {
        clickedPosRef.current = { lat: data.lat, lng: data.lng }
        setSelection({ roasteryId: data.roasteryId, lat: data.lat, lng: data.lng })
        onMarkerClick(data.roasteryId, data.lat, data.lng)
      })
      if (onMarkerHover) {
        nv.Event.addListener(marker, 'mouseover', () => onMarkerHover(data.roasteryId))
        nv.Event.addListener(marker, 'mouseout', () => onMarkerHover(undefined))
      }

      const existing = markerMap.get(data.roasteryId) ?? []
      existing.push(marker)
      markerMap.set(data.roasteryId, existing)
    }

    // 마커 셋이 바뀔 때마다 morph로 부드럽게 이동 — selectedId 유무와 무관하게 실행
    if (markers.length > 0 && containerRef.current) {
      const key = markers.map((m) => `${m.roasteryId}:${m.lat}:${m.lng}`).join('|')
      if (restoredFromSavedRef.current) {
        // 저장된 위치로 복원된 첫 마운트: fitBounds 스킵, key만 초기화
        // selectedId가 있으면 fly-to가 해당 마커로 이동할 수 있도록 justFitBounds 설정 안 함
        markersKeyRef.current = key
        restoredFromSavedRef.current = false
        if (!selectedId) {
          justFitBoundsRef.current = true
        }
      } else if (key !== markersKeyRef.current) {
        const selectedMarkers = selectedId ? markers.filter((m) => m.roasteryId === selectedId) : []
        const fitMarkers = selectedMarkers.length > 0 ? selectedMarkers : markers
        const fitOverlay = selectedMarkers.length > 0 ? overlayWidth : 0
        const { lat, lng, zoom } = computeFitView(fitMarkers, containerRef.current, fitOverlay)
        map.morph(new nv.LatLng(lat, lng), zoom)
        markersKeyRef.current = key
        justFitBoundsRef.current = true
      }
    }
  }, [
    mapReady,
    markers,
    selectedId,
    primarySelectedId,
    selection,
    hoveredId,
    onMarkerClick,
    onMarkerHover,
    overlayWidth,
  ])

  // Fly to selected marker
  useEffect(() => {
    // fitBounds가 막 실행됐으면 fly 건너뜀 — selectedId 유무와 무관하게 먼저 소비
    if (justFitBoundsRef.current) {
      justFitBoundsRef.current = false
      prevSelectedIdRef.current = selectedId
      return
    }
    if (!selectedId) {
      prevSelectedIdRef.current = undefined
      return
    }
    if (!mapReady || !mapRef.current || !window.naver?.maps) return
    if (!containerRef.current) return
    const nv = window.naver.maps

    const pos = clickedPosRef.current
    clickedPosRef.current = null

    const selectedIdChanged = prevSelectedIdRef.current !== selectedId

    const roasteryMarkers = markers.filter((m) => m.roasteryId === selectedId)
    if (roasteryMarkers.length === 0) return

    prevSelectedIdRef.current = selectedId

    if (pos) {
      // 지도 마커 클릭: 클릭한 마커 위치로 fly (오버레이 오프셋 적용)
      const currentZoom = mapRef.current.getZoom()
      const targetZoom = currentZoom < 16 ? 16 : currentZoom
      const lngOffset = (overlayWidth / 2) * (360 / (256 * 2 ** targetZoom))
      mapRef.current.morph(new nv.LatLng(pos.lat, pos.lng - lngOffset), targetZoom)
    } else if (selectedIdChanged) {
      // 리스트 클릭 또는 URL 진입: 해당 로스터리 모든 마커 fit bounds (오버레이 오프셋 적용)
      const { lat, lng, zoom } = computeFitView(roasteryMarkers, containerRef.current, overlayWidth)
      mapRef.current.morph(new nv.LatLng(lat, lng), zoom)
    }
    // selection/overlayWidth 변경에 의한 재실행은 아무것도 하지 않음
  }, [mapReady, selectedId, selection, markers, overlayWidth])

  // User location marker (blue dot)
  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.naver?.maps) return
    const nv = window.naver.maps
    const map = mapRef.current

    if (!userLocation) {
      userLocationMarkerRef.current?.setMap(null)
      userLocationMarkerRef.current = null
      return
    }

    const icon = {
      content: `<div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(59,130,246,0.15);animation:pulse-ring 2s ease-out infinite"></div>
        <div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);flex-shrink:0"></div>
      </div>`,
      size: new nv.Size(20, 20),
      anchor: new nv.Point(10, 10),
    }

    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setIcon(icon)
      ;(
        userLocationMarkerRef.current as NaverMarkerInstance & { setPosition(p: NaverLatLng): void }
      ).setPosition(new nv.LatLng(userLocation.lat, userLocation.lng))
    } else {
      userLocationMarkerRef.current = new nv.Marker({
        position: new nv.LatLng(userLocation.lat, userLocation.lng),
        map,
        icon,
        zIndex: 200,
      })
    }
  }, [mapReady, userLocation])

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NCPKEY}`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onReady={handleScriptLoad}
      />
      <div ref={containerRef} className="w-full h-full" />
    </>
  )
}
