import { beforeEach, afterEach, vi } from 'vitest'

// next/cache 모킹 (Server Action 테스트 시)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// 각 테스트 후 트랜잭션 롤백으로 DB 격리
// (통합 테스트에서 prisma를 직접 사용하는 경우)
beforeEach(async () => {
  // DB 사용하는 테스트는 각 테스트 파일에서 직접 관리
})

afterEach(async () => {
  vi.clearAllMocks()
})
