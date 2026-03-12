import { prisma } from '@/lib/prisma'

export async function getUserRating(userId: string, roasteryId: string) {
  return prisma.rating.findUnique({
    where: { userId_roasteryId: { userId, roasteryId } },
    select: { id: true, score: true, comment: true, source: true, updatedAt: true },
  })
}

export async function getRatingCount(userId: string): Promise<number> {
  return prisma.rating.count({ where: { userId } })
}
