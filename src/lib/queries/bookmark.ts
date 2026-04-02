import { prisma } from '@/lib/prisma'
import type { BookmarkWithRoastery, BookmarkSort } from '@/types/bookmark'
import { flattenTags } from '@/types/roastery'

export async function getBookmarkStatus(userId: string, roasteryId: string): Promise<boolean> {
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_roasteryId: { userId, roasteryId } },
    select: { id: true },
  })
  return !!bookmark
}

export async function getBookmarks(
  userId: string,
  sort: BookmarkSort = 'name'
): Promise<BookmarkWithRoastery[]> {
  const [bookmarks, avgRatings, userRatings] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      select: {
        id: true,
        roasteryId: true,
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
      orderBy: sort === 'name' ? { roastery: { name: 'asc' } } : undefined,
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
  const myRatingMap = new Map(userRatings.map((r) => [r.roasteryId, r.score]))

  const result: BookmarkWithRoastery[] = bookmarks.map((b) => ({
    id: b.id,
    roasteryId: b.roasteryId,
    roastery: {
      ...b.roastery,
      tags: flattenTags(b.roastery.tags),
      ratingCount: b.roastery._count.ratings,
      avgRating: avgMap.get(b.roasteryId) ?? null,
    },
    myRating: myRatingMap.get(b.roasteryId) ?? null,
  }))

  if (sort === 'myRating') {
    result.sort((a, b) => {
      if (a.myRating === null && b.myRating === null) return 0
      if (a.myRating === null) return 1
      if (b.myRating === null) return -1
      return b.myRating - a.myRating
    })
  }

  return result
}
