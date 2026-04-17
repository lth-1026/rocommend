import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type {
  SortOption,
  RoasteryWithStats,
  RoasteryDetail,
  FilterParams,
  ChannelWithPrice,
} from '@/types/roastery'
import { flattenTags } from '@/types/roastery'

const DEFAULT_FILTER: FilterParams = {
  q: '',
  price: [],
  decaf: false,
  regions: [],
  tags: [],
  rated: false,
}

const TAG_SELECT = {
  select: {
    isPrimary: true,
    tag: { select: { id: true, name: true, category: true } },
  },
} as const

export async function getRoasteries(
  sort: SortOption = 'popular',
  filter: FilterParams = DEFAULT_FILTER,
  userId?: string
): Promise<RoasteryWithStats[]> {
  const andConditions: Prisma.RoasteryWhereInput[] = []

  if (filter.regions.length > 0) {
    andConditions.push({
      tags: { some: { tag: { category: 'REGION', name: { in: filter.regions } } } },
    })
  }
  if (filter.tags.length > 0) {
    andConditions.push({
      tags: { some: { tag: { category: 'CHARACTERISTIC', name: { in: filter.tags } } } },
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
    tags: flattenTags(r.tags),
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

const CHANNEL_SELECT = {
  select: {
    id: true,
    channelKey: true,
    url: true,
    definition: { select: { label: true, order: true } },
  },
} as const

function flattenChannels(
  raw: {
    id: string
    channelKey: string
    url: string
    definition: { label: string; order: number }
    beanPrices?: { price: number }[]
  }[],
  priceByChannelId?: Map<string, number>
): ChannelWithPrice[] {
  return raw.map((c) => ({
    channelId: c.id,
    channelKey: c.channelKey,
    label: c.definition.label,
    url: c.url,
    price: priceByChannelId ? (priceByChannelId.get(c.id) ?? null) : null,
    order: c.definition.order,
  }))
}

export async function getRoasteryById(id: string): Promise<RoasteryDetail | null> {
  const [roastery, avgRating] = await Promise.all([
    prisma.roastery.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        tags: TAG_SELECT,
        priceRange: true,
        decaf: true,
        imageUrl: true,
        website: true,
        channels: {
          ...CHANNEL_SELECT,
        },
        beans: {
          select: {
            id: true,
            name: true,
            origins: true,
            roastingLevel: true,
            decaf: true,
            cupNotes: true,
            imageUrl: true,
            channelPrices: {
              select: {
                price: true,
                channel: CHANNEL_SELECT,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
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

  // 채널별 최저가 집계 (전체 원두 기준)
  const minPriceByChannelId = new Map<string, number>()
  for (const bean of roastery.beans) {
    for (const bp of bean.channelPrices) {
      const prev = minPriceByChannelId.get(bp.channel.id)
      if (prev === undefined || bp.price < prev) {
        minPriceByChannelId.set(bp.channel.id, bp.price)
      }
    }
  }
  const baseChannels = flattenChannels(
    roastery.channels,
    minPriceByChannelId.size > 0 ? minPriceByChannelId : undefined
  )

  // 원두별 채널 가격
  const beans: RoasteryDetail['beans'] = roastery.beans.map((bean) => {
    const priceByChannelId = new Map(bean.channelPrices.map((bp) => [bp.channel.id, bp.price]))
    return {
      id: bean.id,
      name: bean.name,
      origins: bean.origins,
      roastingLevel: bean.roastingLevel,
      decaf: bean.decaf,
      cupNotes: bean.cupNotes,
      imageUrl: bean.imageUrl,
      channelPrices: flattenChannels(roastery.channels, priceByChannelId),
    }
  })

  return {
    ...roastery,
    tags: flattenTags(roastery.tags),
    ratingCount: roastery._count.ratings,
    avgRating: avgRating._avg.score ?? null,
    channels: baseChannels,
    beans,
  }
}
