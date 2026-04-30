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

const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(20, '20자 이내로 입력해주세요')
    .trim(),
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

export async function checkNicknameAvailable(nickname: string): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.id) return false

  const existing = await prisma.user.findUnique({
    where: { nickname: nickname.trim() },
    select: { id: true },
  })
  return !existing || existing.id === session.user.id
}

export async function updateNickname(input: { nickname: string }): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const parsed = nicknameSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message, code: 'VALIDATION' }
  }

  const available = await checkNicknameAvailable(parsed.data.nickname)
  if (!available) {
    return { success: false, error: '이미 사용 중인 닉네임입니다', code: 'CONFLICT' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { nickname: parsed.data.nickname },
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
