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
  fitBounds(bounds: object, opts?: object): void
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

// ─── Props & marker data ─────────────────────────────────────────────────────

export interface MapMarkerData {
  roasteryId: string
  roasteryName: string
  lat: number
  lng: number
  isPrimary: boolean
}

interface Props {
  markers: MapMarkerData[]
  selectedId?: string
  hoveredId?: string
  onMarkerClick: (roasteryId: string) => void
  onMarkerHover?: (roasteryId: string | undefined) => void
}

// ─── Marker icon helper ───────────────────────────────────────────────────────

function markerIcon(selected: boolean, hovered: boolean) {
  const size = selected ? 28 : hovered ? 24 : 20
  const bg = selected ? '#2563eb' : hovered ? '#3b82f6' : '#4b5563'
  const half = size / 2
  const nv = window.naver!
  return {
    content: `<div style="width:${size}px;height:${size}px;background:${bg};border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;transition:width .15s,height .15s,background .15s;"></div>`,
    size: new nv.maps.Size(size, size),
    anchor: new nv.maps.Point(half, half),
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const NCPKEY = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID!

export function RoasteryMapView({
  markers,
  selectedId,
  hoveredId,
  onMarkerClick,
  onMarkerHover,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<NaverMapInstance | null>(null)
  const markerMapRef = useRef<Map<string, NaverMarkerInstance[]>>(new Map())
  const [mapReady, setMapReady] = useState(false)

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current || !window.naver?.maps) return
    const nv = window.naver.maps

    const map = new nv.Map(containerRef.current, {
      center: new nv.LatLng(37.5665, 126.978),
      zoom: 11,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
      zoomControl: true,
      zoomControlOptions: { position: 3 /* TOP_RIGHT */ },
    })

    mapRef.current = map
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
      const isHovered = data.roasteryId === hoveredId

      const marker = new nv.Marker({
        position: new nv.LatLng(data.lat, data.lng),
        map,
        icon: markerIcon(isSelected, isHovered),
        title: data.roasteryName,
        zIndex: isSelected ? 100 : isHovered ? 50 : 10,
      })

      nv.Event.addListener(marker, 'click', () => onMarkerClick(data.roasteryId))
      if (onMarkerHover) {
        nv.Event.addListener(marker, 'mouseover', () => onMarkerHover(data.roasteryId))
        nv.Event.addListener(marker, 'mouseout', () => onMarkerHover(undefined))
      }

      const existing = markerMap.get(data.roasteryId) ?? []
      existing.push(marker)
      markerMap.set(data.roasteryId, existing)
    }

    // Fit bounds if no selection
    if (!selectedId && markers.length > 0) {
      const nv2 = window.naver.maps
      const bounds = new nv2.LatLngBounds()
      for (const m of markers) bounds.extend(new nv2.LatLng(m.lat, m.lng))
      map.fitBounds(bounds, { top: 60, right: 20, bottom: 60, left: 20 })
    }
  }, [mapReady, markers, selectedId, hoveredId, onMarkerClick, onMarkerHover])

  // Fly to selected marker
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedId || !window.naver?.maps) return
    const target =
      markers.find((m) => m.roasteryId === selectedId && m.isPrimary) ??
      markers.find((m) => m.roasteryId === selectedId)
    if (!target) return
    const nv = window.naver.maps
    mapRef.current.setCenter(new nv.LatLng(target.lat, target.lng))
  }, [mapReady, selectedId, markers])

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NCPKEY}`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <div ref={containerRef} className="w-full h-full" />
    </>
  )
}
