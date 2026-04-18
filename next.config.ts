import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google 프로필 이미지
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      // Kakao 프로필 이미지 (http/https 모두)
      { protocol: 'https', hostname: 'k.kakaocdn.net', pathname: '/**' },
      { protocol: 'http', hostname: 'k.kakaocdn.net', pathname: '/**' },
      // Naver 프로필 이미지
      { protocol: 'https', hostname: 'phinf.pstatic.net', pathname: '/**' },
      { protocol: 'https', hostname: 'ssl.pstatic.net', pathname: '/**' },
      // Vercel Blob 업로드 이미지
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
}

export default withSentryConfig(nextConfig, {
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
