/**
 * roastery-geocode-corrected.json → RoasteryLocation 테이블 시딩
 * 사용: tsx scripts/seed-locations.ts
 */
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'
import pg from 'pg'
import { randomUUID } from 'crypto'

dotenv.config({ path: '.env.local' })

const { Pool } = pg

interface LocationEntry {
  address: string
  lat: number
  lng: number
  isPrimary: boolean
}

interface RoasteryEntry {
  name: string
  locations: LocationEntry[]
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL })

  const raw = readFileSync(join(process.cwd(), 'roastery-geocode-corrected.json'), 'utf-8')
  const entries: RoasteryEntry[] = JSON.parse(raw)

  let inserted = 0
  let skipped = 0
  let notFound = 0

  for (const entry of entries) {
    // DB에서 이름으로 roasteryId 조회 (삭제/숨김 제외)
    const res = await pool.query<{ id: string }>(
      `SELECT id FROM "Roastery" WHERE name = $1 AND "deletedAt" IS NULL AND hidden = false LIMIT 1`,
      [entry.name]
    )

    if (res.rowCount === 0) {
      console.warn(`[NOT FOUND] ${entry.name}`)
      notFound++
      continue
    }

    const roasteryId = res.rows[0].id

    // 이미 location이 있으면 스킵 (중복 방지)
    const existing = await pool.query(
      `SELECT COUNT(*) FROM "RoasteryLocation" WHERE "roasteryId" = $1`,
      [roasteryId]
    )
    if (parseInt(existing.rows[0].count) > 0) {
      console.log(`[SKIP] ${entry.name} — 이미 location 존재`)
      skipped++
      continue
    }

    for (const loc of entry.locations) {
      await pool.query(
        `INSERT INTO "RoasteryLocation" (id, "roasteryId", address, lat, lng, "isPrimary")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUUID(), roasteryId, loc.address, loc.lat, loc.lng, loc.isPrimary]
      )
      inserted++
    }

    console.log(`[OK] ${entry.name} — ${entry.locations.length}개 위치 추가`)
  }

  await pool.end()
  console.log(`\n완료: 추가 ${inserted}개, 스킵 ${skipped}개, 미발견 ${notFound}개`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
