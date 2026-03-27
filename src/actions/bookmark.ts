'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { bookmarkSchema } from '@/lib/schemas/bookmark'
import type { ActionResult } from '@/types/action'

export async function toggleBookmark(input: {
  roasteryId: string
}): Promise<ActionResult<{ isBookmarked: boolean }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const parsed = bookmarkSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다', code: 'VALIDATION' }
  }

  const userId = session.user.id
  const { roasteryId } = parsed.data

  try {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_roasteryId: { userId, roasteryId } },
      select: { id: true },
    })

    if (existing) {
      await prisma.bookmark.delete({ where: { userId_roasteryId: { userId, roasteryId } } })
      revalidatePath('/bookmarks')
      revalidatePath(`/roasteries/${roasteryId}`)
      return { success: true, data: { isBookmarked: false } }
    } else {
      await prisma.bookmark.create({ data: { userId, roasteryId } })
      revalidatePath('/bookmarks')
      revalidatePath(`/roasteries/${roasteryId}`)
      return { success: true, data: { isBookmarked: true } }
    }
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다.', code: 'DB_ERROR' }
  }
}

export async function removeBookmark(input: { roasteryId: string }): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const parsed = bookmarkSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다', code: 'VALIDATION' }
  }

  const userId = session.user.id
  const { roasteryId } = parsed.data

  try {
    await prisma.bookmark.delete({ where: { userId_roasteryId: { userId, roasteryId } } })
  } catch {
    return { success: false, error: '삭제 중 오류가 발생했습니다.', code: 'DB_ERROR' }
  }

  revalidatePath('/bookmarks')
  return { success: true }
}
