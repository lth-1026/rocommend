import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── 타입 ──────────────────────────────────────────────────────────────────
type ChannelKey = 'ns' | 'w' | 'c29'
type PriceMap = Partial<Record<ChannelKey, string>>

interface SeedEntry {
  n: string // name
  r: string // region
  a?: string // address
  un?: number // isOnboardingCandidate (0|1)
  ns?: string // naver smartstore URL
  w?: string // website URL
  c29?: string // 29cm URL
  sb: { n: string; p: PriceMap; d?: number }[] // signature beans (d: 0=regular, 1=decaf)
  desc?: string // description
  tags?: string[] // characteristic tags
}

// ── 데이터 ────────────────────────────────────────────────────────────────
// --- 116개 로스터리 전수 데이터 (태그 및 설명 보강본) ---
const SEED_DATA: SeedEntry[] = [
  {
    n: '프릳츠 커피 컴퍼니',
    r: '서울',
    a: '마포구 도화동 179-9',
    un: 0,
    w: 'https://fritz.co.kr',
    c29: 'https://www.29cm.co.kr/store/brand/1437?brandId=1437',
    sb: [
      { n: '올드독', p: { w: '16,000', c29: '14,080' }, d: 0 },
      { n: '서울 시네마', p: { w: '16,000', c29: '14,080' }, d: 0 },
      { n: '디카페인 Decaffeinated', p: { w: '16,000', c29: '14,080' }, d: 1 },
    ],
    desc: "'코리안 빈티지'를 세계적인 브랜드 반열에 올린 주인공. 베이커리와의 완벽한 조화는 물론, 산지 직거래를 통해 확보한 고품질 생두로 한국적인 스페셜티의 기준을 제시합니다.",
    tags: ['마포', '레트로', '코리안빈티지', '베이커리', '직거래'],
  },
  {
    n: '커피 리브레',
    r: '서울',
    a: '마포구 연남동 227-15',
    un: 0,
    ns: 'https://smartstore.naver.com/coffeelibre',
    w: 'https://coffeelibre.kr',
    sb: [{ n: '배드블러드', p: { ns: '17,000', w: '17,000' }, d: 0 }],
    desc: "한국 스페셜티 커피의 개척자이자 상징. '나초 리브레' 가면 아래 숨겨진 타협 없는 품질 철학으로 매주 전 세계의 귀한 싱글 오리진을 소개합니다.",
    tags: ['연남동', '선구자', '싱글오리진', '스페셜티', '나초리브레'],
  },
  {
    n: '모모스 커피',
    r: '부산',
    a: '영도구 봉래나루로 160',
    un: 1,
    ns: 'https://smartstore.naver.com/momoscoffee',
    w: 'https://momos.co.kr',
    c29: 'https://www.29cm.co.kr/store/brand/6041',
    sb: [
      { n: '프루티봉봉', p: { ns: '16,000', w: '15,000' }, d: 0 },
      { n: '에티오피아 시다모 (디카페인)', p: { ns: '17,000', w: '17,000' }, d: 1 },
    ],
    desc: "월드 바리스타 챔피언(WBC) 전주연 바리스타를 배출하며 부산을 '커피의 도시'로 각인시킨 곳. 영도 바다의 정취와 세계 최고 수준의 추출 설계를 경험할 수 있습니다.",
    tags: ['부산영도', 'WBC우승', '스페셜티성지', '핸드드립', '부산의자부심'],
  },
  {
    n: '빈브라더스',
    r: '서울',
    a: '마포구 토정로 35-1',
    un: 1,
    ns: 'https://smartstore.naver.com/beanbrothers',
    w: 'https://www.beanbrothers.co.kr',
    c29: 'https://www.29cm.co.kr/store/brand/557',
    sb: [
      { n: '블랙수트', p: { ns: '17,000', w: '17,000', c29: '17,000' }, d: 0 },
      { n: '디카페인 브라질', p: { ns: '18,000', w: '18,000', c29: '18,000' }, d: 1 },
    ],
    desc: "'당신의 커피 가이드'라는 슬로건답게 복잡한 커피의 세계를 친절하게 큐레이션합니다. 매달 제안되는 테이스팅 노트를 통해 나만의 취향을 발견할 수 있습니다.",
    tags: ['합정', '커피가이드', '대형팩토리', '큐레이션', '취향맞춤'],
  },
  {
    n: '아이덴티티커피랩',
    r: '서울',
    a: '마포구 망원로 94',
    un: 1,
    ns: 'https://smartstore.naver.com/identity_coffeelab',
    w: 'https://www.identity-coffeelab.co.kr/',
    sb: [
      { n: '차일디시', p: { ns: '18,000', w: '18,000' }, d: 0 },
      { n: '디카페인 에센스', p: { ns: '20,000', w: '20,000' }, d: 1 },
    ],
    desc: "잡미를 극한으로 배제한 '클린컵'의 정점. 원두 본연의 향미를 투명하게 드러내는 로스팅 방식은 커피 매니아들 사이에서 '오픈런'을 부르는 확신을 줍니다.",
    tags: ['망원동', '클린컵', '라이트로스팅', '오픈런', '정교한맛'],
  },
  {
    n: '나무사이로',
    r: '서울',
    a: '종로구 사직로8길 21',
    un: 0,
    w: 'https://namusairo.com',
    c29: 'https://www.29cm.co.kr/store/brand/19962',
    sb: [
      { n: '풍요로운 땅', p: { w: '13,500' }, d: 0 },
      { n: '디카프리오 (디카페인)', p: { w: '16,000' }, d: 1 },
    ],
    desc: '2002년부터 시작된 1세대 스페셜티의 명가. 서촌 한옥에서 느껴지는 서정적인 분위기와 시 같은 네이밍, 예술적인 향미 설계로 깊은 영감을 선사합니다.',
    tags: ['종로', '1세대', '서정적', '한옥카페', '디카페인'],
  },
  {
    n: '알레그리아',
    r: '경기',
    a: '성남시 분당구 판교역로 230',
    un: 0,
    ns: 'https://smartstore.naver.com/alegriacoffee',
    w: 'https://alegriacoffee.com',
    sb: [
      { n: '정글 에스프레소', p: { ns: '17,000', w: '17,600' }, d: 0 },
      { n: '디카페인 브라질 산토스', p: { ns: '18,000', w: '18,000' }, d: 1 },
    ],
    desc: "판교 테크노밸리 직장인들을 사로잡은 ACR. 세련되고 일관된 맛의 밸런스로 '실패 없는 선택'이라는 신뢰를 구축한 독보적인 감각의 로스터리입니다.",
    tags: ['판교', 'ACR', '밸런스', '직장인맛집', '라떼추천'],
  },
  {
    n: '보난자커피',
    r: '서울',
    a: '성동구 뚝섬로 13길 36',
    un: 0,
    w: 'https://bonanzacoffee.kr',
    c29: 'https://www.29cm.co.kr/store/brand/5385',
    sb: [
      { n: '보난자 블렌드', p: { w: '19,000', c29: '19,000' }, d: 0 },
      { n: '디카페인 엘살바도르', p: { w: '21,000', c29: '21,000' }, d: 1 },
    ],
    desc: '베를린에서 시작된 유럽 스페셜티의 자존심. 원두 본연의 캐릭터를 살리는 라이트 로스팅의 선구자로, 미니멀하고 화려한 풍미의 유럽 스타일을 재현합니다.',
    tags: ['성수동', '베를린', '라이트로스팅', '유럽스타일', '미니멀'],
  },
  {
    n: '펠트커피',
    r: '서울',
    a: '마포구 서강로11길 23',
    un: 1,
    ns: 'https://smartstore.naver.com/feltcoffee',
    w: 'https://feltcoffee.com',
    c29: 'https://www.29cm.co.kr/store/brand/20528',
    sb: [
      { n: '클래식', p: { ns: '13,000', w: '13,000' }, d: 0 },
      { n: '디카페인 브라질', p: { ns: '15,000', w: '15,000' }, d: 1 },
    ],
    desc: '미니멀리즘 디자인과 극도의 본질주의 로스팅. 불필요한 장식을 걷어내고 오직 원두의 잠재력을 끌어내는 데 집중하는 미학적인 공간입니다.',
    tags: ['창전동', '미니멀', '본질주의', '무채색', '세련된'],
  },
  {
    n: '피어커피',
    r: '서울',
    a: '성동구 광나루로4가길 9',
    un: 1,
    ns: 'https://smartstore.naver.com/peercoffee',
    w: 'http://peercoffee.co.kr/',
    sb: [
      { n: '피어 블렌드', p: { ns: '16,000', w: '16,000' }, d: 0 },
      { n: '디카페인 콜롬비아', p: { ns: '18,000', w: '18,000' }, d: 1 },
    ],
    desc: '도전적 소싱과 힙한 브랜딩이 만난 성수동 골목의 감각적 로스터리. 스페셜티의 문턱을 낮추는 매력적인 커피 경험을 제안합니다.',
    tags: ['성수동', '도전적', '힙한브랜딩', '감각적', '라이프스타일'],
  },
  {
    n: '로우키 커피',
    r: '서울',
    a: '성동구 연무장길 6',
    un: 1,
    ns: 'https://smartstore.naver.com/lowkeycoffee',
    w: 'https://lowkeycoffee.com',
    c29: 'https://www.29cm.co.kr/store/brand/14037',
    sb: [
      { n: '클라시코', p: { ns: '16,000', w: '16,000' }, d: 0 },
      { n: '디카페인 과테말라', p: { ns: '17,000', w: '17,000' }, d: 1 },
    ],
    desc: "성수동의 상징적인 실력파 로스터리. 화려한 수식어보다 본질인 '맛'에 집중하며 지역 사회와 깊게 호흡하는 신뢰의 브랜드입니다.",
    tags: ['성수동', '실력파', '본질', '편안한', '데일리커피'],
  },
  {
    n: '비전스트롤',
    r: '서울',
    a: '마포구 망원로 61',
    un: 0,
    ns: 'https://smartstore.naver.com/visionstroll',
    sb: [{ n: '비전 블렌드', p: { ns: '16,000' }, d: 0 }],
    desc: '망원동의 묵직한 강배전과 버터푸딩의 환상적 시너지. 진한 원두의 풍미를 사랑하는 이들에게 잊을 수 없는 미식을 선사합니다.',
    tags: ['망원동', '강배전', '버터푸딩', '묵직한', '다크초콜릿'],
  },
  {
    n: '미켈레커피',
    r: '경기',
    a: '성남시 분당구 판교역로 145',
    un: 0,
    ns: 'https://smartstore.naver.com/michelecoffee',
    sb: [
      { n: '미켈레 블렌드', p: { ns: '15,000' }, d: 0 },
      { n: '디카페인 마운틴', p: { ns: '17,000' }, d: 1 },
    ],
    desc: '판교역 인근 바리스타 챔피언의 정교한 추출 설계. 일상의 한 잔을 미식의 영역으로 끌어올리는 완벽한 밸런스를 자랑합니다.',
    tags: ['판교', '밸런스', '챔피언', '정교한', '에스프레소'],
  },
  {
    n: '502 커피로스터스',
    r: '서울',
    a: '금천구 가산디지털1로 149',
    un: 0,
    ns: 'https://smartstore.naver.com/502coffee',
    w: 'https://502coffee.com',
    sb: [
      { n: '502 시그니처', p: { ns: '16,000', w: '16,000' }, d: 0 },
      { n: '필로우 (디카페인)', p: { ns: '18,000', w: '18,000' }, d: 1 },
    ],
    desc: '로스팅 팩토리 기반의 탄탄한 내공을 가진 가산동의 터줏대감. 변함없는 품질로 스페셜티의 대중화에 앞장서는 브랜드입니다.',
    tags: ['가산동', '팩토리', '안정적', '대중성', '가성비'],
  },
  {
    n: '억셉트 커피',
    r: '경기',
    a: '군포시 당정로 28번길 17',
    un: 0,
    ns: 'https://smartstore.naver.com/acceptcoffee',
    w: 'https://acceptcoffee.co.kr/',
    sb: [
      { n: '억셉트 블렌드', p: { ns: '14,000', w: '14,000' }, d: 0 },
      { n: '디카페인 콜롬비아', p: { ns: '16,000', w: '16,000' }, d: 1 },
    ],
    desc: '최첨단 대형 설비를 갖춘 커피 전문 기업. 모든 공정의 데이터화를 통해 일관된 고품질 원두 표준을 제시합니다.',
    tags: ['군포', '대규모', '시스템', '일관성', 'B2B강자'],
  },
  {
    n: '필그림 커피',
    r: '경기',
    a: '의왕시 내손중앙로 4',
    un: 0,
    ns: 'https://smartstore.naver.com/pilgrimcoffeefactory',
    w: 'https://www.pilgrimcoffee.co.kr/',
    sb: [{ n: '사색 블렌드', p: { ns: '16,000' }, d: 0 }],
    desc: '커피 여정을 안내하는 순례자. 생두의 잠재력을 명확하게 끌어내는 향미 표현으로 의왕 지역 매니아들의 안식처가 된 곳입니다.',
    tags: ['의왕', '순례자', '명확한향미', '로컬맛집', '사색'],
  },
  {
    n: 'UFO 커피 로스터스',
    r: '경기',
    a: '성남시 수정구 수정로 167',
    un: 0,
    ns: 'https://smartstore.naver.com/ufocoffee',
    w: 'https://ufocoffee.co.kr/shop',
    sb: [{ n: '갤럭시 믹스', p: { ns: '15,000' }, d: 0 }],
    desc: '우주적인 맛의 탐구라는 유니크한 컨셉의 성남 로컬 강자. 탄탄한 로스팅 내공으로 개성 넘치는 블렌딩을 선보입니다.',
    tags: ['성남', '우주맛', '개성파', '로컬강자', '독특한'],
  },
  {
    n: '호커스포커스',
    r: '경기',
    a: '평택시 장당길 43-15',
    un: 0,
    ns: 'https://smartstore.naver.com/hocuspocus_roasters',
    w: 'https://www.hocuspocus.co.kr/',
    sb: [{ n: '호커스 블렌드', p: { ns: '16,000' }, d: 0 }],
    desc: '평택의 대규모 가든형 로스터리 카페. 마법 같은 공간과 신선한 원두로 일상 속 완벽한 휴식을 선사합니다.',
    tags: ['평택', '가든형', '대형카페', '나들이', '마법'],
  },
  {
    n: '헤이찰리',
    r: '서울',
    a: '성동구 아차산로 11길 7',
    un: 0,
    ns: 'https://smartstore.naver.com/heicharlie',
    w: 'https://www.heicharlie.com/',
    sb: [{ n: '찰리 블렌드', p: { ns: '15,000' }, d: 0 }],
    desc: '성수동의 감각적인 신예 로스터리. 트렌디한 감각과 수준 높은 스페셜티 전문성을 결합한 새로운 영감의 브랜드입니다.',
    tags: ['성수동', '신예', '트렌디', '감각적', '영감'],
  },
  {
    n: '톨드어스토리',
    r: '대전',
    a: '대전 유성구 어은로 52번길 30',
    un: 0,
    ns: 'https://smartstore.naver.com/toldastory',
    w: 'https://toldastory.com',
    sb: [
      { n: '고릴라', p: { ns: '15,000' }, d: 0 },
      { n: '디카페인 콜롬비아', p: { ns: '17,000' }, d: 1 },
    ],
    desc: "대전 스페셜티의 자존심. 영화 같은 스토리텔링이 담긴 블렌딩과 묵직한 바디감의 '고릴라'가 상징적입니다.",
    tags: ['대전', '고릴라', '스토리텔링', '바디감', '묵직한'],
  },
  {
    n: '피에로커피',
    r: '서울',
    a: '강동구 올림픽로48길 31',
    un: 0,
    ns: 'https://smartstore.naver.com/pierrotco',
    w: 'https://pierrotcoffee.co.kr/',
    sb: [{ n: '피에로 블렌드', p: { ns: '15,000' }, d: 0 }],
    desc: '성내동 골목의 유쾌한 반전. 작지만 강한 로스팅으로 원두 본연의 화사함과 단맛을 극대화하여 즐거움을 줍니다.',
    tags: ['성내동', '반전', '유쾌한', '화사함', '단맛'],
  },
  {
    n: '필아웃',
    r: '경기',
    a: '성남시 분당구 벌말로 30번길 12',
    un: 0,
    ns: 'https://smartstore.naver.com/filloutcoffee',
    sb: [{ n: '필아웃 블렌드', p: { ns: '15,000' }, d: 0 }],
    desc: '분당 야탑의 힙플레이스. 확실한 캐릭터의 원두와 힙한 무드로 마시는 즐거움과 보는 즐거움을 동시에 선사합니다.',
    tags: ['야탑', '힙플레이스', '캐릭터', '분당맛집', '인스타감성'],
  },
  {
    n: '한국커피',
    r: '경기',
    a: '광주시 오포읍 상태길 199',
    un: 0,
    ns: 'https://smartstore.naver.com/hankookcoffee',
    w: 'https://hankookcoffee.co.kr',
    sb: [{ n: '벨 칸토', p: { ns: '16,000', w: '16,000' }, d: 0 }],
    desc: '오랜 역사와 전통의 팩토리 로스터리. 변치 않는 신뢰의 품질로 원두 본질의 풍미를 우직하게 구현합니다.',
    tags: ['경기광주', '전통', '신뢰', '본질', '대형팩토리'],
  },
  {
    n: '블랙소울커피',
    r: '서울',
    a: '중구 장충단로 7길 34',
    un: 0,
    ns: 'https://smartstore.naver.com/blacksoulclassic',
    w: 'https://www.blacksoulcoffee.kr/home',
    sb: [{ n: '블랙소울', p: { ns: '15,000' }, d: 0 }],
    desc: '장충동 골목 깊숙한 로스팅 고수. 영혼을 담은 깊고 진한 커피의 정수로 묵직한 풍미의 진수를 보여줍니다.',
    tags: ['장충동', '소울', '깊은맛', '고수', '묵직한'],
  },
  {
    n: '인크 커피',
    r: '서울',
    a: '금천구 가산디지털2로 127-20',
    un: 0,
    ns: 'https://smartstore.naver.com/inccoffee',
    w: 'https://inccoffee.co.kr/',
    sb: [
      { n: '인크 오리진 블렌드', p: { ns: '16,000', w: '16,000' }, d: 0 },
      { n: '다크 오리진 블렌드', p: { ns: '16,000', w: '16,000' }, d: 0 },
    ],
    desc: '가산동의 압도적 대형 카페. 로스팅 과정을 직접 지켜보며 즐기는 개방감과 특별한 휴식을 선사하는 거점입니다.',
    tags: ['가산동', '인크', '대형카페', '개방감', '복합문화공간'],
  },
  {
    n: '디폴트밸류',
    r: '서울',
    a: '서대문구 성산로 333',
    un: 0,
    ns: 'https://smartstore.naver.com/defaultvalue',
    w: 'https://defaultvalue.kr/',
    sb: [{ n: '디폴트 블렌드', p: { ns: '16,000' }, d: 0 }],
    desc: '연희동의 신흥 강자. 사이폰 커피의 정교한 기술력으로 생두의 잠재력을 극대화하며 맛으로 기본을 증명합니다.',
    tags: ['연희동', '사이폰', '기술력', '기본', '추출장인'],
  },
  {
    n: '타셋 커피 로스터스',
    r: '경기',
    a: '파주시 교하로 1229',
    un: 0,
    ns: 'https://smartstore.naver.com/haraneza',
    sb: [{ n: '필업 블렌드', p: { ns: '16,000' }, d: 0 }],
    desc: '커피 조직 파괴를 최소화하는 정교한 로스팅 기술. 파주에서 만나는 깊은 여운의 원두 전문 명소입니다.',
    tags: ['파주', '정교함', '기술력', '깊은여운', '원두전문'],
  },
  {
    n: '가델로 커피',
    r: '경기',
    a: '남양주시 별내5로5번길 4-61',
    un: 0,
    ns: 'https://smartstore.naver.com/gadelo',
    sb: [{ n: '벨벳 블렌드', p: { ns: '14,000' }, d: 0 }],
    desc: '입안을 감싸는 놀라운 벨벳 질감의 블렌딩 천재. 남양주 별내에서 만나는 편안하고 부드러운 스페셜티입니다.',
    tags: ['남양주', '블렌딩', '벨벳질감', '부드러운', '밸런스'],
  },
  {
    n: '딥 다이브 로스터스',
    r: '경기',
    a: '평택시 비전9길 12-14',
    un: 0,
    ns: 'https://smartstore.naver.com/deepdiveroasters',
    sb: [{ n: '딥 블렌드', p: { ns: '15,000' }, d: 0 }],
    desc: '생두 개성을 깊이 파고드는 로스팅. 정교한 프로파일 설계로 평택 스페셜티 수준을 높이는 곳입니다.',
    tags: ['평택', '깊은맛', '탐구', '전문성', '정교한'],
  },
  {
    n: '시에나 커피 로스터스',
    r: '경기',
    a: '화성시 동탄대로14길 5-29',
    un: 0,
    ns: 'https://smartstore.naver.com/siennacoffee',
    sb: [{ n: '모던 블렌드', p: { ns: '16,000' }, d: 0 }],
    desc: '향미 극대화를 추구하는 동탄의 거점. 모던한 감각과 세련된 로스팅으로 신선한 데일리 커피를 약속합니다.',
    tags: ['동탄', '향미', '모던', '데일리', '스페셜티'],
  },
  {
    n: '로스터리 향초',
    r: '충북',
    a: '청주시 서원구 분평로6번길 10',
    un: 0,
    ns: 'https://smartstore.naver.com/hyangcho',
    sb: [{ n: '향초 블렌드', p: { ns: '14,000' }, d: 0 }],
    desc: '상큼달콤한 향미 전문샵. 청주 공간을 가득 채우는 은은한 커피 향으로 기분 좋은 에너지를 전달합니다.',
    tags: ['청주', '상큼달콤', '향미중심', '은은한', '감성'],
  },
  {
    n: '어떤커피',
    r: '경기',
    a: '부천시 조마루로285번길 50',
    un: 0,
    ns: 'https://smartstore.naver.com/whichcoffee',
    sb: [{ n: '어떤 블렌드', p: { ns: '16,000' }, d: 0 }],
    desc: '로스팅 챔피언이 운영하는 부천의 자랑. 다양한 취향을 아우르는 정교한 원두 라인업을 경험할 수 있습니다.',
    tags: ['부천', '챔피언', '취향맞춤', '다양성', '전문성'],
  },
  {
    n: '커피 정경',
    r: '서울',
    a: '은평구 통일로83길 5-6',
    un: 0,
    ns: 'https://smartstore.naver.com/coffeejg',
    sb: [{ n: '정경 블렌드', p: { ns: '15,000' }, d: 0 }],
    desc: '은평구 골목의 조용한 실력파. 맛과 향의 조화를 통해 원두 본연의 깨끗한 뒷맛을 끌어내는 데 집중합니다.',
    tags: ['은평구', '조화', '정갈한', '깨끗한뒷맛', '로컬맛집'],
  },
  {
    n: '58MM 커피 로스터스',
    r: '경기',
    a: '성남시 분당구 판교로25번길 18-5',
    un: 0,
    ns: 'https://smartstore.naver.com/58coffee',
    sb: [{ n: '58MM 시그니처', p: { ns: '15,000' }, d: 0 }],
    desc: '매일 마셔도 질리지 않는 판교의 데일리 스페셜티. 원두의 신선함을 최우선으로 편안한 풍미를 제안합니다.',
    tags: ['판교', '신선함', '데일리', '편안한', '로컬'],
  },
  {
    n: '언더빈',
    r: '경기',
    a: '용인시 수지구 성복2로 76',
    un: 0,
    ns: 'https://smartstore.naver.com/underbean',
    sb: [{ n: '궁금한 콩', p: { ns: '15,000' }, d: 0 }],
    desc: "수지의 유쾌한 스페셜티 거점. 매 시즌 독특한 향미의 '궁금한 콩'을 발굴하여 소개하는 열정적인 곳입니다.",
    tags: ['수지', '재미', '유쾌한', '호기심', '열정'],
  },
  {
    n: '일프로 커피',
    r: '서울',
    a: '송파구 가락로 125',
    un: 0,
    ns: 'https://brand.naver.com/1procoffee',
    sb: [{ n: '뉴크롭 클래식', p: { ns: '13,000' }, d: 0 }],
    desc: '신선한 뉴크롭 원두를 착한 가격에 제공하는 송파의 강자. 대중성과 품질의 완벽한 균형을 보여줍니다.',
    tags: ['송파', '가성비', '뉴크롭', '신선한', '대중적'],
  },
  {
    n: '로스터 릭',
    r: '서울',
    a: '마포구 월드컵로16길 10',
    un: 0,
    ns: 'https://smartstore.naver.com/rick',
    sb: [{ n: '릭 블렌드', p: { ns: '16,000' }, d: 0 }],
    desc: '데이터 중심의 학구적인 마포 로스터리. 투명한 프로파일 공개로 신뢰할 수 있는 맛의 설계도를 제시합니다.',
    tags: ['마포', '학구적', '데이터', '신뢰', '정교한'],
  },
  {
    n: '루비아',
    r: '경기',
    a: '안양시 만안구 박달로 491',
    un: 0,
    ns: 'https://smartstore.naver.com/rubiacoffee',
    sb: [{ n: '루비아 강배전', p: { ns: '14,000' }, d: 0 }],
    desc: '안양 로컬 스페셜티의 자부심. 쓴맛 없이 단맛이 감도는 깊고 진한 강배전의 정석을 보여줍니다.',
    tags: ['안양', '강배전', '전통', '단맛', '묵직한'],
  },
  {
    n: '클로스 커피',
    r: '서울',
    a: '마포구 백범로 152',
    un: 0,
    ns: 'https://smartstore.naver.com/closecoffee',
    sb: [{ n: '클로스 블렌드', p: { ns: '15,000' }, d: 0 }],
    desc: '커피와 더 가까워지는 편안한 맛의 공덕 명소. 친근한 향미 설계로 지역 주민의 아침을 책임집니다.',
    tags: ['마포', '친근함', '공덕역', '편안한', '동네맛집'],
  },
  {
    n: '헤베커피',
    r: '서울',
    a: '중구 필동로 32',
    un: 1,
    ns: 'https://brand.naver.com/hebecoffee',
    w: 'https://www.hebecoffee.kr/',
    c29: 'https://www.29cm.co.kr/store/brand/22094',
    sb: [
      { n: '헤베 블렌드', p: { ns: '16,000' }, d: 0 },
      { n: '디카페인 에티오피아', p: { ns: '18,000' }, d: 1 },
    ],
    desc: '국가대표 임지영 대표의 충무로 자존심. 생동감 넘치는 산미와 화사한 향미로 활력을 선사하는 프리미엄 브랜드입니다.',
    tags: ['충무로', '챔피언', '국가대표', '화사함', '산미'],
  },
  {
    n: '유동 커피',
    r: '제주',
    a: '제주 서귀포 태평로 406',
    un: 0,
    ns: 'https://smartstore.naver.com/youdongcoffeeshop',
    c29: 'https://www.29cm.co.kr/store/brand/56004',
    sb: [{ n: '총각맛', p: { ns: '15,000' }, d: 0 }],
    desc: '서귀포 전설 조유동 바리스타의 유쾌한 개성. 독특한 네이밍과 압도적 실력이 결합된 제주의 명물입니다.',
    tags: ['서귀포', '개성', '유쾌한', '제주명물', '베스트셀러'],
  },
  {
    n: '먼스커피',
    r: '부산',
    a: '부산진구 전포대로225번길 21',
    un: 1,
    ns: 'https://brand.naver.com/monthcoffee',
    w: 'https://www.monthcoffee.com/',
    sb: [
      { n: '메종 블렌드', p: { ns: '12,900' }, d: 0 },
      { n: '디카페인 싱글', p: { ns: '15,000' }, d: 1 },
    ],
    desc: '2022 WCRC 월드 챔피언 문헌관 대표의 전포동 거점. 세계 인정 기술력으로 최상의 원두 컨디션을 제안합니다.',
    tags: ['전포동', '챔피언', '월드클래스', '정밀로스팅', '부산카페'],
  },
  {
    n: '클라리멘토',
    r: '경기',
    a: '고양 덕양구 권율대로 420',
    un: 1,
    ns: 'https://smartstore.naver.com/clarimento',
    sb: [{ n: 'HBC 블렌드', p: { ns: '14,000' }, d: 0 }],
    desc: '명료하고 깨끗한 클린컵의 정수. 각 산지 특징이 선명하게 드러나는 투명한 로스팅을 지향하는 신흥 강자입니다.',
    tags: ['고양', '클린컵', '투명한맛', '명료함', '신흥강자'],
  },
  {
    n: '코페아 커피',
    r: '경기',
    a: '용인시 처인구 모현읍 초부로 192 2동',
    un: 1,
    ns: 'https://smartstore.naver.com/coffeacoffee',
    sb: [{ n: '마돈나 블렌드', p: { ns: '13,600' }, d: 0 }],
    desc: '2007년 국가대표 바리스타 최지욱 대표가 설립한 종합 로스팅 기업. HACCP 인증·생두 직수입으로 월 100t 규모의 일관된 품질을 용인 대형 팩토리에서 제공합니다.',
    tags: ['용인', 'HACCP인증', '생두직수입', '대형로스터리', '2007년창립'],
  },
  {
    n: '시그니쳐 로스터스',
    r: '경기',
    a: '안양시 동안구 경수대로 911',
    un: 1,
    ns: 'https://smartstore.naver.com/signatureroasters',
    sb: [
      { n: '텍스쳐 블렌드', p: { ns: '15,000' }, d: 0 },
      { n: '디카페인 블렌드', p: { ns: '17,000' }, d: 1 },
    ],
    desc: '월드 로스팅 챔피언 장문규 대표의 명확한 캐릭터. 풍부한 질감과 우아한 여운이 특징인 고품격 커피입니다.',
    tags: ['안양', '챔피언', '캐릭터', '우아한여운', '질감'],
  },
  {
    n: '파스텔커피웍스',
    r: '서울',
    a: '마포구 독막로2길 38',
    un: 1,
    ns: 'https://smartstore.naver.com/pastelcoffee',
    w: 'https://pastelcoffee.com/index.html',
    sb: [
      { n: '타이거 펀치', p: { ns: '17,000', w: '14,000' }, d: 0 },
      { n: '디카페인', p: { ns: '18,000', w: '20,500' }, d: 1 },
    ],
    desc: '균형 잡힌 부드러움과 단맛의 조화. 파스텔 톤 향미 설계로 기분 좋은 밸런스를 추구하는 합정역 로스터리입니다.',
    tags: ['합정역', '밸런스', '부드러운', '단맛', '파스텔'],
  },
  {
    n: '블랙업커피',
    r: '부산',
    a: '부산진구 서전로10번길 41',
    un: 1,
    ns: 'https://smartstore.naver.com/blackup_coffee',
    w: 'https://blackupcoffee.com/index.html',
    c29: 'https://www.29cm.co.kr/store/brand/23792',
    sb: [
      { n: '네로 블렌드', p: { ns: '12,600', w: '15,000' }, d: 0 },
      { n: '디카페인 콜롬비아', p: { ns: '14,000', w: '17,000' }, d: 1 },
    ],
    desc: '부산 서면의 스페셜티 자존심. 해수염 커피 베이스 원두를 직접 볶으며 지역 커피 문화를 리드하는 브랜드입니다.',
    tags: ['서면', '해수염', '부산대표', '대형카페', '안정적'],
  },
  {
    n: '향미사',
    r: '경북',
    a: '경주시 사정로 53',
    un: 1,
    ns: 'https://smartstore.naver.com/hyangmisa',
    w: 'https://hyangmisa.com',
    sb: [{ n: '경주 블렌드', p: { ns: '14,000', w: '14,000' }, d: 0 }],
    desc: '황리단길 고즈넉한 정취를 담은 정밀 커피 연구소. 오래된 책방 같은 공간에서 여행의 향기를 더해줍니다.',
    tags: ['경주', '황리단길', '연구소', '감성공간', '여행추천'],
  },
  {
    n: '루베르 로스터리',
    r: '서울',
    a: '서초구 효령로23길 94',
    un: 1,
    ns: 'https://smartstore.naver.com/ruberroastery',
    sb: [{ n: '하이엔드 게이샤', p: { ns: '22,000' }, d: 0 }],
    desc: '희귀 하이엔드 게이샤 전문 방배동 고수. 프리미엄 생두 잠재력을 100% 끌어내는 정교한 기술이 돋보입니다.',
    tags: ['방배동', '하이엔드', '게이샤성지', '프리미엄', '기술력'],
  },
  {
    n: '에어리',
    r: '서울',
    a: '마포구 와우산로29길 4-13',
    un: 1,
    ns: 'https://smartstore.naver.com/aerycoffee',
    sb: [{ n: '에어리 블렌드', p: { ns: '18,000' }, d: 0 }],
    desc: '맑고 청명한 표현의 에티오피아 전문가. 원두 본연의 우아한 꽃향기를 서교동 골목에서 가장 잘 살려냅니다.',
    tags: ['서교동', '맑은맛', '에티오피아', '꽃향기', '우아한'],
  },
  {
    n: '말릭 커피',
    r: '서울',
    a: '마포구 와우산로29길 69',
    un: 1,
    ns: 'https://smartstore.naver.com/undercrema',
    sb: [{ n: '말릭 시그니처', p: { ns: '18,000' }, d: 0 }],
    desc: '홍대 하이엔드 게이샤의 성지. 복합적 향미를 극한으로 올리는 세심한 프로파일링으로 매니아를 사로잡습니다.',
    tags: ['홍대', '하이엔드', '게이샤', '프로파일링', '복합미'],
  },
  {
    n: '커넥츠 커피',
    r: '서울',
    a: '마포구 성지길 60',
    un: 1,
    ns: 'https://smartstore.naver.com/connectscoffee',
    w: 'https://connectscoffee.com',
    sb: [{ n: '커넥츠 블렌드', p: { ns: '13,000', w: '13,000' }, d: 0 }],
    desc: '사람을 잇는 합정역 인근의 따뜻한 브랜드. 대중적인 호불호 없는 맛으로 지역 사회의 사랑방 역할을 합니다.',
    tags: ['합정역', '연결', '사랑방', '대중적', '탄탄한브랜딩'],
  },
  {
    n: '무우수 커피',
    r: '제주',
    a: '제주시 조천읍 신촌북2길 31-2',
    un: 1,
    ns: 'https://smartstore.naver.com/muusu_coffee_roasters',
    sb: [{ n: '무우수 블렌드', p: { ns: '12,000' }, d: 0 }],
    desc: '제주 평온함을 닮은 깔끔한 로스터리. 정교한 마무리로 일상을 잠시 멈추고 여유를 만끽하게 도와줍니다.',
    tags: ['조천읍', '평온', '깔끔한뒷맛', '제주카페', '여유'],
  },
  {
    n: '노띵커피',
    r: '서울',
    a: '중구 필동로 7-1',
    un: 1,
    ns: 'https://smartstore.naver.com/nothincoffee',
    w: 'https://www.nothincoffee.com/main/index.php',
    sb: [{ n: '노띵 블렌드', p: { ns: '12,000', w: '12,000' }, d: 0 }],
    desc: '비움의 미학 실천 공간. 원두의 순수 잠재력을 발굴하며 불필요한 맛을 걷어낸 미니멀 스페셜티를 추구합니다.',
    tags: ['충무로', '미니멀', '비움', '본질', '순수한'],
  },
  {
    n: '커피화 로스터스',
    r: '경기',
    a: '인천 연수구 송도문화로 28',
    un: 1,
    ns: 'https://smartstore.naver.com/coffeehwa',
    sb: [{ n: '커피화 블렌드', p: { ns: '14,000' }, d: 0 }],
    desc: '송도의 예술적 로스팅. 원두마다 고유 스토리를 담아 작품을 큐레이션하듯 정성스러운 경험을 선사합니다.',
    tags: ['송도', '예술', '스토리', '큐레이션', '정성'],
  },
  {
    n: '토치커피',
    r: '서울',
    a: '강남구 논현로24길 41',
    un: 1,
    ns: 'https://smartstore.naver.com/toch',
    sb: [{ n: '토치 블렌드', p: { ns: '12,000' }, d: 0 }],
    desc: '선명 강렬한 에너지의 도곡동 고수. 타협 없이 드러내는 원두 개성으로 마시는 이에게 선명한 인상을 남깁니다.',
    tags: ['도곡동', '에너지', '강렬한', '개성파', '선명한맛'],
  },
  {
    n: '크레이트커피',
    r: '서울',
    a: '용산구 독서당로 97',
    un: 1,
    ns: 'https://smartstore.naver.com/cratecoffee',
    sb: [{ n: '크레이트 블렌드', p: { ns: '16,000' }, d: 0 }],
    desc: '한남동의 감각적 공간과 고품질 큐레이션. 도시인의 취향에 어울리는 완성도 높은 라인업을 리드합니다.',
    tags: ['한남동', '감각', '세련된', '완성도', '취향'],
  },
  {
    n: '가치커피',
    r: '경기',
    a: '인천 부평구 부흥로 267',
    un: 1,
    w: 'https://www.gachicoffee.com/22',
    c29: 'https://www.29cm.co.kr/store/brand/76663',
    sb: [{ n: '가치 블렌드', p: { w: '14,000' }, d: 0 }],
    desc: '가치를 바르게 전달하는 부평 가이드. 이해하기 쉬운 설명과 정직한 로스팅으로 스페셜티 입문을 돕습니다.',
    tags: ['부평', '가치', '가이드', '친절한', '입문추천'],
  },
  {
    n: '블랙로드',
    r: '서울',
    a: '성동구 서울숲2길 19-18 2층',
    un: 1,
    w: 'https://blackroad.kr/23',
    sb: [{ n: '블랙로드 셀렉션', p: { w: '22,000' }, d: 0 }],
    desc: '탐험가 이치훈 대표의 성수 명소. 게이샤 성지로 불리는 희귀 원두 탐험의 즐거움을 패키지에 담았습니다.',
    tags: ['성수', '탐험가', '게이샤성지', '희귀원두', '커피탐험'],
  },
  {
    n: '다이어',
    r: '경기',
    a: '경기 광주 초월읍 경충대로 1234',
    un: 1,
    w: 'https://dyer.kr/index.html',
    sb: [{ n: '다이어 블렌드', p: { w: '16,000' }, d: 0 }],
    desc: '투명 소싱과 데이터 로스팅의 광주 실력파. 매 생산 기록된 프로파일로 신뢰할 수 있는 맛을 보장합니다.',
    tags: ['경기광주', '투명함', '데이터', '일관성', '신뢰'],
  },
  {
    n: '비브레이브',
    r: '제주',
    a: '제주 서귀포 서호중로 85',
    un: 1,
    ns: 'https://smartstore.naver.com/bebravejeju',
    sb: [
      { n: '샤크 블렌드', p: { ns: '16,000' }, d: 0 },
      { n: '디카페인 싱글', p: { ns: '18,000' }, d: 1 },
    ],
    desc: '서귀포 용기 있는 도전. 상어 로고의 강렬한 이미지와 생동감 넘치는 제주 바다 향미의 커피를 선보입니다.',
    tags: ['서귀포', '도전적', '상어로고', '생동감', '제주브랜드'],
  },
  {
    n: '180 커피 로스터스',
    r: '경기',
    a: '성남 분당구 불정로 7',
    un: 1,
    ns: 'https://smartstore.naver.com/180coffeeroasters',
    w: 'https://180coffee.com/',
    sb: [{ n: '초콜릿', p: { ns: '15,000', w: '15,800' }, d: 0 }],
    desc: '혁신적 시도로 180도 다른 경험 선사. 고정관념을 깨는 기법으로 원두의 숨은 매력을 극대화하는 분당 대표입니다.',
    tags: ['분당', '혁신', '고정관념탈피', '실력파', '다양한경험'],
  },
  {
    n: '폰트커피',
    r: '서울',
    a: '용산 한강대로21길 17-18',
    un: 1,
    ns: 'https://smartstore.naver.com/pontcoffee',
    w: 'https://pontcoffee.com/index.html',
    sb: [
      { n: '호이스트 블렌드', p: { ns: '16,000', w: '16,000' }, d: 0 },
      { n: '디카페인 커피', p: { ns: '18,000', w: '16,000' }, d: 1 },
    ],
    desc: '용산 거점의 명료한 맛 디자인. 산미와 단맛을 가장 깨끗하게 설계하여 정갈한 한 잔을 완성합니다.',
    tags: ['용산', '명료함', '정갈한', '디자인', '깨끗한맛'],
  },
  {
    n: 'YM 커피 프로젝트',
    r: '서울',
    a: '은평 연서로29길 21-8',
    un: 1,
    ns: 'https://smartstore.naver.com/ymcoffeeproject',
    sb: [{ n: '홈 시그니처', p: { ns: '10,500' }, d: 0 }],
    desc: '은평 골목의 클래식 감성과 실험 공존. 고전적 깊은 맛과 트렌디한 산미 사이를 자유롭게 오갑니다.',
    tags: ['연신내', '실험', '클래식', '반전매력', '골목맛집'],
  },
  {
    n: '칼라스커피',
    r: '서울',
    a: '마포 월드컵북로16길 8',
    un: 1,
    ns: 'https://smartstore.naver.com/kalascoffee',
    sb: [{ n: '칼라스 블렌드', p: { ns: '17,000' }, d: 0 }],
    desc: '글로벌 인정 완성도 높은 품질. 원두 한 알에 담긴 장인 정신으로 누구나 고개를 끄덕일 정석적 맛을 구현합니다.',
    tags: ['성산동', '완성도', '장인정신', '글로벌', '정석'],
  },
  {
    n: '예셰솔',
    r: '서울',
    a: '성동구 성수동',
    un: 1,
    ns: 'https://smartstore.naver.com/yesyesyall',
    sb: [{ n: '발라드', p: { ns: '16,000' }, d: 0 }],
    desc: '에티오피아 화사함의 성수 명가. 꽃향기와 과일 산미 매니아들의 성지로 로스팅의 화사한 극치를 보여줍니다.',
    tags: ['성수', '화사함', '에티오피아', '꽃향기', '산미맛집'],
  },
  {
    n: '노스모크위드아웃',
    r: '경기',
    a: '수원 팔달구 매산로 139',
    un: 1,
    ns: 'https://smartstore.naver.com/nosmokewithoutfire',
    sb: [{ n: '시그니처', p: { ns: '19,000' }, d: 0 }],
    desc: '수원 주택 개조 힙한 공간. 강렬 선명한 커피 에너지로 방문자에게 잊히지 않는 강한 첫인상을 남깁니다.',
    tags: ['수원', '강렬함', '주택개조', '힙플레이스', '선명한맛'],
  },
  {
    n: '해월커피',
    r: '경기',
    a: '경기 광주 남구로길 9',
    un: 1,
    ns: 'https://smartstore.naver.com/haewolcoffee',
    sb: [{ n: '해월', p: { ns: '13,000' }, d: 0 }],
    desc: '서정성 담은 섬세한 로스팅 광주 명소. 달빛처럼 은은한 향미와 부드러운 뒷맛이 마음을 위로해줍니다.',
    tags: ['광주', '서정성', '은은한', '부드러운', '감성로스팅'],
  },
  {
    n: '파브스커피',
    r: '서울',
    a: '마포 월드컵로14길 19',
    un: 1,
    ns: 'https://smartstore.naver.com/faabscoffee',
    sb: [{ n: '파브스', p: { ns: '16,000' }, d: 0 }],
    desc: '서교동 골목 개성파 정교 프로파일러. 나만의 특별한 취향을 찾고 싶은 이들에게 추천하는 정교한 공간입니다.',
    tags: ['서교동', '개성파', '프로파일러', '취향저격', '정교한'],
  },
  {
    n: '아얀투',
    r: '서울',
    a: '마포 성미산로 153-12',
    un: 1,
    ns: 'https://smartstore.naver.com/ayantu',
    w: 'https://ayantu.co.kr/',
    sb: [{ n: '아얀투 시그니처', p: { ns: '18,000' }, d: 0 }],
    desc: '최신 트렌드 선두 하이엔드 강자. 미래적 가공법과 세련된 프로파일로 앞서가는 커피 경험을 제안합니다.',
    tags: ['마포', '트렌디', '하이엔드', '미래적', '선구자'],
  },
  {
    n: '올웨이즈 어거스트',
    r: '서울',
    a: '마포 망원로6길 18',
    un: 1,
    ns: 'https://alwaysau8ust.co.kr/product/list.html?cate_no=50',
    sb: [{ n: '화이트', p: { ns: '16,000' }, d: 0 }],
    desc: '망원동 8월의 싱그러운 쉼터. 과일 풍부한 향미의 라이트 로스팅으로 입안에 청량한 바람을 선사합니다.',
    tags: ['망원동', '화사함', '라이트로스팅', '청량한', '여름감성'],
  },
  {
    n: '고로커피 로스터스',
    r: '서울',
    a: '관악 남부순환로231길 33',
    un: 1,
    ns: 'https://smartstore.naver.com/gorocoffee',
    sb: [{ n: '고로', p: { ns: '14,000' }, d: 0 }],
    desc: '관악 로컬 강자 탄탄한 내공. 화려함보다 매일 마시는 한 잔에 정성을 다하는 우직함이 돋보이는 곳입니다.',
    tags: ['봉천동', '로컬', '탄탄한', '우직한', '주민추천'],
  },
  {
    n: '키헤이',
    r: '서울',
    a: '강남 테헤란로25길 31',
    un: 1,
    ns: 'https://kihei.kr/product/list.html?cate_no=24',
    sb: [{ n: '키헤이', p: { ns: '17,000' }, d: 0 }],
    desc: '하와이 햇살 담은 강남 오피스 거점. 바쁜 일상 속 정교하게 세공된 한 잔으로 짧고 강렬한 휴식을 줍니다.',
    tags: ['역삼동', '청명함', '오피스맛집', '세공', '강렬한휴식'],
  },
  {
    n: '레이지모먼트',
    r: '부산',
    a: '동래 온천천로453번길 19',
    un: 1,
    ns: 'https://smartstore.naver.com/lazymomentcoffeestand',
    sb: [{ n: '레이지', p: { ns: '16,000' }, d: 0 }],
    desc: '느긋한 미학 본연 맛 집중 동래 명소. 시간에 쫓기지 않고 온전히 음미하는 차분한 로스팅을 지향합니다.',
    tags: ['부산', '느긋함', '미학', '차분한', '온천천'],
  },
  {
    n: '정지영 커피',
    r: '경기',
    a: '수원 팔달구 정조로905번길 13',
    un: 0,
    ns: 'https://jungjiyoungcoffee.com/product/list.html?cate_no=24',
    sb: [{ n: '수워너 다크', p: { ns: '17,000' }, d: 0 }],
    desc: "'WE ARE SUWONER' 수원 랜드마크. 시민의 자부심을 담은 묵직 강렬한 맛의 조화를 선보입니다.",
    tags: ['수원', '힙플레이스', '랜드마크', '수워너', '강렬한'],
  },
  {
    n: '에프엠 커피',
    r: '부산',
    a: '부산진구 전포대로199번길 26',
    un: 0,
    ns: 'https://smartstore.naver.com/fmcoffee',
    sb: [{ n: 'FM 헤리티지', p: { ns: '13,000' }, d: 0 }],
    desc: '전포동 원조 깊은 로스팅 내공. 전통적 스페셜티 가치를 고수하며 묵직한 바디감을 자랑하는 헤리티지입니다.',
    tags: ['전포동', '원조', '헤리티지', '깊은맛', '전통'],
  },
  {
    n: '모지포그라운드',
    r: '부산',
    a: '부산진구 전포대로190번길 3',
    un: 0,
    ns: 'https://smartstore.naver.com/mgpg',
    sb: [{ n: '모지', p: { ns: '14,000' }, d: 0 }],
    desc: 'HACCP 인증 대형 팩토리 신뢰 관리. 대량 생산 중에도 맛의 편차 없는 안정적인 품질을 제공합니다.',
    tags: ['부산', '신뢰', '안정적', 'HACCP', '대형설비'],
  },
  {
    n: '커피 어웨이크',
    r: '부산',
    a: '금정구 부산대학로 64번길 6',
    un: 0,
    ns: 'https://smartstore.naver.com/coffeeawake',
    sb: [{ n: '어웨이큰', p: { ns: '12,000' }, d: 0 }],
    desc: '부산대 앞 대표 실력파. 생동감 넘치는 라인업으로 지친 정신을 깨워주는 대학가의 활력소입니다.',
    tags: ['부산대', '어웨이큰', '생동감', '대학가', '활력'],
  },
  {
    n: '커피명가',
    r: '대구',
    a: '경북 경산시 임당로 40',
    un: 0,
    ns: 'https://smartstore.naver.com/coffeemyungga',
    w: 'https://myungga.com',
    c29: 'https://www.29cm.co.kr/store/brand/38403',
    sb: [{ n: '명가', p: { ns: '16,000', w: '16,000' }, d: 0 }],
    desc: '1세대 스페셜티 명가 대구 산증인. 게이샤를 널리 알린 전설적인 곳으로 축적된 로스팅의 품격이 느껴집니다.',
    tags: ['대구경북', '1세대', '전설', '게이샤', '품격'],
  },
  {
    n: '1LL 커피',
    r: '대구',
    a: '수성구 달구벌대로496길 21',
    un: 0,
    ns: 'https://smartstore.naver.com/1llcoffee',
    sb: [{ n: '1LL', p: { ns: '16,000' }, d: 0 }],
    desc: '전자동 필터 시스템 정교 로직. 모든 변수를 통제하여 일관되고 깨끗한 라이트 로스팅의 정수를 선보입니다.',
    tags: ['대구', '시스템', '정교한', '일관성', '깨끗한맛'],
  },
  {
    n: '수평적관계',
    r: '대구',
    a: '대구 중구 달구벌대로443길 44',
    un: 0,
    ns: 'https://smartstore.naver.com/flatrelationship',
    sb: [{ n: '수평', p: { ns: '16,000' }, d: 0 }],
    desc: '직화 로스팅 유니크 풍미 미학 공간. 날것의 매력을 세련되게 다듬어 사람과 커피의 수평적 관계를 지향합니다.',
    tags: ['대구', '삼덕동', '직화로스팅', '유니크', '미학'],
  },
  {
    n: '류 커피 로스터스',
    r: '대구',
    a: '대구 중구 동성로2길 50-11',
    un: 0,
    ns: 'https://smartstore.naver.com/roastingcompany',
    sb: [{ n: '류', p: { ns: '16,000' }, d: 0 }],
    desc: '전통 가옥 핸드드립 정수 동성로 명소. 느림의 미학을 담아 정성껏 내린 한 잔으로 깊은 여운을 선사합니다.',
    tags: ['동성로', '전통가옥', '핸드드립', '느림의미학', '깊은여운'],
  },
  {
    n: '304 커피',
    r: '광주',
    a: '광산구 첨단중앙로182번길 42',
    un: 1,
    ns: 'https://smartstore.naver.com/304coffee',
    sb: [
      { n: '짙은', p: { ns: '14,000' }, d: 0 },
      { n: '디카페인 나이트', p: { ns: '16,000' }, d: 1 },
    ],
    desc: '광주 최대 규모 체계적 생산 플랫폼. 팩토리의 강점을 살려 고품질 스페셜티를 안정적으로 공급합니다.',
    tags: ['광주', '대형', '체계적', '플랫폼', '안정적'],
  },
  {
    n: '우든버러',
    r: '광주',
    a: '광산구 수완로74번길 11-68',
    un: 0,
    ns: 'https://smartstore.naver.com/greenbean_platform',
    sb: [{ n: '우든', p: { ns: '15,000' }, d: 0 }],
    desc: '유럽풍 외관 매력적 밸런스 광주 명소. 신선 로스팅과 이국적 공간의 조화가 특별한 미식 경험을 완성합니다.',
    tags: ['광주', '유럽풍', '밸런스', '신선한', '이국적'],
  },
  {
    n: '제주커피 로스터리',
    r: '제주',
    a: '제주 한림읍 한림상로 123',
    un: 0,
    ns: 'https://smartstore.naver.com/jejucoffeeroastery',
    sb: [{ n: '하소로', p: { ns: '14,000' }, d: 0 }],
    desc: '제주 최대 인프라 하소로 산하 전문 유닛. 제주의 물과 바람을 닮은 맑고 정갈한 맛을 공급합니다.',
    tags: ['제주', '대규모', '하소로', '맑은맛', '인프라'],
  },
  {
    n: '커피냅 제주',
    r: '제주',
    a: '제주 한림읍 가령로 21',
    un: 0,
    ns: 'https://smartstore.naver.com/coffeenaproasters',
    sb: [{ n: '냅 블렌드', p: { ns: '16,000' }, d: 0 }],
    desc: '폐가 개조 랜드마크 공간 미학. 테루아 특성을 살린 정교한 소싱으로 여행자에게 잊지 못할 향미를 선물합니다.',
    tags: ['제주', '공간미학', '랜드마크', '테루아', '분위기'],
  },
]

