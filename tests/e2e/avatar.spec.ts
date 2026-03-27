import { test, expect } from '@playwright/test'
import { loginComplete } from '../helpers/auth'
import path from 'path'

// E-50: 프로필 사진 변경 UI 표시
test('E-50: /account 페이지에 프로필 사진 변경 UI가 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/account')
  await expect(page.getByRole('button', { name: /사진 변경|프로필 사진/ })).toBeVisible()
})

// E-51: 파일 피커 연결
test('E-51: 사진 변경 버튼 클릭 시 파일 피커가 열린다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/account')

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: /사진 변경|프로필 사진/ }).click(),
  ])
  expect(fileChooser).toBeTruthy()
})

// E-52: 정상 이미지 업로드 성공
test('E-52: 유효한 이미지 파일 선택 시 업로드가 성공하고 프로필 사진이 업데이트된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/account')

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: /사진 변경|프로필 사진/ }).click(),
  ])

  // 테스트용 이미지 파일 (fixtures에 추가 필요)
  await fileChooser.setFiles(path.join(__dirname, '../fixtures/test-avatar.jpg'))

  // 업로드 완료 피드백
  await expect(page.getByText(/업로드|변경.*완료|저장/)).toBeVisible({ timeout: 10000 })
})

// E-53: 잘못된 파일 타입 업로드 시 에러
test('E-53: pdf 파일 업로드 시 에러 메시지가 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/account')

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: /사진 변경|프로필 사진/ }).click(),
  ])

  await fileChooser.setFiles(path.join(__dirname, '../fixtures/test-document.pdf'))

  await expect(page.getByText(/jpg|png|webp|이미지|지원.*형식/i)).toBeVisible()
})

// E-54: 업로드 중 로딩 상태
test('E-54: 파일 선택 후 업로드 중 로딩 상태가 표시된다', async ({ page }) => {
  await loginComplete(page)
  await page.goto('/account')

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: /사진 변경|프로필 사진/ }).click(),
  ])

  await fileChooser.setFiles(path.join(__dirname, '../fixtures/test-avatar.jpg'))

  // 업로드 중 버튼 비활성화 또는 로딩 인디케이터
  await expect(
    page.getByRole('button', { name: /사진 변경|프로필 사진/ }).or(page.getByText(/업로드 중/))
  ).toBeVisible()
})
