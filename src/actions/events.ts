'use server'

import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { ActionResult } from '@/types/action'

export async function logClientEvent(input: {
  event: string
  payload?: Record<string, unknown>
}): Promise<ActionResult> {
  const session = await auth()
  const userId = session?.user?.id ?? undefined

  try {
    logger.info(input.event, { userId: userId ?? 'anonymous', ...input.payload })
    await logger.flush()
  } catch {
    // 로깅 실패는 사용자 플로우에 영향을 주지 않음
  }

  return { success: true }
}
