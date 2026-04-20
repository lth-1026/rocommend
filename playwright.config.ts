import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

// .env.local: AUTH_SECRET 등 시크릿 (NODE_ENV=test 이면 Next.js가 로드 안 하므로 명시 로드)
dotenv.config({ path: '.env.local' })
// .env.test: 테스트 전용 DATABASE_URL, TEST_SESSION_TOKEN, ENABLE_TEST_API
dotenv.config({ path: '.env.test', override: true })

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // E2E 실행 전 Next.js 빌드 + seed
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: process.env.DATABASE_URL!,
      AUTH_SECRET: process.env.AUTH_SECRET!,
      TEST_SESSION_TOKEN: process.env.TEST_SESSION_TOKEN!,
      ENABLE_TEST_API: '1',
    },
  },
})
