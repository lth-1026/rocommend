import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { Logger } from 'next-axiom'
import type { NextFetchEvent, NextRequest } from 'next/server'

const authMiddleware = NextAuth(authConfig).auth as unknown as (
  req: NextRequest,
  event: NextFetchEvent
) => Promise<Response>

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const logger = new Logger({ source: 'middleware' })
  await logger.middleware(request, { logRequestDetails: ['nextUrl', 'method'] })
  event.waitUntil(logger.flush())
  return authMiddleware(request, event)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|brand/|icons/|_axiom/).*)',
  ],
}
