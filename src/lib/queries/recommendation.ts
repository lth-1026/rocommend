import { prisma } from '@/lib/prisma'
import type { RawRating } from '@/lib/recommender/types'
import type { RoasteryWithStats } from '@/types/roastery'
import type { PriceRange } from '@/types/roastery'
import { flattenTags } from '@/types/roastery'

export async function getAllRatings(): Promise<RawRating[]> {
  return prisma.rating.findMany({
    select: { userId: true, roasteryId: true, score: true },
  })
}

export async function getUserRatingCount(userId: string): Promise<number> {
  return prisma.rating.count({ where: { userId } })
}

export async function getPopularRoasteries(
  userId?: string,
  preferredPriceRanges?: PriceRange[]
): Promise<RoasteryWithStats[]> {
  const where = {
    ...(userId && { ratings: { none: { userId } } }),
    ...(preferredPriceRanges?.length && { priceRange: { in: preferredPriceRanges } }),
  }

  const [roasteries, avgRatings] = await Promise.all([
    prisma.roastery.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        tags: {
          select: { isPrimary: true, tag: { select: { id: true, name: true, category: true } } },
        },
        priceRange: true,
        decaf: true,
        imageUrl: true,
        website: true,
        _count: { select: { ratings: true } },
      },
      where,
    }),
    prisma.rating.groupBy({
      by: ['roasteryId'],
      _avg: { score: true },
    }),
  ])

  const avgMap = new Map(avgRatings.map((r) => [r.roasteryId, r._avg.score]))

  return roasteries
    .map((r) => ({
      ...r,
      tags: flattenTags(r.tags),
      ratingCount: r._count.ratings,
      avgRating: avgMap.get(r.id) ?? null,
    }))
    .sort((a, b) => {
      if (a.avgRating === null && b.avgRating === null) return 0
      if (a.avgRating === null) return 1
      if (b.avgRating === null) return -1
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating
      return b.ratingCount - a.ratingCount
    })
    .slice(0, 7)
}

export interface StoredRecommendation {
  roasteryId: string
  cfScore: number
  roastery: RoasteryWithStats
  userRating?: number
}

export async function getStoredRecommendations(userId: string): Promise<StoredRecommendation[]> {
  const [recs, avgRatings, userRatings] = await Promise.all([
    prisma.recommendation.findMany({
      where: { userId },
      include: {
        roastery: {
          select: {
            id: true,
            name: true,
            description: true,
            tags: {
              select: {
                isPrimary: true,
                tag: { select: { id: true, name: true, category: true } },
              },
            },
            priceRange: true,
            decaf: true,
            imageUrl: true,
            website: true,
            _count: { select: { ratings: true } },
          },
        },
      },
    }),
    prisma.rating.groupBy({
      by: ['roasteryId'],
      _avg: { score: true },
    }),
    prisma.rating.findMany({
      where: { userId },
      select: { roasteryId: true, score: true },
    }),
  ])

  const avgMap = new Map(avgRatings.map((r) => [r.roasteryId, r._avg.score]))
  const userRatingMap = new Map(userRatings.map((r) => [r.roasteryId, r.score]))

  return recs.map((rec) => ({
    roasteryId: rec.roasteryId,
    cfScore: rec.score,
    roastery: {
      ...rec.roastery,
      tags: flattenTags(rec.roastery.tags),
      ratingCount: rec.roastery._count.ratings,
      avgRating: avgMap.get(rec.roasteryId) ?? null,
    },
    userRating: userRatingMap.get(rec.roasteryId),
  }))
}
