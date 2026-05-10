import type { RoasteryWithStats, LocationItem } from '@/types/roastery'

export interface NearbyLocation {
  roastery: RoasteryWithStats
  location: LocationItem
  distance: number
}

const R = 6371 // km

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getNearbyLocations(
  roasteries: RoasteryWithStats[],
  userLat: number,
  userLng: number,
  maxKm = 10,
  maxCount = 10
): NearbyLocation[] {
  const closest = new Map<string, NearbyLocation>()

  for (const r of roasteries) {
    for (const loc of r.locations) {
      if (loc.lat === null || loc.lng === null) continue
      const distance = haversineDistance(userLat, userLng, loc.lat, loc.lng)
      if (distance > maxKm) continue
      const prev = closest.get(r.id)
      if (!prev || distance < prev.distance) {
        closest.set(r.id, { roastery: r, location: loc, distance })
      }
    }
  }

  return [...closest.values()].sort((a, b) => a.distance - b.distance).slice(0, maxCount)
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}
