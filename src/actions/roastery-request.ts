'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { submitRoasteryRequestSchema } from '@/lib/schemas/roastery-request'
import type { ActionResult } from '@/types/action'

export async function submitRoasteryRequest(input: { name: string }): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const parsed = submitRoasteryRequestSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다',
      code: 'VALIDATION',
    }
  }

  const userId = session.user.id
  const { name } = parsed.data

  try {
    await prisma.roasteryRequest.create({
      data: { userId, name },
    })
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다', code: 'DB_ERROR' }
  }

  return { success: true }
}

export async function updateRoasteryRequestStatus(
  id: string,
  status: 'PENDING' | 'READ'
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: '권한이 없습니다', code: 'FORBIDDEN' }
  }

  try {
    await prisma.roasteryRequest.update({
      where: { id },
      data: { status },
    })
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다', code: 'DB_ERROR' }
  }

  return { success: true }
}
