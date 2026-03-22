import { prisma } from '@/lib/prisma'

export interface ProfileSummary {
  ratingCount: number
  bookmarkCount: number
}

export async function getProfileSummary(userId: string): Promise<ProfileSummary> {
  const [ratingCount, bookmarkCount] = await Promise.all([
    prisma.rating.count({ where: { userId } }),
    prisma.bookmark.count({ where: { userId } }),
  ])

  return { ratingCount, bookmarkCount }
}
