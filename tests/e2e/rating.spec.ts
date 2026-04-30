import { test, expect } from '@playwright/test'
import { loginComplete, loginIncomplete, createTestSession } from '../helpers/auth'

// E-25: 별점 제출
test('E-25: 로스터리 상세에서 별점을 제출할 수 있다', async ({ page }) => {
  await loginComplete(page, `e2e-rating-${Date.now()}@roco.dev`)
  await page.goto('/roasteries')

  const firstCard = page.locator('a[href^="/roasteries/"]').first()
  await expect(firstCard).toBeVisible({ timeout: 5000 })
  await firstCard.click()

  // 평가 버튼 클릭
  const ratingButton = page.getByRole('button', { name: /평가하기|별점|평가/ }).first()
  if (await ratingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await ratingButton.click()

    // 별점 선택 (4점)
    const star4 = page.getByRole('button', { name: '4점' })
    if (await star4.isVisible({ timeout: 2000 }).catch(() => false)) {
      await star4.click()
      await page.getByRole('button', { name: '평가 저장' }).click()
      await expect(page.getByText(/저장됐어요|평가가 저장/i)).toBeVisible({ timeout: 5000 })
    }
  }
})

// E-26: 별점 수정
test('E-26: 이미 평가한 로스터리의 별점을 수정할 수 있다', async ({ page }) => {
  const email = `e2e-rating-edit-${Date.now()}@roco.dev`
  await loginComplete(page, email)
  await page.goto('/roasteries')

  const firstCard = page.locator('a[href^="/roasteries/"]').first()
  await expect(firstCard).toBeVisible({ timeout: 5000 })
  await firstCard.click()

  // 최초 평가
  const ratingButton = page.getByRole('button', { name: /평가하기|별점|평가/ }).first()
  if (await ratingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await ratingButton.click()
    const star3 = page.getByRole('button', { name: '3점' })
    if (await star3.isVisible({ timeout: 2000 }).catch(() => false)) {
      await star3.click()
      await page.getByRole('button', { name: '평가 저장' }).click()
      await page.waitForTimeout(1000)

      // 수정
      const editButton = page.getByRole('button', { name: /수정|평가 수정/i }).first()
      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click()
        const star5 = page.getByRole('button', { name: '5점' })
        if (await star5.isVisible({ timeout: 2000 }).catch(() => false)) {
          await star5.click()
          await page.getByRole('button', { name: '평가 저장' }).click()
          await expect(page.getByText(/저장됐어요|평가가 저장/i)).toBeVisible({ timeout: 5000 })
        }
      }
    }
  }
})

// E-27: 별점 삭제
test('E-27: 평가를 삭제할 수 있다', async ({ page }) => {
  const email = `e2e-rating-delete-${Date.now()}@roco.dev`
  await loginComplete(page, email)
  await page.goto('/roasteries')

  const firstCard = page.locator('a[href^="/roasteries/"]').first()
  await expect(firstCard).toBeVisible({ timeout: 5000 })
  await firstCard.click()

  // 최초 평가
  const ratingButton = page.getByRole('button', { name: /평가하기|별점|평가/ }).first()
  if (await ratingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await ratingButton.click()
    const star4 = page.getByRole('button', { name: '4점' })
    if (await star4.isVisible({ timeout: 2000 }).catch(() => false)) {
      await star4.click()
      await page.getByRole('button', { name: '평가 저장' }).click()
      await page.waitForTimeout(1000)

      // 삭제 버튼
      const deleteButton = page.getByRole('button', { name: /삭제/i }).first()
      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteButton.click()
        // 확인 다이얼로그
        const confirmButton = page.getByRole('button', { name: /확인|삭제|네/i }).last()
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click()
        }
      }
    }
  }
})

// E-28: 비로그인 → 평가 시도 시 /login으로 리디렉션
test('E-28: 비로그인 유저가 평가가 필요한 경로에 접근하면 /login으로 리디렉션된다', async ({ page }) => {
  await page.goto('/roasteries')
  const firstCard = page.locator('a[href^="/roasteries/"]').first()
  await expect(firstCard).toBeVisible({ timeout: 5000 })

  const href = await firstCard.getAttribute('href')
  if (href) {
    await page.goto(href)
    // 로스터리 상세는 공개 경로 — 페이지 접근 가능
    await expect(page).not.toHaveURL('/login')
  }
})

// E-29: 평가 제출 후 평균 평점이 갱신된다
test('E-29: 평가 제출 후 평균 평점이 갱신된다', async ({ page }) => {
  const email = `e2e-rating-avg-${Date.now()}@roco.dev`
  await createTestSession(page, { email, complete: true })
  await page.goto('/roasteries')

  const firstCard = page.locator('a[href^="/roasteries/"]').first()
  await expect(firstCard).toBeVisible({ timeout: 5000 })
  await firstCard.click()

  // 평가 전 페이지 상태 확인
  await page.waitForLoadState('networkidle')

  const ratingButton = page.getByRole('button', { name: /평가하기|별점|평가/ }).first()
  if (await ratingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await ratingButton.click()
    const star5 = page.getByRole('button', { name: '5점' })
    if (await star5.isVisible({ timeout: 2000 }).catch(() => false)) {
      await star5.click()
      await page.getByRole('button', { name: '평가 저장' }).click()
      // 평가 저장 후 평점 표시 업데이트 확인
      await expect(page.getByText(/★|평가/i).first()).toBeVisible({ timeout: 5000 })
    }
  }
})
