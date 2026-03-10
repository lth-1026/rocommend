'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { onboardingSchema } from '@/lib/schemas/onboarding'
import { revalidatePath } from 'next/cache'
import type { OnboardingAnswers } from '@/types/onboarding'
import type { ActionResult } from '@/types/action'

export async function submitOnboarding(data: OnboardingAnswers): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const parsed = onboardingSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: '입력값이 올바르지 않습니다', code: 'VALIDATION' }
  }

  const userId = session.user.id
  const { q1, q2, q3, q4, q5 } = parsed.data
  const storedQ3 = q3.filter((p) => p !== 'NO_PREFERENCE')

  try {
    await prisma.$transaction(async (tx) => {
      await tx.onboarding.upsert({
        where: { userId },
        create: { userId, version: 3, q1, q2, q3: storedQ3, q4, q5: q5 ?? [] },
        update: { version: 3, q1, q2, q3: storedQ3, q4, q5: q5 ?? [] },
      })

      if (q4 !== 'FIRST_TIME' && q5 && q5.length > 0) {
        const validCount = await tx.roastery.count({
          where: { id: { in: q5 }, isOnboardingCandidate: true },
        })
        if (validCount !== q5.length) {
          throw new Error('invalid_roastery')
        }

        await Promise.all(
          q5.map((roasteryId) =>
            tx.rating.upsert({
              where: { userId_roasteryId: { userId, roasteryId } },
              create: { userId, roasteryId, score: 5, source: 'onboarding' },
              update: {}, // 사용자가 이미 직접 평가한 경우 보존
            }),
          ),
        )
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          preferences: {
            onboardingVersion: 3,
            inferredProfile: {
              brewingMethods: q1,
              purchaseStyle: q2,
              priceRanges: storedQ3,
            },
          },
        },
      })
    })
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다. 다시 시도해주세요.', code: 'DB_ERROR' }
  }

  // 이벤트 로그는 non-critical — 실패해도 온보딩 결과에 영향 없음
  try {
    await prisma.eventLog.create({
      data: { userId, event: 'onboarding_completed', payload: { q4, q5Count: q5?.length ?? 0 } },
    })
  } catch {
    // 로깅 실패 무시
  }

  revalidatePath('/home')
  return { success: true }
}
