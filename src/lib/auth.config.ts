import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'
import Naver from 'next-auth/providers/naver'

// Edge Runtime 호환 설정 (Prisma adapter 없음)
// proxy.ts에서 import — Node.js 모듈 사용 불가
export const authConfig: NextAuthConfig = {
  providers: [Google, Kakao, Naver],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith('/login')
      const isApiAuth = nextUrl.pathname.startsWith('/api/auth')

      if (isApiAuth) return true
      if (isAuthPage) return true
      return isLoggedIn
    },
  },
}
