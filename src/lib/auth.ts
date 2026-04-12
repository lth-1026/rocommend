import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth.config'
import '@/types/auth'

// Node.js 전용 (Server Components, API Routes, Server Actions)
// Prisma adapter 포함 — Edge Runtime에서 사용 불가
export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 90, // 90일
  },
  callbacks: {
    authorized: authConfig.callbacks!.authorized!,
    async signIn({ user, account }) {
      if (!user?.email || !account) return true

      // 동일 이메일로 다른 provider가 이미 등록된 경우 감지
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
        select: { accounts: { select: { provider: true }, take: 1 } },
      })

      if (existing?.accounts.length) {
        const existingProvider = existing.accounts[0].provider
        if (existingProvider !== account.provider) {
          return `/login?error=OAuthAccountNotLinked&provider=${existingProvider}`
        }
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session?.image) token.picture = session.image
      if (user?.role) token.role = user.role
      // 최초 로그인, 세션 갱신, 또는 토큰에 onboardingVersion이 없을 때 DB 조회
      if (trigger === 'signIn' || trigger === 'update' || !('onboardingVersion' in token)) {
        // User 존재 여부 검증 — race condition(동시 소셜 로그인)으로 User row 미생성 시 토큰 무효화
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { id: true, onboarding: { select: { version: true } } },
        })
        if (!dbUser) return null // 토큰 무효화 → NextAuth가 세션 종료 처리
        token.onboardingVersion = dbUser.onboarding?.version ?? null
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = token.role ?? 'USER'
      session.user.onboardingVersion = token.onboardingVersion ?? null
      return session
    },
  },
})
