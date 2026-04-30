import { test, expect } from '@playwright/test'
import { loginComplete } from '../helpers/auth'

// E-40: 프로필 페이지 접근
test('E-40: 인증된 유저가 /profile에 접근하면 프로필 정보가 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/profile')
  await expect(page).toHaveURL('/profile')
  await expect(page.getByRole('heading', { name: '프로필' })).toBeVisible()
  // 이름 또는 이메일이 표시됨
  await expect(page.getByText('테스트 유저').or(page.getByText('complete@roco.dev')).first()).toBeVisible()
})

// E-41: 미인증 유저 접근 시 로그인 리다이렉트
test('E-41: 미인증 유저가 /profile 접근 시 /login으로 리다이렉트된다', async ({ page }) => {
  await page.goto('/profile')
  await expect(page).toHaveURL('/login')
})

// E-42: 활동 요약 표시
test('E-42: 프로필 페이지에 평가 수와 즐겨찾기 수가 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/profile')
  await expect(page.getByText('평가한 로스터리')).toBeVisible()
  // 즐겨찾기는 nav, ActivitySummary 등 여러 곳에 나타남 → first()
  await expect(page.getByText('즐겨찾기').first()).toBeVisible()
})

// E-43: 로그아웃 버튼 존재 확인
test('E-43: 프로필 페이지에 로그아웃 버튼이 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/profile')
  await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible()
})

// E-44: 로그아웃 후 /login으로 리다이렉트
test('E-44: 로그아웃 클릭 시 /login으로 이동한다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/profile')
  await page.getByRole('button', { name: '로그아웃' }).click()
  await expect(page).toHaveURL('/login')
})
