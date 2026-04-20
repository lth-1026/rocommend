import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'
import Naver from 'next-auth/providers/naver'
import '@/types/auth'

// Edge Runtime 호환 설정 (Prisma adapter 없음)
// proxy.ts에서 import — Node.js 모듈 사용 불가

// 공개 경로 관리 규칙:
// - 새 페이지가 비로그인 접근 가능해야 하면 여기에 추가
// - 그 외 경로는 자동으로 로그인 필요 (authorized 콜백에서 /login 리다이렉트)
// - 어드민 전용은 별도 처리 (아래 /admin 블록)
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/error',
  '/api/auth',
  '/api/test',
  '/roasteries',
  '/settings',
  '/legal', // 개인정보처리방침·이용약관 — 비로그인 접근 허용
  '/opengraph-image', // OG 이미지 — SNS 크롤러 접근 허용
]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => (p === '/' ? pathname === '/' : pathname.startsWith(p)))
}

export const authConfig: NextAuthConfig = {
  providers: [Google, Kakao, Naver],
  pages: {
    signIn: '/login',
    error: '/error',
  },
  callbacks: {
    // Edge Runtime에서 JWT → session 매핑 (Prisma 없음)
    // auth.ts의 session callback은 Node.js 전용이므로 여기서 중복 정의 필요
    session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = token.role ?? 'USER'
      session.user.onboardingVersion = token.onboardingVersion ?? null
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl
      const isLoggedIn = !!auth?.user
      const isAdmin = auth?.user?.role === 'ADMIN'
      const isOnboardingComplete = auth?.user?.onboardingVersion != null

      // 어드민 전용 경로
      if (pathname.startsWith('/admin')) {
        if (!isLoggedIn) return Response.redirect(new URL('/login', nextUrl))
        if (!isAdmin) return Response.redirect(new URL('/', nextUrl))
        return true
      }

      // 비로그인 → 공개 경로는 통과, 보호 경로는 /login
      if (!isLoggedIn) {
        if (isPublicPath(pathname)) return true
        return Response.redirect(new URL('/login', nextUrl))
      }

      // AUTH-COMPLETE가 /login → /
      if (pathname.startsWith('/login') && isOnboardingComplete)
        return Response.redirect(new URL('/', nextUrl))

      // AUTH-INCOMPLETE: /onboarding·/api 외 모든 경로 → /onboarding
      if (
        !isOnboardingComplete &&
        !pathname.startsWith('/onboarding') &&
        !pathname.startsWith('/api')
      )
        return Response.redirect(new URL('/onboarding', nextUrl))

      return true
    },
  },
}
