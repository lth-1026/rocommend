'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { upsertRatingSchema, deleteRatingSchema, reportRatingSchema } from '@/lib/schemas/rating'
import { computeAndSaveCF } from '@/lib/recommender'
import { getRoasteryRatings } from '@/lib/queries/rating'
import type { ActionResult } from '@/types/action'
import type { RatingSortOption, RatingsPage } from '@/types/rating'

export async function upsertRating(input: {
  roasteryId: string
  score: number
  comment?: string
}): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const parsed = upsertRatingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다', code: 'VALIDATION' }
  }

  const userId = session.user.id
  const { roasteryId, score, comment } = parsed.data

  try {
    await prisma.rating.upsert({
      where: { userId_roasteryId: { userId, roasteryId } },
      create: { userId, roasteryId, score, comment: comment ?? null },
      update: { score, comment: comment ?? null },
    })
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다.', code: 'DB_ERROR' }
  }

  // non-critical 이벤트 로그
  try {
    await prisma.eventLog.create({
      data: { userId, event: 'rating_submitted', payload: { roasteryId, score } },
    })
  } catch {
    // 무시
  }

  revalidatePath(`/roasteries/${roasteryId}`)
  revalidatePath('/')
  revalidatePath('/bookmarks')

  // 응답 후 비동기 CF 재계산 (userId는 after() 외부에서 캡처)
  after(async () => {
    await computeAndSaveCF(userId)
  })

  return { success: true }
}

export async function deleteRating(input: { roasteryId: string }): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const parsed = deleteRatingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다', code: 'VALIDATION' }
  }

  const userId = session.user.id
  const { roasteryId } = parsed.data

  try {
    await prisma.rating.delete({
      where: { userId_roasteryId: { userId, roasteryId } },
    })
  } catch {
    return { success: false, error: '삭제 중 오류가 발생했습니다.', code: 'DB_ERROR' }
  }

  revalidatePath(`/roasteries/${roasteryId}`)
  revalidatePath('/')
  revalidatePath('/bookmarks')

  // 응답 후 비동기 CF 재계산
  after(async () => {
    await computeAndSaveCF(userId)
  })

  return { success: true }
}

export async function fetchRoasteryRatings(input: {
  roasteryId: string
  sort: RatingSortOption
  cursor: string
}): Promise<RatingsPage> {
  const session = await auth()
  return getRoasteryRatings({
    roasteryId: input.roasteryId,
    sort: input.sort,
    cursor: input.cursor,
    currentUserId: session?.user?.id,
  })
}

export async function reportRating(input: {
  ratingId: string
  reason: string
}): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const parsed = reportRatingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다', code: 'VALIDATION' }
  }

  const userId = session.user.id
  const { ratingId, reason } = parsed.data

  try {
    await prisma.ratingReport.create({
      data: { ratingId, userId, reason },
    })
  } catch (e: unknown) {
    const isUniqueViolation = e instanceof Error && e.message.includes('Unique constraint failed')
    if (isUniqueViolation) {
      return { success: false, error: '이미 신고한 한줄평입니다', code: 'DUPLICATE' }
    }
    return { success: false, error: '신고 중 오류가 발생했습니다', code: 'DB_ERROR' }
  }

  return { success: true }
}
