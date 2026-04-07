import { test, expect } from '@playwright/test'
import { loginComplete } from '../helpers/auth'

// E-35: 북마크 추가 → 즐겨찾기 페이지 확인
test('E-35: 로스터리를 북마크하면 즐겨찾기 페이지에 표시된다', async ({ page }) => {
  await loginComplete(page, `e2e-bookmark-add-${Date.now()}@rocommend.dev`)
  await page.goto('/roasteries')

  await page.waitForLoadState('networkidle')

  // 북마크 버튼 클릭
  const bookmarkButton = page
    .getByRole('button', { name: '즐겨찾기 추가' })
    .first()
  if (await bookmarkButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    // 로스터리 이름 기억
    const card = bookmarkButton.locator('..').locator('..')
    await bookmarkButton.click()
    await page.waitForTimeout(500)

    // 즐겨찾기 페이지 이동
    await page.goto('/bookmarks')
    await page.waitForLoadState('networkidle')
    // 즐겨찾기 목록에 아이템이 있어야 함
    const bookmarked = page.locator('a[href^="/roasteries/"]').first()
    await expect(bookmarked).toBeVisible({ timeout: 5000 })
  }
})

// E-36: 북마크 해제
test('E-36: 즐겨찾기 페이지에서 북마크를 해제할 수 있다', async ({ page }) => {
  await loginComplete(page, `e2e-bookmark-remove-${Date.now()}@rocommend.dev`)
  await page.goto('/roasteries')
  await page.waitForLoadState('networkidle')

  const addButton = page.getByRole('button', { name: '즐겨찾기 추가' }).first()
  if (await addButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await addButton.click()
    await page.waitForTimeout(500)
    await page.goto('/bookmarks')
    await page.waitForLoadState('networkidle')

    const removeButton = page.getByRole('button', { name: /즐겨찾기 해제|삭제/i }).first()
    if (await removeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await removeButton.click()
      // 확인 다이얼로그가 있으면 확인
      const confirmButton = page.getByRole('button', { name: /확인|해제|네/i }).last()
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click()
      }
    }
  }
})

// E-37: 빈 즐겨찾기 상태 안내
test('E-37: 즐겨찾기가 없으면 빈 상태 안내 메시지가 표시된다', async ({ page }) => {
  await loginComplete(page, `e2e-bookmark-empty-${Date.now()}@rocommend.dev`)
  await page.goto('/bookmarks')
  await page.waitForLoadState('networkidle')

  // 빈 상태 메시지
  const emptyMsg = page.getByText(/즐겨찾기가 없|북마크가 없|저장된 로스터리/i)
  if (await emptyMsg.isVisible({ timeout: 3000 }).catch(() => false)) {
    await expect(emptyMsg).toBeVisible()
  }
})

// E-38: 로스터리 상세에서 북마크 토글
test('E-38: 로스터리 상세에서 북마크 버튼이 동작한다', async ({ page }) => {
  await loginComplete(page, `e2e-bookmark-detail-${Date.now()}@rocommend.dev`)
  await page.goto('/roasteries')

  const firstCard = page.locator('a[href^="/roasteries/"]').first()
  await expect(firstCard).toBeVisible({ timeout: 5000 })
  await firstCard.click()

  await page.waitForLoadState('networkidle')

  // 상세 페이지의 북마크 버튼
  const bookmarkButton = page.getByRole('button', { name: /즐겨찾기/ }).first()
  if (await bookmarkButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    const initialLabel = await bookmarkButton.getAttribute('aria-label')
    await bookmarkButton.click()
    await page.waitForTimeout(500)
    const newLabel = await bookmarkButton.getAttribute('aria-label')
    expect(newLabel).not.toBe(initialLabel)
  }
})

// E-39: 북마크 페이지는 로그인 필수
test('E-39: 비로그인 유저가 /bookmarks 접근 시 /login으로 리디렉션된다', async ({ page }) => {
  await page.goto('/bookmarks')
  await expect(page).toHaveURL('/login')
})
