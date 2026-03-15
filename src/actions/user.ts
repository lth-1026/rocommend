'use server'

import { revalidatePath } from 'next/cache'
import { signOut } from '@/lib/auth'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { ActionResult } from '@/types/action'

const nameSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(20, '20자 이내로 입력해주세요').trim(),
})

export async function updateName(input: { name: string }): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const parsed = nameSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message, code: 'VALIDATION' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
    })
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다.', code: 'DB_ERROR' }
  }

  revalidatePath('/account')
  return { success: true }
}

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
