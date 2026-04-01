import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { SortOption, RoasteryWithStats, RoasteryDetail, FilterParams } from '@/types/roastery'

const DEFAULT_FILTER: FilterParams = {
  q: '',
  price: [],
  decaf: false,
  regions: [],
  tags: [],
  rated: false,
}

const TAG_SELECT = { select: { id: true, name: true, category: true } } as const

export async function getRoasteries(
  sort: SortOption = 'popular',
  filter: FilterParams = DEFAULT_FILTER,
  userId?: string
): Promise<RoasteryWithStats[]> {
  const andConditions: Prisma.RoasteryWhereInput[] = []

  if (filter.regions.length > 0) {
    andConditions.push({
      tags: { some: { category: 'REGION', name: { in: filter.regions } } },
    })
  }
  if (filter.tags.length > 0) {
    andConditions.push({
      tags: { some: { category: 'CHARACTERISTIC', name: { in: filter.tags } } },
    })
  }

  const where: Prisma.RoasteryWhereInput = {
    ...(filter.price.length > 0 && { priceRange: { in: filter.price } }),
    ...(filter.decaf && { decaf: true }),
    ...(filter.q && { name: { contains: filter.q, mode: 'insensitive' as const } }),
    ...(filter.rated && userId && { ratings: { some: { userId } } }),
    ...(andConditions.length > 0 && { AND: andConditions }),
  }

  const [roasteries, avgRatings] = await Promise.all([
    prisma.roastery.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        tags: TAG_SELECT,
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
        tags: TAG_SELECT,
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
