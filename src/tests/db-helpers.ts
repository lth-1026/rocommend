import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
export const testPrisma = new PrismaClient({ adapter })

/**
 * 통합 테스트 전 사용자 데이터 초기화
 * Roastery/Bean 시드 데이터는 유지하고 사용자 관련 데이터만 삭제
 */
export async function cleanDb() {
  await testPrisma.eventLog.deleteMany()
  await testPrisma.recommendation.deleteMany()
  await testPrisma.bookmark.deleteMany()
  await testPrisma.rating.deleteMany()
  await testPrisma.onboarding.deleteMany()
  await testPrisma.session.deleteMany()
  await testPrisma.account.deleteMany()
  await testPrisma.user.deleteMany()
}
