import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const roasteries = [
  {
    name: '프릳츠커피컴퍼니',
    description: '서울을 대표하는 스페셜티 커피 로스터리로, 빵과 커피를 함께 즐길 수 있는 공간을 운영합니다. 중미와 인도 농장을 직접 방문해 생두를 선별하며 독자적인 블렌드 철학을 가지고 있습니다.',
    regions: ['서울'],
    priceRange: 'LOW' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://fritz.co.kr',
    isOnboardingCandidate: true,
    beans: [
      { name: '서울 시네마', origins: ['에티오피아', '코스타리카'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['밝은 산미', '깨끗한 단맛', '과일'] },
      { name: '올드독', origins: ['코스타리카', '엘살바도르', '인도'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['견과류', '균형잡힌 바디', '부드러운 단맛'] },
      { name: '디카페인', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['부드러운', '달콤한'] },
    ],
  },
  {
    name: '테라로사',
    description: '2002년 강릉에서 시작한 한국 스페셜티 커피의 선구자로, 강릉 본점을 중심으로 전국에 매장을 운영합니다. 산지 직거래 방식으로 브라질, 에티오피아, 르완다 등에서 생두를 직접 구매합니다.',
    regions: ['강원', '서울'],
    priceRange: 'MID' as const,
    decaf: false,
    imageUrl: null,
    website: 'https://terarosa.com',
    isOnboardingCandidate: true,
    beans: [
      { name: '베리블라썸 블렌드', origins: ['에티오피아', '콜롬비아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['과일', '꽃향기', '상큼한 산미'] },
      { name: '에티오피아 예가체페 게뎁 첼베사', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['자두', '달콤새콤', '꽃향기'] },
      { name: '르완다 마헴베 저스틴 부르봉 워시드', origins: ['르완다'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['오렌지필', '대추야자', '진한 단맛'] },
    ],
  },
  {
    name: '커피리브레',
    description: '한국 스페셜티 커피를 상징하는 브랜드로, 독자적인 블렌딩 철학과 ESG·지속가능성에 대한 깊은 고민을 담아 커피를 만듭니다. 다양한 싱글오리진과 시그니처 블렌드를 선보입니다.',
    regions: ['서울'],
    priceRange: 'LOW' as const,
    decaf: false,
    imageUrl: null,
    website: 'https://coffeelibre.kr',
    isOnboardingCandidate: true,
    beans: [
      { name: '배드블러드', origins: ['에티오피아', '코스타리카', '니카라과'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['과일 시럽', '달콤함'] },
      { name: '노서프라이즈', origins: ['인도', '온두라스', '에티오피아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['산미', '과일향', '균형잡힌 단맛'] },
      { name: '다크리브레', origins: ['인도', '콜롬비아', '온두라스'], roastingLevel: 'DARK', decaf: false, cupNotes: ['다크초콜릿', '견과류', '고소함'] },
    ],
  },
  {
    name: '모모스커피',
    description: '한국 최초 WBC 챔피언 전주연 바리스타가 이끄는 부산의 스페셜티 커피 브랜드입니다. 모두를 위한 스페셜티를 슬로건으로 높은 품질의 커피를 합리적인 가격에 제공합니다.',
    regions: ['부산'],
    priceRange: 'LOW' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://momos.co.kr',
    isOnboardingCandidate: true,
    beans: [
      { name: '에스쇼콜라', origins: ['브라질', '에티오피아'], roastingLevel: 'MEDIUM_DARK', decaf: false, cupNotes: ['다크초콜릿', '묵직함', '깔끔한 단맛'] },
      { name: '프루티봉봉', origins: ['에티오피아', '콜롬비아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['과일사탕', '새콤달콤', '쥬시함'] },
      { name: '콜롬비아 아폰테 디카페인', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['초콜릿', '캐러멜 퍼지', '구운 아몬드'] },
    ],
  },
  {
    name: '앤트러사이트',
    description: '2010년 서울 합정동 폐신발공장을 카페로 재탄생시킨 공간 커피 브랜드입니다. 문학·철학·음악적 영감을 담은 독특한 블렌드 네이밍으로 유명하며, 하우스 블렌드와 싱글오리진을 운영합니다.',
    regions: ['서울'],
    priceRange: 'LOW' as const,
    decaf: false,
    imageUrl: null,
    website: 'https://anthracitecoffee.com',
    isOnboardingCandidate: true,
    beans: [
      { name: '버터팻 트리오', origins: ['과테말라', '콜롬비아', '에티오피아', '브라질', '인도네시아'], roastingLevel: 'MEDIUM_DARK', decaf: false, cupNotes: ['묵직한 질감', '다채로운 향미', '균형'] },
      { name: '나쓰메 소세키', origins: ['에티오피아', '콜롬비아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['과일', '달콤함', '부드러운 산미'] },
    ],
  },
  {
    name: '빈브라더스',
    description: '온라인 커피 구독 서비스로 시작해 오프라인 매장과 해외 지점까지 확장한 서울의 스페셜티 커피 로스터리입니다. 계절별 싱글오리진과 연중 판매 블렌드를 균형 있게 선보입니다.',
    regions: ['서울'],
    priceRange: 'MID' as const,
    decaf: false,
    imageUrl: null,
    website: 'https://www.beanbrothers.co.kr',
    isOnboardingCandidate: true,
    beans: [
      { name: '벨벳화이트', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['달콤함', '시트러스', '부드러운 산미'] },
      { name: '몰트', origins: ['브라질', '콜롬비아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['초콜릿', '고소함', '쌉쌀함'] },
      { name: '케냐 음차나', origins: ['케냐'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['망고', '레드커런트', '오렌지필'] },
    ],
  },
  {
    name: '나무사이로',
    description: '2002년 서울에서 시작해 경기도 성남 분당에 자리잡은 스페셜티 커피 로스터리입니다. 2015년 미국 커피 리뷰 평가 1위를 기록했으며 영국 타임아웃이 선정한 서울 10대 카페 중 하나입니다.',
    regions: ['경기'],
    priceRange: 'LOW' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://namusairo.com',
    isOnboardingCandidate: true,
    beans: [
      { name: '봄의 제전', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['내추럴', '꽃향기', '과일'] },
      { name: '브릴리', origins: ['브라질'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['고소함', '밸런스', '부드러운'] },
      { name: '디카프리오', origins: ['멕시코'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['부드러운', '달콤한'] },
    ],
  },
  {
    name: '웨이브온커피',
    description: '부산 기장에 위치한 오션뷰 스페셜티 커피 로스터리로, 세계건축상과 한국건축문화대상 국무총리상을 받은 건축물로도 유명합니다. 매 시즌 바뀌는 스페셜티 원두를 직접 로스팅합니다.',
    regions: ['부산'],
    priceRange: 'MID' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://waveoncoffee.com',
    isOnboardingCandidate: true,
    beans: [
      { name: '웨이브온 시그니처 블렌드', origins: ['브라질', '에티오피아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['부드러운', '밸런스', '달콤함'] },
      { name: '게이샤 타이드', origins: ['파나마'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['꽃향기', '복숭아', '달콤함'] },
      { name: '디카페인 블렌드', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['달콤한', '부드러운', '견과류'] },
    ],
  },
  {
    name: '502커피로스터스',
    description: '2009년 설립된 경기도 파주 본사의 스페셜티 커피 로스팅 전문 기업으로, 서울 강남과 경기 용인에 매장을 운영합니다. 엄선된 생두와 체계적인 로스팅으로 카페 납품부터 개인 소비까지 다양하게 공급합니다.',
    regions: ['경기', '서울'],
    priceRange: 'LOW' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://502coffee.com',
    isOnboardingCandidate: false,
    beans: [
      { name: 'WELCOME', origins: ['에티오피아', '케냐'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['화사한 산미', '과일', '맑고 깨끗한 단맛'] },
      { name: 'GENTLE', origins: ['콜롬비아', '과테말라'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['은은한 산미', '캐러멜', '밸런스'] },
      { name: 'PILLOW 디카페인', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['달콤한', '부드러운 질감'] },
    ],
  },
  {
    name: '뉴웨이브커피로스터스',
    description: '로스팅 크래프트 저자 유승권 로스터가 운영하는 서울 목동의 스페셜티 커피 로스터리입니다. 2013년 오픈 이후 좋은 밸런스와 클린컵을 추구하며 원두 교육 및 도소매 판매에 집중합니다.',
    regions: ['서울'],
    priceRange: 'LOW' as const,
    decaf: false,
    imageUrl: null,
    website: 'https://newwavecoffee.co.kr',
    isOnboardingCandidate: false,
    beans: [
      { name: '에스프레소 블렌드', origins: ['브라질', '에티오피아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['견과류', '초콜릿', '균형잡힌 바디'] },
      { name: '시즌 싱글오리진', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['과일', '화사한 산미', '클린컵'] },
    ],
  },
  {
    name: '보사노바커피로스터스',
    description: '2015년 강릉 안목해변에서 시작한 스페셜티 커피 로스터리로, HACCP 인증 자체 로스팅 팩토리를 보유합니다. 대표 블렌드 안목블렌드를 비롯해 계절별 싱글오리진을 선보이며 강릉 커피 문화를 이끌고 있습니다.',
    regions: ['강원'],
    priceRange: 'LOW' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://www.bncr.co.kr',
    isOnboardingCandidate: false,
    beans: [
      { name: '안목블렌드', origins: ['브라질', '에티오피아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['진한 바디감', '부드러움', '깔끔한 여운'] },
      { name: '에티오피아 예가체프 아리차 G1 내추럴', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['오렌지', '크리미한 질감', '내추럴 단맛'] },
      { name: '디카페인 에티오피아 짐마', origins: ['에티오피아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['부드러운', '달콤한', '깔끔한'] },
    ],
  },
  {
    name: 'UFO커피로스터스',
    description: '2017년 서울 관악구에서 설립된 스페셜티 커피 로스팅 레이블로, 국가대표급 로스터들이 모여 제철 고품질 생두를 선별합니다. 명확한 개성, 풍부한 단맛, 좋은 밸런스의 클린컵을 추구합니다.',
    regions: ['서울'],
    priceRange: 'LOW' as const,
    decaf: false,
    imageUrl: null,
    website: 'https://ufocoffee.co.kr',
    isOnboardingCandidate: false,
    beans: [
      { name: '스노클', origins: ['에티오피아', '콜롬비아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['상큼한 과실', '은은한 단맛', '밝은 산미'] },
      { name: '캠프파이어', origins: ['케냐', '브라질', '인도'], roastingLevel: 'MEDIUM_DARK', decaf: false, cupNotes: ['카카오', '단맛', '묵직한 바디'] },
    ],
  },
  {
    name: '엘카페커피로스터스',
    description: '서울 용산구에 위치한 스페셜티 커피 로스터리로, 한국스페셜티커피가이드 TOP21 선정 및 블루리본 13년 연속 선정 이력을 보유합니다. 직거래 농장과의 소통을 통해 생산 방식까지 관리합니다.',
    regions: ['서울'],
    priceRange: 'LOW' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://elcafe.co.kr',
    isOnboardingCandidate: true,
    beans: [
      { name: '르완다 부산제 내추럴', origins: ['르완다'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['파인애플', '딸기', '리치'] },
      { name: '에티오피아 예가체프 반코 고티티 워시드', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['라임', '노란꽃', '아카시아꿀'] },
      { name: '엘카페 셀렉션 디카페인', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['부드러운', '달콤한', '클린컵'] },
    ],
  },
  {
    name: '핸즈커피',
    description: '2006년 대구에서 시작한 스페셜티 핸드드립 커피 프랜차이즈 브랜드입니다. 대구·경북을 중심으로 전국에 매장을 운영하며, 시즌마다 5가지 내외의 산지별 스페셜티 원두를 엄선해 제공합니다.',
    regions: ['대구'],
    priceRange: 'MID' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://handscoffee.com',
    isOnboardingCandidate: true,
    beans: [
      { name: '에티오피아 두완초 내추럴 G1', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['내추럴 베리', '달콤한 꽃향기', '부드러운 산미'] },
      { name: '케냐 니에리 AA TOP', origins: ['케냐'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['과일', '밝은 산미', '깔끔한 여운'] },
      { name: '디카페인 스페셜', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['부드러운', '달콤한', '바디감'] },
    ],
  },
  {
    name: '커피명가',
    description: '1990년 대구에서 창업한 한국 1세대 스페셜티 커피 로스터리입니다. 창업자 안명규 대표는 국내 최초 로스팅 머신 개발자이자 한국 커피문화 개척자로 불리며, 30년 이상 스페셜티 커피 보급에 앞장서 왔습니다.',
    regions: ['대구'],
    priceRange: 'MID' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://myungga.com',
    isOnboardingCandidate: true,
    beans: [
      { name: '에스프레소 블렌드 M', origins: ['브라질', '에티오피아', '콜롬비아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['카카오', '블랙베리', '캐러멜'] },
      { name: '에스프레소 프리미엄 블렌드', origins: ['브라질', '과테말라', '에티오피아'], roastingLevel: 'MEDIUM_DARK', decaf: false, cupNotes: ['아몬드', '다크초콜릿', '긴 여운'] },
      { name: '에스프레소 디카페인', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['만다린', '호박', '달고나'] },
    ],
  },
  {
    name: '센터커피',
    description: '스페셜티 커피 이론가 양진호 대표가 운영하는 서울의 스페셜티 커피 로스터리입니다. COE 커피를 직거래로 취급하며, 서울숲·서울역 등 주요 거점에 매장을 운영합니다.',
    regions: ['서울'],
    priceRange: 'MID' as const,
    decaf: false,
    imageUrl: null,
    website: 'https://www.centercoffee.co.kr',
    isOnboardingCandidate: true,
    beans: [
      { name: '에티오피아 싱글오리진', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['베리', '시트러스', '꽃향기'] },
      { name: '게이샤 스페셜', origins: ['파나마'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['재스민', '복숭아', '달콤한 산미'] },
    ],
  },
  {
    name: '자이언트커피로스터스',
    description: '서울 기반의 스페셜티 커피 로스터리로, 개성 있는 블렌드와 싱글오리진을 합리적인 가격에 제공합니다. 고품질 원두를 가치있는 삶과 연결하는 철학으로 지속가능한 커피 문화를 추구합니다.',
    regions: ['서울'],
    priceRange: 'LOW' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://giantcoffeeroasters.com',
    isOnboardingCandidate: false,
    beans: [
      { name: '체리콕', origins: ['에티오피아', '케냐'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['체리', '과일 산미', '달콤한'] },
      { name: '피치 원더랜드', origins: ['에티오피아', '콜롬비아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['복숭아', '달콤함', '화사한'] },
      { name: '콜롬비아 수프리모 슈가케인 디카페인', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['달콤한', '부드러운', '견과류'] },
    ],
  },
  {
    name: '정지영커피로스터즈',
    description: '경기도 수원 행궁동에서 시작한 수원 로컬 스페셜티 커피 브랜드입니다. 합리적인 가격의 직접 로스팅 커피와 베이커리를 제공하며, 수원 스타필드 등 시내 여러 지점을 운영합니다.',
    regions: ['경기'],
    priceRange: 'MID' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://jungjiyoungcoffee.com',
    isOnboardingCandidate: false,
    beans: [
      { name: '에티오피아 모모라 내추럴 구지 G1', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['꿀', '살구', '복숭아', '크림같은 바디'] },
      { name: '미디움로스트 블렌드', origins: ['에티오피아', '콜롬비아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['과일향', '스위트', '균형잡힌'] },
      { name: '콜롬비아 수프리모 디카페인', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['갈색설탕', '다크초콜릿', '깔끔한 후미'] },
    ],
  },
  {
    name: '인더매스',
    description: '서울 성동구 마장동에 위치한 스페셜티 커피 로스터리로, 바리스타와 로스터가 모여 세계 각지의 싱글오리진 원두를 제공합니다. 로링 35kg 로스터기로 일관된 품질을 유지하며 원두 납품과 카페 컨설팅을 병행합니다.',
    regions: ['서울'],
    priceRange: 'MID' as const,
    decaf: false,
    imageUrl: null,
    website: 'https://inthemass.com',
    isOnboardingCandidate: false,
    beans: [
      { name: '에티오피아 반코 내추럴', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: false, cupNotes: ['꽃향기', '복숭아', '달콤한'] },
      { name: '65-SCALE', origins: ['에티오피아', '콜롬비아'], roastingLevel: 'MEDIUM', decaf: false, cupNotes: ['레드 와인', '과일', '복잡한 향미'] },
      { name: '매스 블렌드', origins: ['브라질', '콜롬비아'], roastingLevel: 'MEDIUM_DARK', decaf: false, cupNotes: ['다크초콜릿', '스모키', '깊은 바디'] },
    ],
  },
  {
    name: '디카커피랩',
    description: '국내 최초 디카페인 전문 스페셜티 커피 로스터리입니다. 카페인 99% 제거 공법으로 처리된 다양한 산지의 디카페인 원두를 당일 로스팅 후 당일 발송하여 신선도를 최우선으로 합니다.',
    regions: ['서울'],
    priceRange: 'LOW' as const,
    decaf: true,
    imageUrl: null,
    website: 'https://decacoffeelab.com',
    isOnboardingCandidate: false,
    beans: [
      { name: '디카페인 에티오피아', origins: ['에티오피아'], roastingLevel: 'LIGHT', decaf: true, cupNotes: ['과일향', '밝은 산미', '꽃향기'] },
      { name: '디카페인 콜롬비아', origins: ['콜롬비아'], roastingLevel: 'MEDIUM', decaf: true, cupNotes: ['초콜릿', '캐러멜', '고소한'] },
      { name: '디카페인 스페셜티 블렌드', origins: ['콜롬비아', '브라질'], roastingLevel: 'MEDIUM_DARK', decaf: true, cupNotes: ['다크초콜릿', '견과류', '부드러운 바디'] },
    ],
  },
]

async function main() {
  let roasteryCount = 0
  let beanCount = 0

  for (const { beans, ...roasteryData } of roasteries) {
    // Roastery.name은 unique 제약 없음 → findFirst 후 없으면 생성 (멱등성 보장)
    let roastery = await prisma.roastery.findFirst({ where: { name: roasteryData.name } })
    if (!roastery) {
      roastery = await prisma.roastery.create({ data: roasteryData })
    } else {
      roastery = await prisma.roastery.update({ where: { id: roastery.id }, data: roasteryData })
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
