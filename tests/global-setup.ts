import { execSync } from 'child_process'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env.test', override: true })

export default async function globalSetup() {
  const testDbUrl = process.env.DATABASE_URL
  if (!testDbUrl) throw new Error('DATABASE_URL not set in .env.test')

  const env = {
    ...process.env,
    DATABASE_URL: testDbUrl,
    // DIRECT_URL이 .env.local에 설정돼 있으면 테스트 DB로 덮어쓴다
    DIRECT_URL: testDbUrl,
  }

  console.log('\n[E2E global-setup] 테스트 DB 마이그레이션 중...')
  execSync('pnpm prisma migrate deploy', { env, stdio: 'inherit' })

  console.log('[E2E global-setup] 테스트 DB 시드 중...')
  execSync('tsx prisma/seed.ts', { env, stdio: 'inherit' })

  console.log('[E2E global-setup] 완료\n')
}
