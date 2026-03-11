import { test, expect } from '@playwright/test'
import { loginComplete } from '../helpers/auth'

// E-13: 로스터리 목록 페이지 접근
test('E-13: 인증된 유저가 /roasteries에 접근하면 목록이 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries')
  await expect(page).toHaveURL('/roasteries')
  await expect(page.getByRole('heading', { name: '로스터리' })).toBeVisible()
})

// E-14: 정렬 선택 시 URL 파라미터 업데이트
test('E-14: 정렬 선택 시 URL에 sort 파라미터가 반영된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries')

  const sortSelect = page.getByRole('combobox', { name: '정렬 기준' })
  await sortSelect.selectOption('name')

  await expect(page).toHaveURL(/sort=name/)
})

// E-15: 로스터리 카드 클릭 시 상세 페이지로 이동
test('E-15: 로스터리 카드 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries')

  const firstCard = page.locator('a[href^="/roasteries/"]').first()
  await firstCard.click()

  await expect(page).toHaveURL(/\/roasteries\/.+/)
})

// E-16: 로스터리 상세 페이지 접근
test('E-16: 로스터리 상세 페이지에서 원두 목록이 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries')

  const firstCard = page.locator('a[href^="/roasteries/"]').first()
  await firstCard.click()

  await expect(page.getByRole('heading', { level: 2, name: /원두 라인업/ })).toBeVisible()
})

// E-17: 존재하지 않는 로스터리 ID 접근 시 not found 처리
test('E-17: 존재하지 않는 로스터리 접근 시 404 페이지가 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries/nonexistent-id-00000')
  await expect(page.getByText('페이지를 찾을 수 없습니다')).toBeVisible()
})
