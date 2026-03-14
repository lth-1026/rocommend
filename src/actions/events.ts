'use server'

import { auth } from '@/lib/auth'
import { logEvent } from '@/lib/logger'
import type { ActionResult } from '@/types/action'

export async function logClientEvent(input: {
  event: string
  payload?: Record<string, unknown>
}): Promise<ActionResult> {
  const session = await auth()
  const userId = session?.user?.id ?? undefined

  await logEvent(input.event, input.payload, userId)

  return { success: true }
}
