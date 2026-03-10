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
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      // 최초 로그인: user 객체 존재 — DB에서 onboardingVersion 조회
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { preferences: true },
        })
        token.onboardingVersion =
          (dbUser?.preferences as { onboardingVersion?: number } | null)
            ?.onboardingVersion ?? null
      }

      // 온보딩 완료 후 session.update() 호출 시 재조회
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { preferences: true },
        })
        token.onboardingVersion =
          (dbUser?.preferences as { onboardingVersion?: number } | null)
            ?.onboardingVersion ?? null
      }

      return token
    },
  },
})
