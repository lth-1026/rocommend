import { prisma } from '@/lib/prisma'
import type { SortOption, RoasteryWithStats, RoasteryDetail, FilterParams } from '@/types/roastery'

const DEFAULT_FILTER: FilterParams = { q: '', price: [], decaf: false, regions: [], rated: false }

export async function getRoasteries(
  sort: SortOption = 'popular',
  filter: FilterParams = DEFAULT_FILTER,
  userId?: string
): Promise<RoasteryWithStats[]> {
  const where = {
    ...(filter.price.length > 0 && { priceRange: { in: filter.price } }),
    ...(filter.decaf && { decaf: true }),
    ...(filter.regions.length > 0 && { regions: { hasSome: filter.regions } }),
    ...(filter.q && { name: { contains: filter.q, mode: 'insensitive' as const } }),
    ...(filter.rated && userId && { ratings: { some: { userId } } }),
  }

  const [roasteries, avgRatings] = await Promise.all([
    prisma.roastery.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        regions: true,
        priceRange: true,
        decaf: true,
        imageUrl: true,
        website: true,
        _count: { select: { ratings: true } },
      },
      where,
      ...(sort === 'name' && { orderBy: { name: 'asc' } }),
    }),
    prisma.rating.groupBy({
      by: ['roasteryId'],
      _avg: { score: true },
    }),
  ])

  const avgMap = new Map(avgRatings.map((r) => [r.roasteryId, r._avg.score]))

  const result = roasteries.map((r) => ({
    ...r,
    ratingCount: r._count.ratings,
    avgRating: avgMap.get(r.id) ?? null,
  }))

  if (sort === 'popular') {
    result.sort((a, b) => {
      if (a.avgRating === null && b.avgRating === null) return 0
      if (a.avgRating === null) return 1
      if (b.avgRating === null) return -1
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating
      return b.ratingCount - a.ratingCount // 동점 시 평가 수 많은 순
    })
  }

  return result
}

export async function getRoasteryById(id: string): Promise<RoasteryDetail | null> {
  const [roastery, avgRating] = await Promise.all([
    prisma.roastery.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        regions: true,
        priceRange: true,
        decaf: true,
        imageUrl: true,
        website: true,
        beans: {
          select: {
            id: true,
            name: true,
            origins: true,
            roastingLevel: true,
            decaf: true,
            cupNotes: true,
            imageUrl: true,
          },
          orderBy: { name: 'asc' },
        },
        _count: { select: { ratings: true } },
      },
    }),
    prisma.rating.aggregate({
      where: { roasteryId: id },
      _avg: { score: true },
    }),
  ])

  if (!roastery) return null

  return {
    ...roastery,
    ratingCount: roastery._count.ratings,
    avgRating: avgRating._avg.score ?? null,
  }
}
