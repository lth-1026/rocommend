import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const roasteries = [
  {
    name: '블루보틀 서울',
    regions: ['서울'],
    tags: ['블렌드', '에스프레소'],
    priceRange: 'HIGH' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '미국 스페셜티 커피 브랜드의 서울 지점. 삼청, 성수 등 여러 지점 운영.',
    website: 'https://bluebottlecoffee.com',
    beans: [
      { name: '자이언트 스텝스', origins: ['에티오피아', '콜롬비아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['자몽', '레몬', '복숭아'] },
      { name: '쓰리 아프리카스', origins: ['에티오피아', '케냐', '부룬디'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['베리', '카카오', '흑설탕'] },
    ],
  },
  {
    name: '프릳츠',
    regions: ['서울'],
    tags: ['싱글오리진', '핸드드립'],
    priceRange: 'MID' as const,
    decaf: true,
    isOnboardingCandidate: true,
    description: '도화동에서 시작한 한국 스페셜티 커피의 선구자.',
    website: 'https://fritz.coffee',
    beans: [
      { name: '에티오피아 예가체프 내추럴', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['블루베리', '와인', '다크초콜릿'] },
      { name: '디카페인 블렌드', origins: ['브라질', '콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['헤이즐넛', '카라멜', '밀크초콜릿'] },
    ],
  },
  {
    name: '테라로사',
    regions: ['서울', '강원'],
    tags: ['싱글오리진', '직수입', '마이크로로스터리'],
    priceRange: 'MID' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '강릉 본점을 기반으로 전국 확장. 직접 로스팅 및 공장 운영.',
    website: 'https://terarosa.com',
    beans: [
      { name: '파나마 게이샤', origins: ['파나마'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['자스민', '피치', '망고'] },
      { name: '에콰도르 피친차', origins: ['에콰도르'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['사탕수수', '밀크초콜릿', '호두'] },
    ],
  },
  {
    name: '커피리브레',
    regions: ['서울'],
    tags: ['싱글오리진', '공정무역', '직수입'],
    priceRange: 'MID' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '공정무역 스페셜티 커피 선구자. 원두 직수입 및 로스팅.',
    website: 'https://coffeelibre.kr',
    beans: [
      { name: '에티오피아 코체레 워시드', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['레몬그라스', '얼그레이', '복숭아'] },
      { name: '콜롬비아 우일라 내추럴', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['레드와인', '다크체리', '다크초콜릿'] },
    ],
  },
  {
    name: '앤트러사이트',
    regions: ['서울', '제주'],
    tags: ['싱글오리진', '핸드드립'],
    priceRange: 'MID' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '합정, 한남 등 서울 주요 지역과 제주 운영. 공간과 커피의 조화.',
    website: 'https://anthracitecoffee.com',
    beans: [
      { name: '케냐 키리냐가 AA', origins: ['케냐'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['자몽', '토마토', '카시스'] },
    ],
  },
  {
    name: '모모스커피',
    regions: ['부산'],
    tags: ['싱글오리진', '내추럴', '마이크로로스터리'],
    priceRange: 'MID' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '부산 대표 스페셜티 로스터리. 전국 바리스타 챔피언십 수상.',
    website: 'https://momoscoffee.com',
    beans: [
      { name: '에티오피아 하마 내추럴', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['딸기잼', '장미', '파파야'] },
      { name: '과테말라 안티구아', origins: ['과테말라'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['브라운슈가', '아몬드', '사과'] },
    ],
  },
  {
    name: '카페 온뇨',
    regions: ['부산'],
    tags: ['싱글오리진'],
    priceRange: 'LOW' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '부산 서면 기반의 합리적인 스페셜티 커피.',
    beans: [
      { name: '에티오피아 시다마 워시드', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['레몬', '오렌지', '재스민'] },
    ],
  },
  {
    name: '핸즈커피',
    regions: ['대구'],
    tags: ['블렌드', '에스프레소'],
    priceRange: 'MID' as const,
    decaf: true,
    isOnboardingCandidate: true,
    description: '대구 기반 스페셜티 로스터리 체인.',
    website: 'https://handscoffee.com',
    beans: [
      { name: '에티오피아 예가체프 G1', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['베르가못', '복숭아', '꿀'] },
      { name: '디카페인 케냐', origins: ['케냐'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['자몽', '카라멜'] },
    ],
  },
  {
    name: '빈브라더스',
    regions: ['서울'],
    tags: ['싱글오리진', '워시드'],
    priceRange: 'MID' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '연남동 기반. 명확한 원두 정보와 합리적인 가격.',
    website: 'https://beanbrothers.co.kr',
    beans: [
      { name: '르완다 냐마가베', origins: ['르완다'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['레드베리', '블랙커런트', '캐러멜'] },
      { name: '인도네시아 만델링', origins: ['인도네시아'], roastingLevel: 'DARK', decaf: false, cupNotes: ['다크초콜릿', '흙', '허브'] },
    ],
  },
  {
    name: '롤링폴리',
    regions: ['서울'],
    tags: ['싱글오리진', '마이크로로스터리'],
    priceRange: 'HIGH' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '마포구 기반의 프리미엄 마이크로 로스터리.',
    beans: [
      { name: '파나마 에스메랄다 게이샤', origins: ['파나마'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['자스민', '망고', '복숭아'] },
      { name: '콜롬비아 엘 파라이소', origins: ['콜롬비아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['파인애플', '망고', '패션프루트'] },
    ],
  },
  {
    name: '나무사이로',
    regions: ['서울'],
    tags: ['싱글오리진', '핸드드립'],
    priceRange: 'MID' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '망원동 기반. 계절 원두와 싱글오리진 중심.',
    beans: [
      { name: '케냐 카리미쿠이 AA', origins: ['케냐'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['자몽', '라즈베리', '토마토'] },
    ],
  },
  {
    name: '스텀프타운',
    regions: ['서울'],
    tags: ['블렌드', '에스프레소'],
    priceRange: 'HIGH' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '미국 포틀랜드 스페셜티 브랜드 한국 입점.',
    beans: [
      { name: '헤어 밴더 블렌드', origins: ['에티오피아', '콜롬비아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['다크초콜릿', '캐러멜', '헤이즐넛'] },
    ],
  },
  {
    name: '더 베이커스테이블',
    regions: ['제주'],
    tags: ['싱글오리진', '내추럴'],
    priceRange: 'MID' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '제주 서귀포 기반. 베이커리와 스페셜티 커피 결합.',
    beans: [
      { name: '에티오피아 예가체프 내추럴', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['블루베리', '로즈힙', '홍차'] },
    ],
  },
  {
    name: '드롭탑',
    regions: ['서울', '부산', '대구'],
    tags: ['블렌드', '구독서비스'],
    priceRange: 'LOW' as const,
    decaf: true,
    isOnboardingCandidate: true,
    description: '전국 체인 스페셜티 카페. 합리적인 가격의 다양한 원두.',
    website: 'https://droptop.co.kr',
    beans: [
      { name: '브라질 세하도 내추럴', origins: ['브라질'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['초콜릿', '견과류', '캐러멜'] },
      { name: '디카페인 콜롬비아', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['캐러멜', '사과', '밀크초콜릿'] },
    ],
  },
  {
    name: '커피앤필름',
    regions: ['광주'],
    tags: ['싱글오리진', '워시드'],
    priceRange: 'MID' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '광주 대표 스페셜티 로스터리.',
    beans: [
      { name: '콜롬비아 우일라 워시드', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['초콜릿', '크림', '사과'] },
    ],
  },
  {
    name: '리브레 에스프레소',
    regions: ['서울'],
    tags: ['에스프레소', '블렌드'],
    priceRange: 'MID' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '이태원 기반의 에스프레소 중심 로스터리.',
    beans: [
      { name: '에티오피아 구지 내추럴', origins: ['에티오피아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['딸기', '다크초콜릿', '향신료'] },
    ],
  },
  {
    name: '소울커피',
    regions: ['전북'],
    tags: ['싱글오리진'],
    priceRange: 'LOW' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '전주 기반의 합리적인 스페셜티 카페.',
    beans: [
      { name: '에티오피아 예가체프 G2', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['레몬', '플로럴', '허브'] },
    ],
  },
  {
    name: '로스터리 공간',
    regions: ['인천'],
    tags: ['싱글오리진', '마이크로로스터리'],
    priceRange: 'MID' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '인천 기반의 로스터리 카페.',
    beans: [
      { name: '케냐 티카 AB', origins: ['케냐'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['자몽', '체리', '흑설탕'] },
    ],
  },
  {
    name: '카페 드 무지개',
    regions: ['대전'],
    tags: ['블렌드'],
    priceRange: 'LOW' as const,
    decaf: true,
    isOnboardingCandidate: true,
    description: '대전 기반의 캐주얼 스페셜티 카페.',
    beans: [
      { name: '브라질 옐로우 버번', origins: ['브라질'], roastingLevel: 'MEDIUM_DARK', decaf: false, cupNotes: ['견과류', '다크초콜릿', '설탕'] },
      { name: '디카페인 에티오피아', origins: ['에티오피아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['베리', '플로럴'] },
    ],
  },
  {
    name: '하이엔드 로스터스',
    regions: ['서울'],
    tags: ['싱글오리진', '마이크로로스터리', '직수입'],
    priceRange: 'HIGH' as const,
    decaf: false,
    isOnboardingCandidate: true,
    description: '성수동 기반의 프리미엄 마이크로 로스터리. 희귀 품종 취급.',
    beans: [
      { name: '예멘 하라즈 내추럴', origins: ['예멘'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['블루베리', '와인', '향신료'] },
      { name: '하와이 코나 엑스트라팬시', origins: ['미국'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['마카다미아', '바닐라', '밀크초콜릿'] },
    ],
  },
]

/** name_category 복합키로 Tag를 upsert하고 ID를 반환 */
async function upsertTags(
  regions: string[],
  characteristicTags: string[]
): Promise<{ id: string }[]> {
  const tagData = [
    ...regions.map((name) => ({ name, category: 'REGION' as const })),
    ...characteristicTags.map((name) => ({ name, category: 'CHARACTERISTIC' as const })),
  ]

  return Promise.all(
    tagData.map((tag) =>
      prisma.tag.upsert({
        where: { name_category: { name: tag.name, category: tag.category } },
        create: tag,
        update: {},
        select: { id: true },
      })
    )
  )
}

async function main() {
  let roasteryCount = 0
  let beanCount = 0

  for (const { beans, regions, tags, ...roasteryData } of roasteries) {
    // Roastery.name은 unique 제약 없음 → findFirst 후 없으면 생성 (멱등성 보장)
    let roastery = await prisma.roastery.findFirst({ where: { name: roasteryData.name } })

    const tagIds = await upsertTags(regions, tags)

    if (!roastery) {
      roastery = await prisma.roastery.create({
        data: {
          ...roasteryData,
          tags: { connect: tagIds },
        },
      })
    } else {
      roastery = await prisma.roastery.update({
        where: { id: roastery.id },
        data: {
          ...roasteryData,
          tags: { set: tagIds },
        },
      })
    }
    roasteryCount++

    // Bean은 unique 제약 없음 → 해당 로스터리의 기존 빈을 모두 삭제 후 재생성 (멱등성 보장)
    await prisma.bean.deleteMany({ where: { roasteryId: roastery.id } })
    await prisma.bean.createMany({
      data: beans.map((bean) => ({ ...bean, roasteryId: roastery.id })),
    })
    beanCount += beans.length
  }

  console.log(`Seed complete: ${roasteryCount} roasteries, ${beanCount} beans inserted/updated`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
