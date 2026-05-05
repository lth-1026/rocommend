import { Logger } from 'next-axiom'

export const logger = new Logger({ source: 'server' })

export function withUser(userId: string | undefined) {
  return logger.with({ userId: userId ?? 'anonymous' })
}
