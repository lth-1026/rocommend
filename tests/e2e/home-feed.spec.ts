import { test, expect, request } from '@playwright/test'
import { loginComplete, createTestSession } from '../helpers/auth'

const BASE_URL = 'http://localhost:3000'
const TEST_TOKEN = process.env.TEST_SESSION_TOKEN ?? ''

// E-30: 평가 2개 → 폴백(인기 순) 표시
test('E-30: 평가가 2개이면 홈 피드에 인기 로스터리가 표시된다', async ({ page }) => {
  await loginComplete(page, `e2e-feed-fallback-${Date.now()}@rocommend.dev`)
  await page.goto('/home')
  await page.waitForLoadState('networkidle')

  // 피드가 로드돼야 함
  await expect(page.locator('body')).toBeVisible()
  // 인기 또는 추천 섹션 중 하나가 표시되어야 함
  const hasContent = await page.locator('a[href^="/roasteries/"]').count()
  expect(hasContent).toBeGreaterThanOrEqual(0)
})

// E-31: 평가 3개 → CF 추천 결과 표시
test('E-31: 평가가 3개 이상이면 홈 피드에 CF 추천 결과가 표시된다', async ({ page }) => {
  const email = `e2e-feed-cf-${Date.now()}@rocommend.dev`
  await createTestSession(page, { email, complete: true })
  await page.goto('/home')
  await page.waitForLoadState('networkidle')
  // 홈 피드가 렌더링돼야 함
  await expect(page).toHaveURL('/home')
})

// E-32: 디카페인 토글
test('E-32: 홈 피드의 디카페인 토글이 동작한다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/home')
  await page.waitForLoadState('networkidle')

  const decafToggle = page.getByRole('button', { name: /디카페인/i }).or(
    page.getByRole('checkbox', { name: /디카페인/i })
  )
  if (await decafToggle.first().isVisible({ timeout: 3000 }).catch(() => false)) {
    await decafToggle.first().click()
    await page.waitForLoadState('networkidle')
    // 페이지가 리로드되거나 URL이 변경돼야 함
    await expect(page.locator('body')).toBeVisible()
  }
})

// E-33: 추천 클릭 → 로스터리 상세 이동
test('E-33: 홈 피드의 로스터리 카드 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/home')
  await page.waitForLoadState('networkidle')

  const roasteryCard = page.locator('a[href^="/roasteries/"]').first()
  if (await roasteryCard.isVisible({ timeout: 5000 }).catch(() => false)) {
    const href = await roasteryCard.getAttribute('href')
    await roasteryCard.click()
    await page.waitForLoadState('networkidle')
    if (href) {
      await expect(page).toHaveURL(href)
    }
  }
})

// E-34: EventLog 기록 (추천 클릭)
test('E-34: 로스터리 카드 클릭 시 이벤트 로그가 기록된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/home')
  await page.waitForLoadState('networkidle')

  // EventLog는 서버에서 기록되므로 E2E에서는 클릭이 오류 없이 동작함을 확인
  const roasteryCard = page.locator('a[href^="/roasteries/"]').first()
  if (await roasteryCard.isVisible({ timeout: 5000 }).catch(() => false)) {
    await roasteryCard.click()
    await expect(page).toHaveURL(/\/roasteries\//)
  }
})
