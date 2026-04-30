import { test, expect } from '@playwright/test'
import { loginIncomplete, loginComplete } from '../helpers/auth'

// E-06: AUTH-INCOMPLETE → /onboarding 접근 허용
test('E-06: AUTH-INCOMPLETE 유저는 /onboarding에 접근할 수 있다', async ({ page }) => {
  await loginIncomplete(page)
  await page.goto('/onboarding')
  await expect(page).toHaveURL('/onboarding')
  await expect(page.getByText('취향 설문')).toBeVisible()
})

// E-07: AUTH-COMPLETE → /onboarding 재접근 시 /home 리디렉션
test('E-07: AUTH-COMPLETE 유저가 /onboarding 접근 시 /home으로 리디렉션된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/onboarding')
  await expect(page).toHaveURL('/home')
})

// E-08: Q1 최소 1개 선택 없이 다음 버튼 비활성
test('E-08: Q1 선택 없이 다음 버튼이 비활성 상태다', async ({ page }) => {
  await loginIncomplete(page)
  await page.goto('/onboarding')

  const nextButton = page.getByRole('button', { name: '다음' })
  await expect(nextButton).toBeDisabled()
})

// E-09: Q3 NO_PREFERENCE 상호 배타
test('E-09: Q3에서 "크게 신경 안 써요" 선택 시 다른 항목이 해제된다', async ({ page }) => {
  await loginIncomplete(page)
  await page.goto('/onboarding')

  // Q1 통과
  await page.getByRole('button', { name: '에스프레소 머신' }).click()
  await page.getByRole('button', { name: '다음' }).click()

  // Q2 통과
  await page.getByRole('button', { name: '주로 온라인' }).click()
  await page.getByRole('button', { name: '다음' }).click()

  // Q3: LOW 먼저 선택 후 NO_PREFERENCE 선택
  await page.getByRole('button', { name: '2만원 미만' }).click()
  await page.getByRole('button', { name: '크게 신경 안 써요' }).click()

  // LOW가 해제되어 있어야 함 — 선택 시에만 bg-primary/10이 붙음 (hover:border-primary/50은 항상 존재)
  const lowButton = page.getByRole('button', { name: '2만원 미만' })
  await expect(lowButton).not.toHaveClass(/bg-primary/)

  // NO_PREFERENCE가 선택된 상태여야 함
  const noPreferenceButton = page.getByRole('button', { name: '크게 신경 안 써요' })
  await expect(noPreferenceButton).toHaveClass(/bg-primary/)
})

// E-10: Q4=FIRST_TIME 분기 — ProgressBar "4/4", 버튼 "완료 및 제출"
test('E-10: Q4=FIRST_TIME 선택 시 ProgressBar 4/4, 버튼이 "완료 및 제출"로 바뀐다', async ({ page }) => {
  await loginIncomplete(page)
  await page.goto('/onboarding')

  // Q1
  await page.getByRole('button', { name: '에스프레소 머신' }).click()
  await page.getByRole('button', { name: '다음' }).click()
  // Q2
  await page.getByRole('button', { name: '주로 온라인' }).click()
  await page.getByRole('button', { name: '다음' }).click()
  // Q3
  await page.getByRole('button', { name: '크게 신경 안 써요' }).click()
  await page.getByRole('button', { name: '다음' }).click()
  // Q4
  await page.getByRole('button', { name: '처음 구매해보려고요' }).click()

  await expect(page.getByText('4 / 4')).toBeVisible()
  await expect(page.getByRole('button', { name: '완료 및 제출' })).toBeVisible()
})

// E-11: Q5 최소 3개 선택 검증
test('E-11: Q5에서 2개 선택 시 버튼 비활성, 3개 선택 시 활성화된다', async ({ page }) => {
  await loginIncomplete(page)
  await page.goto('/onboarding')

  // Q1~Q4 (FIRST_TIME 아닌 경우)
  await page.getByRole('button', { name: '에스프레소 머신' }).click()
  await page.getByRole('button', { name: '다음' }).click()
  await page.getByRole('button', { name: '주로 온라인' }).click()
  await page.getByRole('button', { name: '다음' }).click()
  await page.getByRole('button', { name: '크게 신경 안 써요' }).click()
  await page.getByRole('button', { name: '다음' }).click()
  await page.getByRole('button', { name: '한 달에 한 번' }).click()
  await page.getByRole('button', { name: '다음' }).click()

  // Q5: 제출 버튼 초기 비활성
  const submitButton = page.getByRole('button', { name: '완료 및 제출' })
  await expect(submitButton).toBeDisabled()

  // 로스터리 카드들 가져오기
  const cards = page.locator('button.rounded-xl.border').filter({ hasText: /\S/ })
  const count = await cards.count()
  expect(count).toBeGreaterThanOrEqual(3)

  // 1개 선택
  await cards.nth(0).click()
  await expect(submitButton).toBeDisabled()

  // 2개 선택
  await cards.nth(1).click()
  await expect(submitButton).toBeDisabled()

  // 3개 선택 → 활성화
  await cards.nth(2).click()
  await expect(submitButton).toBeEnabled()
})

// E-12: 온보딩 전체 플로우 완료 → /home 리디렉션
test('E-12: Q4=FIRST_TIME 온보딩 완료 후 /home으로 리디렉션된다', async ({ page }) => {
  await loginIncomplete(page, `e2e-firsttime-${Date.now()}@roco.dev`)
  await page.goto('/onboarding')

  // Q1
  await page.getByRole('button', { name: '에스프레소 머신' }).click()
  await page.getByRole('button', { name: '다음' }).click()
  // Q2
  await page.getByRole('button', { name: '주로 온라인' }).click()
  await page.getByRole('button', { name: '다음' }).click()
  // Q3
  await page.getByRole('button', { name: '크게 신경 안 써요' }).click()
  await page.getByRole('button', { name: '다음' }).click()
  // Q4 = FIRST_TIME
  await page.getByRole('button', { name: '처음 구매해보려고요' }).click()
  await page.getByRole('button', { name: '완료 및 제출' }).click()

  await expect(page).toHaveURL('/home', { timeout: 10000 })
})

// E-13(onboarding): 제출 후 /onboarding 재접근 → /home 리디렉션 (AUTH-COMPLETE)
test('E-13: 온보딩 완료 후 /onboarding 재접근 시 /home으로 리디렉션된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/onboarding')
  await expect(page).toHaveURL('/home')
})
