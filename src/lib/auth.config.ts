import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'
import Naver from 'next-auth/providers/naver'

// Edge Runtime 호환 설정 (Prisma adapter 없음)
// proxy.ts에서 import — Node.js 모듈 사용 불가

const PUBLIC_PATHS = ['/login', '/api/auth']

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
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl
      const isLoggedIn = !!auth?.user

      // 공개 경로는 항상 통과
      if (isPublicPath(pathname)) {
        // AUTH-COMPLETE 유저가 /login 접근 시 /home으로 리디렉션
        if (pathname.startsWith('/login') && isLoggedIn) {
          const onboardingVersion = (auth.user as { onboardingVersion?: number | null })
            ?.onboardingVersion ?? null
          if (onboardingVersion !== null) {
            return Response.redirect(new URL('/home', nextUrl))
          }
        }
        return true
      }

      // AUTH-ANON: 미로그인 → /login
      if (!isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl))
      }

      const onboardingVersion = (auth.user as { onboardingVersion?: number | null })
        ?.onboardingVersion ?? null

      // AUTH-INCOMPLETE: 온보딩 미완료 → /onboarding으로 강제 이동
      if (onboardingVersion === null) {
        if (pathname === '/onboarding') return true
        return Response.redirect(new URL('/onboarding', nextUrl))
      }

      // AUTH-COMPLETE: /onboarding 재접근 시 /home으로 리디렉션
      if (pathname === '/onboarding') {
        return Response.redirect(new URL('/home', nextUrl))
      }

      return true
    },
  },
}
