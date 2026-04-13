/**
 * 네이버 쇼핑 API를 이용한 원두 가격 추적 스크립트
 *
 * 실행: pnpm tsx scripts/price-tracker.ts
 * GitHub Actions에서 매일 KST 03:00에 자동 실행
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// ── DB 연결 ──────────────────────────────────────────────

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

// ── 네이버 쇼핑 API ──────────────────────────────────────

interface NaverShopItem {
  title: string
  link: string
  lprice: string
  mallName: string
  productId: string
}

interface NaverShopResponse {
  total: number
  items: NaverShopItem[]
}

async function searchNaverPrice(
  query: string,
  storeUrlHint?: string,
): Promise<number | null> {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수가 없습니다.')
  }

  const url = new URL('https://openapi.naver.com/v1/search/shop.json')
  url.searchParams.set('query', query)
  url.searchParams.set('display', '10')
  url.searchParams.set('sort', 'sim') // 정확도순

  const res = await fetch(url.toString(), {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  })

  if (!res.ok) {
    console.error(`  [네이버 API 오류] ${res.status} ${await res.text()}`)
    return null
  }

  const data: NaverShopResponse = await res.json()

  if (!data.items?.length) return null

  // storeUrlHint가 있으면 해당 스토어 상품 우선 매칭
  // e.g. "https://smartstore.naver.com/bluebottle" → "bluebottle"
  if (storeUrlHint) {
    const storeSlug = extractStoreSlug(storeUrlHint)
    if (storeSlug) {
      const matched = data.items.find((item) =>
        item.link.includes(storeSlug),
      )
      if (matched) {
        const price = parseInt(matched.lprice, 10)
        return isValidPrice(price) ? price : null
      }
    }
  }

  // 매칭 실패 시 1위 결과 사용
  const price = parseInt(data.items[0].lprice, 10)
  return isValidPrice(price) ? price : null
}

function extractStoreSlug(url: string): string | null {
  // https://smartstore.naver.com/{slug}/... 에서 slug 추출
  const match = url.match(/smartstore\.naver\.com\/([^/?#]+)/)
  return match?.[1] ?? null
}

function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price > 0 && price < 10_000_000
}

// ── HTML 태그 제거 (네이버 API title에 <b> 태그 포함) ────

function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, '')
}

// ── 메인 ─────────────────────────────────────────────────

async function main() {
  const prisma = createPrisma()

  console.log('=== 원두 가격 추적 시작 ===')
  console.log(`실행 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`)
  console.log('')

  try {
    // 네이버 채널에 등록된 모든 원두 + 채널 조회
    const beanPrices = await prisma.beanChannelPrice.findMany({
      where: {
        channel: { channelKey: 'naver' },
      },
      include: {
        bean: { include: { roastery: true } },
        channel: true,
      },
    })

    console.log(`추적 대상: ${beanPrices.length}개 원두\n`)

    let updated = 0
    let skipped = 0
    const failed: string[] = []

    for (const bp of beanPrices) {
      const beanLabel = `${bp.bean.roastery.name} - ${bp.bean.name}`
      const query = `${bp.bean.roastery.name} ${stripHtml(bp.bean.name)}`

      process.stdout.write(`  [조회] ${beanLabel} ... `)

      try {
        const newPrice = await searchNaverPrice(query, bp.channel.url)

        if (newPrice === null) {
          console.log('❌ 가격 없음')
          failed.push(beanLabel)
          continue
        }

        // 스냅샷 저장 (항상)
        await prisma.beanChannelPriceSnapshot.create({
          data: {
            beanId: bp.beanId,
            channelId: bp.channelId,
            price: newPrice,
          },
        })

        // 현재 가격과 다를 때만 업데이트
        if (newPrice !== bp.price) {
          await prisma.beanChannelPrice.update({
            where: { beanId_channelId: { beanId: bp.beanId, channelId: bp.channelId } },
            data: { price: newPrice },
          })
          console.log(`✅ ${bp.price.toLocaleString()}원 → ${newPrice.toLocaleString()}원`)
          updated++
        } else {
          console.log(`✓ ${newPrice.toLocaleString()}원 (변동 없음)`)
          skipped++
        }

        // 네이버 API 과호출 방지 (100ms 간격)
        await new Promise((r) => setTimeout(r, 100))
      } catch (err) {
        console.log('❌ 오류')
        console.error(`    ${err}`)
        failed.push(beanLabel)
      }
    }

    console.log('\n=== 완료 ===')
    console.log(`  업데이트: ${updated}개`)
    console.log(`  변동 없음: ${skipped}개`)
    console.log(`  실패: ${failed.length}개`)

    if (failed.length > 0) {
      console.log('\n실패 목록:')
      failed.forEach((name) => console.log(`  - ${name}`))
      process.exit(1)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('치명적 오류:', err)
  process.exit(1)
})
