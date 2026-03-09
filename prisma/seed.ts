import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.roastery.createMany({
    data: [
      { name: '블루보틀 서울', regions: ['서울'], priceRange: 'HIGH', decaf: false },
      { name: '프릳츠', regions: ['서울'], priceRange: 'MID', decaf: true },
      { name: '테라로사', regions: ['서울', '강릉'], priceRange: 'MID', decaf: false },
      { name: '커피리브레', regions: ['서울'], priceRange: 'MID', decaf: false },
      { name: '앤트러사이트', regions: ['서울', '제주'], priceRange: 'MID', decaf: false },
    ],
    skipDuplicates: true,
  })
  console.log('Seed complete: 5 roasteries inserted')
}

main()
  .catch(console.error)
  .finally(async () => {
    await pool.end()
  })
