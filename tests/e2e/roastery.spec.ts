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
// SortSelector는 모바일 toolbar(lg:hidden)에만 렌더링됨 → 모바일 뷰포트 사용
test('E-14: 정렬 선택 시 URL에 sort 파라미터가 반영된다', async ({ page }) => {
  await page.setViewportSize({ width: 767, height: 900 })
  await loginComplete(page)
  await page.goto('/roasteries')

  const sortButton = page.getByRole('button', { name: '정렬 기준' }).first()
  await expect(sortButton).toBeEnabled()
  await sortButton.click()
  await page.getByRole('button', { name: '이름순' }).click()

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

// E-18: 가격대 필터 단일 선택
// 데스크탑: "가격대" pill 클릭 → dropdown 열림 → checkbox 선택
test('E-18: 가격대 필터 선택 시 URL에 price 파라미터가 반영된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries')

  // pill 클릭 → dropdown 오픈 → label 클릭 (shadcn Checkbox + Label)
  await page.getByRole('button', { name: '가격대' }).click()
  await page.locator('label[for="price-LOW"]').last().click()
  await expect(page).toHaveURL(/price=LOW/)
})

// E-19: 가격대 필터 복수 선택 — OR 조건
test('E-19: 가격대 필터 복수 선택 시 해당 가격대 로스터리가 모두 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries?price=LOW&price=MID')

  // 빈 결과 안내문이 없어야 하고 카드가 있어야 함
  await expect(page.getByText('조건에 맞는 로스터리가 없어요.')).not.toBeVisible()
  await expect(page.locator('a[href^="/roasteries/"]').first()).toBeVisible()
})

// E-20: 디카페인 필터
// 데스크탑: "디카페인" toggle button (checkbox 아님)
test('E-20: 디카페인 필터 선택 시 URL에 decaf=1이 반영된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries')

  await page.getByRole('button', { name: '디카페인' }).click()
  await expect(page).toHaveURL(/decaf=1/)
})

// E-21: 지역 필터
// 데스크탑: "지역" pill 클릭 → dropdown 열림 → checkbox 선택
test('E-21: 지역 필터 선택 시 URL에 region 파라미터가 반영된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries')

  // pill 클릭 → dropdown 오픈 → label 클릭
  await page.getByRole('button', { name: '지역' }).click()
  await page.locator('label[for="region-부산"]').last().click()
  await expect(page).toHaveURL(/region=/)
})

// E-22: 키워드 검색
test('E-22: 키워드 검색 시 해당 이름을 포함하는 로스터리만 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries?q=프릳츠')

  await expect(page.getByRole('link', { name: /프릳츠/ })).toBeVisible()
})

// E-23: 필터 초기화
test('E-23: 필터 초기화 버튼 클릭 시 모든 필터가 해제된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries?price=LOW&decaf=1&region=부산')

  // 초기화 버튼 클릭 (데스크탑 뷰)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.getByRole('button', { name: '초기화' }).click()

  await expect(page).not.toHaveURL(/price=/)
  await expect(page).not.toHaveURL(/decaf=/)
  await expect(page).not.toHaveURL(/region=/)
})

// E-24: 빈 결과 안내 문구
test('E-24: 필터 결과가 없을 때 안내 문구가 표시된다', async ({ page }) => {
  await loginComplete(page)
  // 존재하지 않는 키워드로 검색
  await page.goto('/roasteries?q=절대존재하지않는로스터리이름xyz')

  await expect(page.getByText('조건에 맞는 로스터리가 없어요.')).toBeVisible()
  await expect(page.getByText('필터를 조정하거나 검색어를 바꿔보세요.')).toBeVisible()
})

// E-25: URL params 유지 (뒤로가기)
test('E-25: 상세 페이지 방문 후 뒤로가기 시 필터 상태가 유지된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/roasteries?price=MID')

  const firstCard = page.locator('a[href^="/roasteries/"]').first()
  await firstCard.click()
  await expect(page).toHaveURL(/\/roasteries\/.+/)

  await page.goBack()
  await expect(page).toHaveURL(/price=MID/)
})