// ── 헬퍼 ─────────────────────────────────────────────────────────────────

/** "16,000" → 16000 */
function parsePrice(p: string): number {
  return parseInt(p.replace(/,/g, ''), 10)
}

/** 채널키 매핑: 시드 데이터의 단축키 → DB channelKey */
const CHANNEL_KEY_MAP: Record<ChannelKey, string> = {
  ns: 'naver',
  w: 'website',
  c29: 'cm29',
}

/** 최저 가격으로 PriceRange 결정 */
function derivePriceRange(entry: SeedEntry): 'LOW' | 'MID' | 'HIGH' {
  const prices: number[] = []
  for (const bean of entry.sb) {
    for (const val of Object.values(bean.p)) {
      if (val) prices.push(parsePrice(val))
    }
  }
  if (prices.length === 0) return 'MID'
  const min = Math.min(...prices)
  if (min < 20000) return 'LOW'
  if (min <= 35000) return 'MID'
  return 'HIGH'
}

/** 지역 + 특성 태그를 upsert하고 ID + isPrimary 배열을 반환 */
async function upsertTags(
  regions: string[],
  characteristicTags: string[]
): Promise<{ id: string; isPrimary: boolean }[]> {
  const tagData = [
    ...regions.map((name, i) => ({ name, category: 'REGION' as const, isPrimary: i === 0 })),
    ...characteristicTags.map((name) => ({
      name,
      category: 'CHARACTERISTIC' as const,
      isPrimary: false,
    })),
  ]

  return Promise.all(
    tagData.map(async ({ isPrimary, ...fields }) => {
      const tag = await prisma.tag.upsert({
        where: { name_category: { name: fields.name, category: fields.category } },
        create: fields,
        update: {},
        select: { id: true },
      })
      return { id: tag.id, isPrimary }
    })
  )
}

