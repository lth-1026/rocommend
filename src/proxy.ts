import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Edge Runtime 호환 — authConfig만 사용 (Prisma adapter 없음)
export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg).*)'],
}
