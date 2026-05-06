import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import { withAxiom } from 'next-axiom'

const securityHeaders = [
  // DNS 프리페칭 허용: 외부 도메인 DNS를 미리 조회해 페이지 로딩 속도 향상
  // 미적용 시: 외부 리소스 첫 요청마다 DNS 조회 지연 발생
  { key: 'X-DNS-Prefetch-Control', value: 'on' },

  // HTTPS 강제 (HSTS): 브라우저가 1년간 이 사이트를 HTTPS로만 접근
  // 미적용 시: HTTP로 접근 시 중간자 공격(MITM)으로 트래픽 탈취 가능
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },

  // 클릭재킹 방지: 동일 출처의 iframe만 허용
  // 미적용 시: 악성 사이트가 iframe으로 이 페이지를 숨겨 사용자가 모르게 클릭 유도 가능
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

  // MIME 스니핑 방지: 브라우저가 Content-Type을 임의로 추론하지 않음
  // 미적용 시: 업로드된 파일을 브라우저가 JS로 해석해 XSS 실행 가능
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Referrer 정보 제한: 외부 도메인으로 이동 시 출처 도메인만 전달 (경로·쿼리 제외)
  // 미적용 시: URL에 포함된 사용자 식별 정보(쿼리스트링 등)가 외부로 유출 가능
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // 브라우저 기능 접근 제한: 카메라·마이크·위치 정보 API 사용 차단
  // 미적용 시: 공급망 공격(악성 npm 패키지 등)으로 사용자 기기 접근 가능
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },

  // CSP: 허용된 리소스 출처만 로드·실행 가능하도록 화이트리스트 지정
  // 미적용 시: XSS 공격 성공 시 악성 스크립트가 자유롭게 실행되고 데이터 외부 전송 가능
  {
    key: 'Content-Security-Policy',
    value: [
      // 미지정 리소스는 동일 출처만 허용
      "default-src 'self'",
      // Next.js App Router는 인라인 스크립트·eval 필요 (hydration, turbopack)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://oapi.map.naver.com https://va.vercel-scripts.com",
      // Tailwind CSS 등 CSS-in-JS는 인라인 스타일 필요
      "style-src 'self' 'unsafe-inline'",
      // 소셜 로그인 프로필 이미지 및 Vercel Blob 이미지 허용
      [
        "img-src 'self' data: blob:",
        'https://lh3.googleusercontent.com',
        'https://k.kakaocdn.net http://k.kakaocdn.net https://img1.kakaocdn.net http://img1.kakaocdn.net',
        'https://phinf.pstatic.net https://ssl.pstatic.net',
        'https://*.public.blob.vercel-storage.com',
        // Naver Maps 타일/리소스 이미지
        'https://map.pstatic.net https://*.map.naver.com http://static.naver.net https://static.naver.net',
      ].join(' '),
      // 웹폰트는 동일 출처만
      "font-src 'self'",
      // Sentry 에러 전송, Axiom 로그 전송 허용
      "connect-src 'self' https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://api.axiom.co https://*.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://*.navercorp.com https://oapi.map.naver.com http://oapi.map.naver.com",
      // iframe으로 이 페이지를 삽입하는 것 자체를 차단 (X-Frame-Options 보완)
      "frame-ancestors 'none'",
      // <base> 태그 출처 제한 (base href 하이재킹 방지)
      "base-uri 'self'",
      // 폼 제출 대상 제한
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  images: {
    remotePatterns: [
      // Google 프로필 이미지
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      // Kakao 프로필 이미지 (http/https 모두)
      { protocol: 'https', hostname: 'k.kakaocdn.net', pathname: '/**' },
      { protocol: 'http', hostname: 'k.kakaocdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'img1.kakaocdn.net', pathname: '/**' },
      { protocol: 'http', hostname: 'img1.kakaocdn.net', pathname: '/**' },
      // Naver 프로필 이미지
      { protocol: 'https', hostname: 'phinf.pstatic.net', pathname: '/**' },
      { protocol: 'https', hostname: 'ssl.pstatic.net', pathname: '/**' },
      // Vercel Blob 업로드 이미지
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
    ],
  },
  outputFileTracingIncludes: {
    '/opengraph-image': ['./src/app/fonts/Pretendard-Bold.ttf'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
}

export default withSentryConfig(withAxiom(nextConfig), {
  // Sentry 프로젝트 설정
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Source Map을 Sentry에 업로드하고 번들에서 제거 (보안)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // 빌드 로그 숨김
  silent: !process.env.CI,

  // 빌드 시 Sentry Auth Token 없으면 경고만 출력하고 계속 진행
  authToken: process.env.SENTRY_AUTH_TOKEN,
})
