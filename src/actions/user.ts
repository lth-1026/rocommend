'use server'

import { signOut } from '@/lib/auth'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types/action'

export async function deleteAccount(): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  try {
    await prisma.user.delete({ where: { id: session.user.id } })
  } catch {
    return { success: false, error: '탈퇴 처리 중 오류가 발생했습니다.', code: 'DB_ERROR' }
  }

  await signOut({ redirectTo: '/login' })
  return { success: true }
}
