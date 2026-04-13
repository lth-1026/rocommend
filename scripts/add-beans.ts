/**
 * 로스터리 사이트에서 시그니처 원두를 추출해 DB에 추가하는 반자동 에이전트
 *
 * 실행: pnpm tsx scripts/add-beans.ts --roastery <로스터리ID> --url <샵URL> [--channel naver]
 *
 * 필수 환경변수:
 *   ANTHROPIC_API_KEY  — Claude Vision API
 *   DATABASE_URL       — Supabase 연결 URL
 *
 * 예시:
 *   pnpm tsx scripts/add-beans.ts \
 *     --roastery cm1234abcd \
 *     --url https://smartstore.naver.com/bluebottle \
 *     --channel naver
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import { chromium } from '@playwright/test'
import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as readline from 'readline'

// ── CLI 인수 파싱 ─────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (flag: string) => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : undefined
  }
  return {
    roasteryId: get('--roastery'),
    url: get('--url'),
    channelKey: get('--channel') ?? 'naver',
  }
}

// ── DB 연결 ──────────────────────────────────────────────

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

// ── Claude Vision 원두 추출 ───────────────────────────────

interface ExtractedBean {
  name: string
  origins: string[]
  roastingLevel: 'LIGHT' | 'MEDIUM' | 'MEDIUM_DARK' | 'DARK'
  decaf: boolean
  cupNotes: string[]
  price: number | null       // 원 단위 (200g 기준 근사치)
  sourceUrl: string | null   // 개별 상품 페이지 URL
  imageUrl: string | null
}

const EXTRACTION_PROMPT = `
이 페이지는 커피 로스터리의 온라인 샵입니다.
페이지에서 시그니처 또는 대표 원두를 5~10개 추출해주세요.

선택 기준:
- 메인 배너, "베스트", "추천", "시그니처" 뱃지가 있는 원두 우선
- 리뷰·판매량이 많아 보이는 원두
- 전체 카탈로그 중 대표성 있는 원두

각 원두의 정보를 아래 JSON 형식으로 반환해주세요.
알 수 없는 필드는 null로 처리하세요.

\`\`\`json
[
  {
    "name": "에티오피아 예가체프 G1",
    "origins": ["에티오피아"],
    "roastingLevel": "LIGHT",
    "decaf": false,
    "cupNotes": ["자몽", "복숭아", "재스민"],
    "price": 18000,
    "sourceUrl": "https://smartstore.naver.com/store/products/12345",
    "imageUrl": "https://..."
  }
]
\`\`\`

roastingLevel 값: LIGHT | MEDIUM | MEDIUM_DARK | DARK
price는 200g 기준 가격(원). 다른 용량이면 200g 기준으로 환산.
sourceUrl은 이 페이지 내 각 상품의 직접 링크.
JSON 외 다른 텍스트 없이 JSON 배열만 반환하세요.
`.trim()

async function extractBeansFromPage(
  screenshotBase64: string,
): Promise<ExtractedBean[]> {
  const client = new Anthropic()

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: screenshotBase64,
            },
          },
          { type: 'text', text: EXTRACTION_PROMPT },
        ],
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''

  // ```json ... ``` 블록 또는 순수 JSON 파싱
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\[[\s\S]*\])/)
  if (!jsonMatch) throw new Error(`JSON 파싱 실패:\n${text}`)

  return JSON.parse(jsonMatch[1]) as ExtractedBean[]
}

// ── 사용자 확인 ───────────────────────────────────────────

function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase() === 'y')
    })
  })
}

// ── DB 저장 ───────────────────────────────────────────────

async function saveBeans(
  prisma: PrismaClient,
  roasteryId: string,
  channelId: string,
  beans: ExtractedBean[],
) {
  let saved = 0
  let skipped = 0

  for (const bean of beans) {
    // 이미 존재하는 원두 스킵 (이름 + 로스터리 기준)
    const existing = await prisma.bean.findFirst({
      where: { roasteryId, name: bean.name },
    })

    if (existing) {
      console.log(`  ⏭  이미 존재: ${bean.name}`)
      skipped++
      continue
    }

    await prisma.bean.create({
      data: {
        roasteryId,
        name: bean.name,
        origins: bean.origins,
        roastingLevel: bean.roastingLevel,
        decaf: bean.decaf,
        cupNotes: bean.cupNotes,
        imageUrl: bean.imageUrl ?? undefined,
        channelPrices: bean.price
          ? {
              create: {
                channelId,
                price: bean.price,
                sourceUrl: bean.sourceUrl ?? undefined,
              },
            }
          : undefined,
      },
    })

    console.log(`  ✅ 저장: ${bean.name} (${bean.price?.toLocaleString() ?? '가격 없음'}원)`)
    saved++
  }

  return { saved, skipped }
}

// ── 메인 ─────────────────────────────────────────────────

async function main() {
  const { roasteryId, url, channelKey } = parseArgs()

  if (!roasteryId || !url) {
    console.error('사용법: pnpm tsx scripts/add-beans.ts --roastery <ID> --url <URL> [--channel naver]')
    process.exit(1)
  }

  const prisma = createPrisma()

  try {
    // 로스터리 + 채널 확인
    const roastery = await prisma.roastery.findUnique({ where: { id: roasteryId } })
    if (!roastery) {
      console.error(`로스터리를 찾을 수 없습니다: ${roasteryId}`)
      process.exit(1)
    }

    const channel = await prisma.roasteryChannel.findUnique({
      where: { roasteryId_channelKey: { roasteryId, channelKey } },
    })
    if (!channel) {
      console.error(`채널이 없습니다: ${roasteryId} / ${channelKey}`)
      console.error('먼저 어드민에서 채널을 등록하세요.')
      process.exit(1)
    }

    console.log(`\n=== 원두 추가 에이전트 ===`)
    console.log(`로스터리: ${roastery.name}`)
    console.log(`채널: ${channelKey}`)
    console.log(`URL: ${url}\n`)

    // Playwright로 페이지 열기
    console.log('[1/3] 페이지 로딩 중...')
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    await page.waitForTimeout(2000) // 추가 렌더링 대기

    // 전체 페이지 스크린샷
    const screenshot = await page.screenshot({ fullPage: true, type: 'png' })
    await browser.close()

    const screenshotBase64 = screenshot.toString('base64')
    console.log('[2/3] Claude Vision으로 원두 추출 중...')

    // Claude Vision으로 추출
    let beans: ExtractedBean[]
    try {
      beans = await extractBeansFromPage(screenshotBase64)
    } catch (err) {
      console.error('Vision 추출 실패:', err)
      process.exit(1)
    }

    // 추출 결과 출력
    console.log(`\n추출된 원두 ${beans.length}개:\n`)
    beans.forEach((bean, i) => {
      console.log(`  ${i + 1}. ${bean.name}`)
      console.log(`     원산지: ${bean.origins.join(', ')}`)
      console.log(`     로스팅: ${bean.roastingLevel}${bean.decaf ? ' (디카페인)' : ''}`)
      console.log(`     컵노트: ${bean.cupNotes.join(', ')}`)
      console.log(`     가격: ${bean.price?.toLocaleString() ?? '없음'}원`)
      console.log(`     URL: ${bean.sourceUrl ?? '없음'}`)
      console.log('')
    })

    // 사용자 확인
    const ok = await confirm('[3/3] 이 원두들을 DB에 저장할까요? (y/n) ')
    if (!ok) {
      console.log('취소됨.')
      return
    }

    const { saved, skipped } = await saveBeans(prisma, roasteryId, channel.id, beans)
    console.log(`\n완료: ${saved}개 저장, ${skipped}개 스킵`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('치명적 오류:', err)
  process.exit(1)
})
