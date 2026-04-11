import dotenv from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Next.js는 .env.local을 사용; Prisma CLI는 직접 읽지 못하므로 명시적으로 로드
dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DIRECT_URL') || env('DATABASE_URL'),
  },
})
