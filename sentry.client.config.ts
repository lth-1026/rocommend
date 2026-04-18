import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 에러 샘플링: 프로덕션은 100%, 개발은 0%
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,

  // 개발 환경에서는 Sentry 비활성화
  enabled: process.env.NODE_ENV === 'production',
})
