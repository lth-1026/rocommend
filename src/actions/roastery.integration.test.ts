import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { testPrisma, cleanDb } from '@/tests/db-helpers'
import { getRoasteries } from '@/lib/queries/roastery'

const DEFAULT_FILTER = {
  q: '',
  price: [] as import('@/types/roastery').PriceRange[],
  decaf: false,
  regions: [],
  tags: [],
  rated: false,
}

let r1Id: string
let r2Id: string
let r3Id: string
let seoulTagId: string
let busanTagId: string

beforeAll(async () => {
  // 서울, 부산 태그 생성
  const [seoulTag, busanTag] = await Promise.all([
    testPrisma.tag.upsert({
      where: { name_category: { name: '서울', category: 'REGION' } },
      create: { name: '서울', category: 'REGION' },
      update: {},
    }),
    testPrisma.tag.upsert({
      where: { name_category: { name: '부산', category: 'REGION' } },
      create: { name: '부산', category: 'REGION' },
      update: {},
    }),
  ])
  seoulTagId = seoulTag.id
  busanTagId = busanTag.id

  // 로스터리 3개 생성
  const [r1, r2, r3] = await Promise.all([
    testPrisma.roastery.create({
      data: {
        name: '서울LOW',
        priceRange: 'LOW',
        decaf: false,
        tags: { create: { tagId: seoulTagId, isPrimary: true } },
      },
    }),
    testPrisma.roastery.create({
      data: {
        name: '서울MID디카페인',
        priceRange: 'MID',
        decaf: true,
        tags: { create: { tagId: seoulTagId, isPrimary: true } },
      },
    }),
    testPrisma.roastery.create({
      data: {
        name: '부산HIGH',
        priceRange: 'HIGH',
        decaf: false,
        tags: { create: { tagId: busanTagId, isPrimary: true } },
      },
    }),
  ])
  r1Id = r1.id
  r2Id = r2.id
  r3Id = r3.id
})

beforeEach(async () => {
  await cleanDb()
})

afterAll(async () => {
  await testPrisma.roastery.deleteMany({ where: { id: { in: [r1Id, r2Id, r3Id] } } })
  await testPrisma.$disconnect()
})

describe('getRoasteries (integration)', () => {
  // I-18: 가격대 OR 필터
  it('I-18: 가격대 필터는 OR 조건으로 동작한다', async () => {
    const result = await getRoasteries('name', { ...DEFAULT_FILTER, price: ['LOW', 'MID'] })
    const ids = result.map((r) => r.id)
    expect(ids).toContain(r1Id)
    expect(ids).toContain(r2Id)
    expect(ids).not.toContain(r3Id)
  })

  // I-19: 디카페인 필터
  it('I-19: 디카페인 필터는 decaf=true 로스터리만 반환한다', async () => {
    const result = await getRoasteries('name', { ...DEFAULT_FILTER, decaf: true })
    const ids = result.map((r) => r.id)
    expect(ids).toContain(r2Id)
    expect(ids).not.toContain(r1Id)
    expect(ids).not.toContain(r3Id)
  })

  // I-20: 지역 필터
  it('I-20: 지역 필터는 해당 지역 태그를 가진 로스터리만 반환한다', async () => {
    const result = await getRoasteries('name', { ...DEFAULT_FILTER, regions: ['부산'] })
    const ids = result.map((r) => r.id)
    expect(ids).toContain(r3Id)
    expect(ids).not.toContain(r1Id)
  })

  // I-21: AND 조합 필터
  it('I-21: 가격대 + 지역 필터를 AND로 조합한다', async () => {
    const result = await getRoasteries('name', {
      ...DEFAULT_FILTER,
      price: ['MID'],
      regions: ['서울'],
    })
    const ids = result.map((r) => r.id)
    expect(ids).toContain(r2Id)
    expect(ids).not.toContain(r1Id)
    expect(ids).not.toContain(r3Id)
  })

  // I-22: 이름순 정렬
  it('I-22: sort=name이면 이름 오름차순으로 정렬된다', async () => {
    const result = await getRoasteries('name', DEFAULT_FILTER)
    const ourRoasteries = result.filter((r) => [r1Id, r2Id, r3Id].includes(r.id))
    expect(
      ourRoasteries[0].name.localeCompare(ourRoasteries[ourRoasteries.length - 1].name)
    ).toBeLessThan(1)
  })

  // I-23: 필터 없이 모두 반환
  it('I-23: 필터가 없으면 생성한 로스터리가 모두 포함된다', async () => {
    const result = await getRoasteries('name', DEFAULT_FILTER)
    const ids = result.map((r) => r.id)
    expect(ids).toContain(r1Id)
    expect(ids).toContain(r2Id)
    expect(ids).toContain(r3Id)
  })
})
