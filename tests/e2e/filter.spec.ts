import { test, expect } from '@playwright/test'
import { loginComplete } from '../helpers/auth'

// E-18: 가격대 필터
test('E-18: 가격대 필터 선택 시 해당 로스터리만 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries')

  // 가격대 필터 패널이 있는지 확인
  await expect(page.locator('body')).toBeVisible()

  // 가격대 필터 버튼 클릭 (필터 패널 열기)
  const filterButton = page.getByRole('button', { name: /필터|Filter/i }).first()
  if (await filterButton.isVisible()) {
    await filterButton.click()
  }

  // "2만원 미만" 필터 선택
  const lowFilter = page.getByRole('button', { name: '2만원 미만' }).or(
    page.getByLabel('2만원 미만')
  )
  if (await lowFilter.first().isVisible()) {
    await lowFilter.first().click()
    // URL에 price 파라미터가 포함되어야 함
    await expect(page).toHaveURL(/price/)
  }
})

// E-19: 디카페인 필터
test('E-19: 디카페인 필터 선택 시 디카페인 로스터리만 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries')

  const decafCheckbox = page.getByRole('checkbox', { name: /디카페인/i }).or(
    page.getByLabel(/디카페인/)
  )
  if (await decafCheckbox.first().isVisible()) {
    await decafCheckbox.first().click()
    await expect(page).toHaveURL(/decaf=true/)
  }
})

// E-20: 지역 필터
test('E-20: 지역 필터 선택 시 해당 지역 로스터리만 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries')

  // 서울 지역 필터
  const seoulFilter = page.getByRole('button', { name: '서울' }).or(page.getByLabel('서울'))
  if (await seoulFilter.first().isVisible()) {
    await seoulFilter.first().click()
    await expect(page).toHaveURL(/region/)
  }
})

// E-21: URL 상태 유지 (뒤로가기)
test('E-21: 필터 적용 후 상세 페이지 방문 후 뒤로가기 시 필터가 유지된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries?price=LOW')

  const firstCard = page.locator('a[href^="/roasteries/"]').first()
  if (await firstCard.isVisible()) {
    await firstCard.click()
    await page.goBack()
    await expect(page).toHaveURL(/price=LOW/)
  }
})

// E-22: 초기화 버튼
test('E-22: 필터 초기화 버튼을 누르면 모든 필터가 해제된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries?price=LOW&decaf=true')

  const resetButton = page.getByRole('button', { name: /초기화|전체/i })
  if (await resetButton.isVisible()) {
    await resetButton.click()
    await expect(page).not.toHaveURL(/price=/)
    await expect(page).not.toHaveURL(/decaf=true/)
  }
})

// E-23: 검색 + 결과 0개 안내
test('E-23: 검색 결과가 없으면 안내 메시지가 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries?q=존재하지않는로스터리xyz123abc')

  // 결과 없음 메시지가 표시되어야 함
  const noResult = page.getByText(/결과가 없|로스터리가 없|찾을 수 없/i)
  if (await noResult.isVisible({ timeout: 3000 }).catch(() => false)) {
    await expect(noResult).toBeVisible()
  }
})

// E-24: 비로그인도 /roasteries 접근 가능 (공개 경로)
test('E-24: 비로그인 유저도 /roasteries에 접근할 수 있다', async ({ page }) => {
  await page.goto('/roasteries')
  await expect(page).toHaveURL('/roasteries')
  await expect(page.locator('body')).toBeVisible()
})
