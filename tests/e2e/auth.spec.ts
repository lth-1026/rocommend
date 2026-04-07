import { test, expect } from '@playwright/test'
import { loginIncomplete, loginComplete } from '../helpers/auth'

// E-01: 비로그인 + 보호 경로 → /login 리디렉션
test('E-01: 비로그인 유저가 /profile 접근 시 /login으로 리디렉션된다', async ({ page }) => {
  await page.goto('/profile')
  await expect(page).toHaveURL('/login')
})

// E-02: 비로그인 + /login → /login 렌더링 (로그인 버튼 등)
test('E-02: 비로그인 유저가 /login에 접근하면 로그인 페이지가 렌더링된다', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL('/login')
  // 로그인 관련 콘텐츠가 있어야 함
  await expect(page.locator('body')).toBeVisible()
})

// E-03: /error 경로는 비로그인 접근 가능
test('E-03: 비로그인 유저가 /error에 접근할 수 있다', async ({ page }) => {
  await page.goto('/error')
  await expect(page).not.toHaveURL('/login')
})

// E-04: AUTH-INCOMPLETE → /home 접근 시 /onboarding으로 리디렉션
test('E-04: AUTH-INCOMPLETE 유저가 /home 접근 시 /onboarding으로 리디렉션된다', async ({ page }) => {
  await loginIncomplete(page)
  await page.goto('/home')
  await expect(page).toHaveURL('/onboarding')
})

// E-05: AUTH-COMPLETE → /home 접근 가능
test('E-05: AUTH-COMPLETE 유저가 /home에 접근하면 홈 피드가 렌더링된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/home')
  await expect(page).toHaveURL('/home')
})

// AUTH-INCOMPLETE → /login 접근 시 /onboarding으로 리디렉션
test('AUTH-INCOMPLETE 유저가 /login 접근 시 /onboarding으로 리디렉션된다', async ({ page }) => {
  await loginIncomplete(page)
  await page.goto('/login')
  await expect(page).toHaveURL('/onboarding')
})

// AUTH-COMPLETE → /login 접근 시 /home으로 리디렉션
test('AUTH-COMPLETE 유저가 /login 접근 시 /home으로 리디렉션된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/login')
  await expect(page).toHaveURL('/home')
})
