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

  logger.info({ event: input.event, userId: userId ?? 'anonymous', ...input.payload })

  return { success: true }
}