/** ChannelDefinition 초기값 upsert (마이그레이션에서 이미 처리, 멱등성 보장) */
async function upsertChannelDefinitions() {
  const defs = [
    { key: 'naver', label: '네이버 스마트스토어', order: 1 },
    { key: 'website', label: '자사몰', order: 2 },
    { key: 'cm29', label: '29cm', order: 3 },
    { key: 'unspecialty', label: '언스페셜티', order: 4 },
    { key: 'homebaristar', label: '홈바리스타', order: 5 },
  ]
  for (const def of defs) {
    await prisma.channelDefinition.upsert({
      where: { key: def.key },
      create: def,
      update: { label: def.label, order: def.order },
    })
  }
}

// ── 메인 ─────────────────────────────────────────────────────────────────

async function main() {
  await upsertChannelDefinitions()

  // 기존 로스터리 전체 삭제 (채널, 원두, 가격, 태그 cascade)
  await prisma.roastery.deleteMany({})

  let roasteryCount = 0
  let beanCount = 0
  let priceCount = 0

  // 온보딩 후보: 상위 20개 (주요 채널 다수 보유)
  const ONBOARDING_CANDIDATE_NAMES = new Set(SEED_DATA.slice(0, 20).map((e) => e.n))

  for (const entry of SEED_DATA) {
    const priceRange = derivePriceRange(entry)
    const isOnboardingCandidate = ONBOARDING_CANDIDATE_NAMES.has(entry.n)
    const hasDecaf = entry.sb.some((sb) => sb.d === 1)

    // 지역 + 특성 태그 처리
    const tagIds = await upsertTags(
      [entry.r],
      (entry.tags ?? []).map((t) => t.trim()).filter(Boolean)
    )

    // 로스터리 생성
    const roastery = await prisma.roastery.create({
      data: {
        name: entry.n,
        description: entry.desc ?? null,
        address: entry.a ?? null,
        priceRange,
        decaf: hasDecaf,
        isOnboardingCandidate,
        tags: { create: tagIds.map(({ id: tagId, isPrimary }) => ({ tagId, isPrimary })) },
      },
    })
    roasteryCount++

    // 채널 생성
    const channelKeyToIdMap = new Map<string, string>()
    const channelEntries: { key: ChannelKey; url: string }[] = []
    if (entry.ns) channelEntries.push({ key: 'ns', url: entry.ns })
    if (entry.w) channelEntries.push({ key: 'w', url: entry.w })
    if (entry.c29) channelEntries.push({ key: 'c29', url: entry.c29 })

    for (const { key, url } of channelEntries) {
      const dbKey = CHANNEL_KEY_MAP[key]
      const channel = await prisma.roasteryChannel.create({
        data: { roasteryId: roastery.id, channelKey: dbKey, url },
        select: { id: true },
      })
      channelKeyToIdMap.set(key, channel.id)
    }

    // 원두 + 가격 생성
    for (const sb of entry.sb) {
      const bean = await prisma.bean.create({
        data: {
          roasteryId: roastery.id,
          name: sb.n,
          origins: [],
          roastingLevel: 'MEDIUM',
          decaf: sb.d === 1,
          cupNotes: [],
        },
        select: { id: true },
      })
      beanCount++

      // 채널별 가격
      for (const [shortKey, priceStr] of Object.entries(sb.p) as [ChannelKey, string][]) {
        const channelId = channelKeyToIdMap.get(shortKey)
        if (!channelId || !priceStr) continue
        await prisma.beanChannelPrice.create({
          data: { beanId: bean.id, channelId, price: parsePrice(priceStr) },
        })
        priceCount++
      }
    }
  }

  console.log(
    `Seed complete: ${roasteryCount} roasteries, ${beanCount} beans, ${priceCount} channel prices`
  )
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
