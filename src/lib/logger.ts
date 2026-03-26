import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function logEvent(
  event: string,
  payload?: Record<string, unknown>,
  userId?: string
): Promise<void> {
  try {
    await prisma.eventLog.create({
      data: {
        event,
        payload: payload ? (payload as Prisma.InputJsonValue) : Prisma.JsonNull,
        userId: userId ?? null,
      },
    })
  } catch (err) {
    console.error('[logEvent] failed:', err)
  }
}
