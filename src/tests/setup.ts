import { beforeEach, afterEach, vi } from 'vitest'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env.test 명시적 로딩 (Vitest 워크스페이스 프로젝트 환경에서 자동 로딩 미보장)
config({ path: resolve(process.cwd(), '.env.test') })

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
