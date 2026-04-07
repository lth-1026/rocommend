import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth.config'
import '@/types/auth'

// Node.js 전용 (Server Components, API Routes, Server Actions)
// Prisma adapter 포함 — Edge Runtime에서 사용 불가
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 90, // 90일
  },
  callbacks: {
    authorized: authConfig.callbacks!.authorized!,
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session?.image) token.picture = session.image
      if (user?.role) token.role = user.role
      // 최초 로그인, 세션 갱신, 또는 토큰에 onboardingVersion이 없을 때 DB 조회
      if (trigger === 'signIn' || trigger === 'update' || !('onboardingVersion' in token)) {
        const onboarding = await prisma.onboarding.findUnique({
          where: { userId: token.sub! },
          select: { version: true },
        })
        token.onboardingVersion = onboarding?.version ?? null
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
