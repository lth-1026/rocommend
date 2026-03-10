import type { Page } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const TEST_TOKEN = process.env.TEST_SESSION_TOKEN ?? ''

interface CreateSessionOptions {
  email?: string
  name?: string
  onboardingVersion?: number | null
}

/**
 * 테스트용 로그인 세션 생성 (OAuth 우회)
 * /api/test/session API를 호출해 JWT 쿠키를 세팅한다
 */
export async function createTestSession(page: Page, options: CreateSessionOptions = {}) {
  const res = await page.request.post(`${BASE_URL}/api/test/session`, {
    headers: { 'x-test-token': TEST_TOKEN },
    data: {
      email: options.email ?? 'test@rocommend.dev',
      name: options.name ?? '테스트 유저',
      onboardingVersion: options.onboardingVersion,
    },
  })

  if (!res.ok()) {
    throw new Error(`세션 생성 실패: ${res.status()} ${await res.text()}`)
  }

  return res.json() as Promise<{ ok: boolean; userId: string }>
}

/** AUTH-INCOMPLETE 상태로 로그인 */
export async function loginIncomplete(page: Page, email = 'incomplete@rocommend.dev') {
  return createTestSession(page, { email, onboardingVersion: null })
}

/** AUTH-COMPLETE 상태로 로그인 */
export async function loginComplete(page: Page, email = 'complete@rocommend.dev') {
  return createTestSession(page, { email, onboardingVersion: 3 })
}
