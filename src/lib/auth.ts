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
    strategy: 'database',
    maxAge: 60 * 60 * 24 * 90, // 90일
  },
  callbacks: {
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { preferences: true },
      })

      session.user.id = user.id
      session.user.onboardingVersion =
        (dbUser?.preferences as { onboardingVersion?: number } | null)
          ?.onboardingVersion ?? null

      return session
    },
  },
})
