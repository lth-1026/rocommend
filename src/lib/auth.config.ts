import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'
import Naver from 'next-auth/providers/naver'
import '@/types/auth'

// Edge Runtime 호환 설정 (Prisma adapter 없음)
// proxy.ts에서 import — Node.js 모듈 사용 불가

const PUBLIC_PATHS = ['/login', '/error', '/api/auth', '/api/test', '/roasteries']

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

export const authConfig: NextAuthConfig = {
  providers: [Google, Kakao, Naver],
  pages: {
    signIn: '/login',
    error: '/error',
  },
  callbacks: {
    jwt({ token, trigger, session }) {
      if (trigger === 'update' && session?.image) {
        token.picture = session.image
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl
      const isLoggedIn = !!auth?.user

      if (isPublicPath(pathname)) {
        // 로그인된 유저가 /login 접근 시 /home으로
        if (pathname.startsWith('/login') && isLoggedIn) {
          return Response.redirect(new URL('/home', nextUrl))
        }
        return true
      }

      // 미로그인 → /login
      if (!isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl))
      }

      return true
    },
  },
}
