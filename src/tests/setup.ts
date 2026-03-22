import { beforeEach, afterEach, vi } from 'vitest'

// next/cache 모킹 (Server Action 테스트 시)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

beforeEach(async () => {
  // DB 사용하는 통합 테스트는 각 테스트 파일에서 직접 cleanDb() 호출
})

afterEach(async () => {
  vi.clearAllMocks()
})
