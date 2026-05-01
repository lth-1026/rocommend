import { prisma } from '@/lib/prisma'
import { cosineSimilarity } from '@/lib/recommender/item-cf'
import type { RatingSortOption, RatingListItem, MyRatingItem, MyRatingSort } from '@/types/rating'

const PAGE_SIZE = 10

export async function getUserRating(userId: string, roasteryId: string) {
  return prisma.rating.findUnique({
    where: { userId_roasteryId: { userId, roasteryId } },
    select: { id: true, score: true, comment: true, source: true, updatedAt: true },
  })
}

export async function getRatingCount(userId: string): Promise<number> {
  return prisma.rating.count({ where: { userId } })
}

export async function getRoasteryRatings(input: {
  roasteryId: string
  sort: RatingSortOption
  cursor?: string
  currentUserId?: string
}): Promise<{ items: RatingListItem[]; nextCursor: string | null }> {
  const { roasteryId, sort, cursor, currentUserId } = input

  const rawRatings = await prisma.rating.findMany({
    where: { roasteryId, comment: { not: null } },
    select: {
      id: true,
      userId: true,
      score: true,
      comment: true,
      updatedAt: true,
      user: { select: { nickname: true, image: true } },
      reports: {
        where: { userId: currentUserId ?? '' },
        select: { id: true },
      },
    },
  })

  // 유사한 사람 순 정렬: 현재 유저와 각 리뷰어의 코사인 유사도 계산
  const similarityMap = new Map<string, number>()
  if (sort === 'SIMILAR' && currentUserId) {
    const allRatings = await prisma.rating.findMany({
      select: { userId: true, roasteryId: true, score: true },
    })
    const currentVec = new Map(
      allRatings.filter((r) => r.userId === currentUserId).map((r) => [r.roasteryId, r.score])
    )
    for (const r of rawRatings) {
      if (r.userId === currentUserId) {
        similarityMap.set(r.userId, 1.0)
        continue
      }
      const reviewerVec = new Map(
        allRatings.filter((a) => a.userId === r.userId).map((a) => [a.roasteryId, a.score])
      )
      similarityMap.set(r.userId, cosineSimilarity(currentVec, reviewerVec))
    }
  }

  const sorted = [...rawRatings].sort((a, b) => {
    if (sort === 'SIMILAR') {
      const diff = (similarityMap.get(b.userId) ?? 0) - (similarityMap.get(a.userId) ?? 0)
      return diff !== 0 ? diff : b.updatedAt.getTime() - a.updatedAt.getTime()
    }
    if (sort === 'HIGH') {
      return b.score !== a.score ? b.score - a.score : b.updatedAt.getTime() - a.updatedAt.getTime()
    }
    return a.score !== b.score ? a.score - b.score : b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  const startIdx = cursor ? sorted.findIndex((r) => r.id === cursor) + 1 : 0
  if (cursor && startIdx === 0) return { items: [], nextCursor: null }

  const page = sorted.slice(startIdx, startIdx + PAGE_SIZE)
  const nextCursor = page.length === PAGE_SIZE ? page[page.length - 1].id : null

  return {
    items: page.map((r) => ({
      id: r.id,
      score: r.score,
      comment: r.comment!,
      updatedAt: r.updatedAt,
      user: r.user,
      isOwnRating: r.userId === currentUserId,
      hasReported: r.reports.length > 0,
    })),
    nextCursor,
  }
}

export async function getUserRatings(
  userId: string,
  sort: MyRatingSort = 'date_desc',
  cursor?: string
): Promise<{ items: MyRatingItem[]; nextCursor: string | null }> {
  const orderBy = {
    date_desc: [{ updatedAt: 'desc' as const }],
    score_desc: [{ score: 'desc' as const }, { updatedAt: 'desc' as const }],
    score_asc: [{ score: 'asc' as const }, { updatedAt: 'desc' as const }],
  }[sort]

  const rawRatings = await prisma.rating.findMany({
    where: { userId },
    select: {
      id: true,
      score: true,
      comment: true,
      updatedAt: true,
      roastery: { select: { id: true, name: true, imageUrl: true } },
    },
    orderBy,
    take: PAGE_SIZE + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  })

  const hasMore = rawRatings.length > PAGE_SIZE
  const items = hasMore ? rawRatings.slice(0, PAGE_SIZE) : rawRatings

  return {
    items: items.map((r) => ({
      id: r.id,
      score: r.score,
      comment: r.comment ?? undefined,
      updatedAt: r.updatedAt,
      roastery: r.roastery,
    })),
    nextCursor: hasMore ? items[items.length - 1].id : null,
  }
}
