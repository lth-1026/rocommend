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
  n: string        // name
  r: string        // region
  a?: string       // address
  ns?: string      // naver smartstore URL
  w?: string       // website URL
  c29?: string     // 29cm URL
  sb: { n: string; p: PriceMap }[]  // signature beans
  desc?: string    // description
  tags?: string[]  // characteristic tags
}

// ── 데이터 ────────────────────────────────────────────────────────────────
const SEED_DATA: SeedEntry[] = [
  // --- 1. 신규 및 클래식 로스터리 통합 ---
  {
    n: '프릳츠 커피 컴퍼니', r: '서울', a: '마포구 도화동 179-9',
    ns: 'https://smartstore.naver.com/fritzcoffeecompany',
    w: 'https://fritz.co.kr',
    c29: 'https://www.29cm.co.kr/shop/brand/1638',
    sb: [
      { n: '올드독', p: { ns: '16,000', w: '16,000', c29: '17,600' } },
      { n: '잘 되어 가시나', p: { ns: '16,000', w: '16,000', c29: '17,600' } },
    ],
    desc: '레트로 감성과 다이렉트 트레이딩의 정수. 한국 스페셜티 대중화의 아이콘.',
    tags: ['마포', '레트로'],
  },
  {
    n: '커피 리브레', r: '서울', a: '마포구 연남동 227-15',
    ns: 'https://smartstore.naver.com/coffeelibre',
    w: 'https://coffeelibre.kr',
    sb: [{ n: '배드블러드', p: { ns: '17,000', w: '17,000' } }],
    desc: '전 세계 산지를 직접 소싱하는 원두. 스페셜티 커피의 선구자적 철학.',
    tags: ['연남동', '선구자'],
  },
  {
    n: '모모스 커피', r: '부산', a: '영도구 봉래나루로 160',
    ns: 'https://smartstore.naver.com/momoscoffee',
    w: 'https://momos.co.kr',
    c29: 'https://www.29cm.co.kr/shop/brand/11499',
    sb: [
      { n: '프루티봉봉', p: { ns: '16,000', w: '16,000', c29: '16,000' } },
      { n: '에스 쇼콜라', p: { ns: '15,000', w: '15,000', c29: '15,000' } },
    ],
    desc: 'WBC 챔피언 전주연 바리스타의 로스터리. 부산의 자부심이자 월드클래스.',
    tags: ['영도', 'WBC우승'],
  },
  {
    n: '빈브라더스', r: '서울', a: '마포구 토정로 35-1',
    ns: 'https://smartstore.naver.com/beanbrothers',
    w: 'https://www.beanbrothers.co.kr',
    c29: 'https://www.29cm.co.kr/shop/brand/2143',
    sb: [
      { n: '블랙수트', p: { ns: '17,000', w: '17,000', c29: '17,000' } },
      { n: '벨벳화이트', p: { ns: '17,000', w: '17,000', c29: '17,000' } },
    ],
    desc: '매달 새로운 원두를 제안하는 퍼스널 커피 가이드. 대형 인프라의 안정감.',
    tags: ['합정', '큐레이션'],
  },
  {
    n: '아이덴티티커피랩', r: '서울', a: '마포구 망원로 94',
    ns: 'https://smartstore.naver.com/identitycoffeelab',
    w: 'https://identity-coffeelab.com',
    c29: 'https://www.29cm.co.kr/shop/brand/12690',
    sb: [{ n: '차일디시', p: { ns: '18,000', w: '18,000', c29: '20,000' } }],
    desc: '오픈런 필수! 투명하고 잡미 없는 깨끗한 맛의 정점을 보여주는 망원동 핫플.',
    tags: ['망원동', '클린컵'],
  },
  {
    n: '나무사이로', r: '서울', a: '종로구 사직로8길 21',
    ns: 'https://smartstore.naver.com/namusairo',
    w: 'https://namusairo.com',
    c29: 'https://www.29cm.co.kr/shop/brand/2261',
    sb: [{ n: '풍요로운 땅', p: { ns: '18,000', w: '18,000', c29: '19,800' } }],
    desc: '1세대 스페셜티 명가. 시적인 네이밍과 예술적 향미 설계가 돋보임.',
    tags: ['종로', '1세대'],
  },
  {
    n: '알레그리아', r: '경기', a: '성남시 분당구 판교역로 230',
    ns: 'https://smartstore.naver.com/alegriacoffee',
    w: 'https://alegriacoffee.com',
    sb: [{ n: '정글 에스프레소', p: { ns: '17,000', w: '17,000' } }],
    desc: '판교 스페셜티의 절대 강자 ACR. 세련된 맛의 설계와 높은 완성도.',
    tags: ['판교', 'ACR'],
  },
  {
    n: '보난자커피', r: '서울', a: '성동구 뚝섬로 13길 36',
    w: 'https://bonanzacoffee.kr',
    c29: 'https://www.29cm.co.kr/shop/brand/13931',
    sb: [{ n: '보난자 블렌드', p: { w: '19,000', c29: '19,000' } }],
    desc: '베를린에서 온 유럽 스페셜티의 자존심. 성수동의 감각적인 랜드마크.',
    tags: ['성수동', '베를린'],
  },
  {
    n: '펠트커피', r: '서울', a: '마포구 서강로11길 23',
    ns: 'https://smartstore.naver.com/feltcoffee',
    w: 'https://feltcoffee.com',
    c29: 'https://www.29cm.co.kr/shop/brand/2704',
    sb: [{ n: '클래식', p: { ns: '13,000', w: '12,740', c29: '13,000' } }],
    desc: '미니멀리즘과 하이퀄리티의 결합. 정제된 맛의 세련된 커피 경험.',
    tags: ['창전동', '미니멀'],
  },
  {
    n: '포비 로스터리', r: '서울', a: '마포구 양화로3길 66',
    ns: 'https://smartstore.naver.com/fourb',
    w: 'https://fourb.co.kr',
    c29: 'https://www.29cm.co.kr/shop/brand/2135',
    sb: [{ n: 'DMZ 블렌드', p: { ns: '15,000', w: '15,000', c29: '15,000' } }],
    desc: '베이글과 가장 잘 어울리는 원두를 볶는 합정의 스페셜티 명소.',
    tags: ['합정', '베이글'],
  },
  {
    n: '매뉴팩트 커피', r: '서울', a: '서대문구 연희로11길 29',
    ns: 'https://smartstore.naver.com/manufactcoffee',
    w: 'https://manufact.kr',
    c29: 'https://www.29cm.co.kr/shop/brand/1017',
    sb: [{ n: '폴 고갱', p: { ns: '16,000', w: '16,000', c29: '16,000' } }],
    desc: '정교한 로스팅과 플랫화이트가 유명한 연희동의 정통파 로스터리.',
    tags: ['연희동', '정밀로스팅'],
  },
  {
    n: '커피몽타주', r: '서울', a: '강동구 올림픽로48길 23-12',
    ns: 'https://smartstore.naver.com/coffeemontage',
    w: 'https://coffeemontage.com',
    c29: 'https://www.29cm.co.kr/shop/brand/3169',
    sb: [{ n: '비터스윗 라이프', p: { ns: '13,000', w: '13,000', c29: '14,000' } }],
    desc: '조화로운 맛의 설계자. 매일 마시기 가장 좋은 블렌딩 철학.',
    tags: ['성내동', '조화'],
  },
  {
    n: '듁스커피', r: '서울', a: '마포구 어울마당로2길 10',
    w: 'https://dukescoffee.co.kr',
    sb: [{ n: '듁스 에스프레소', p: { w: '21,000' } }],
    desc: '멜버른 커피 스타일의 정수. 상수동 쇼룸의 세련된 글로벌 스페셜티.',
    tags: ['상수동', '멜버른'],
  },
  {
    n: '톨드어스토리', r: '대전', a: '대전 유성구 어은로 52번길 30',
    ns: 'https://smartstore.naver.com/toldastory',
    w: 'https://toldastory.com',
    sb: [{ n: '더 킹', p: { ns: '16,000', w: '16,000' } }],
    desc: '대전 스페셜티의 자존심. 영화적 스토리텔링이 담긴 독창적 블렌딩.',
    tags: ['대전', '고릴라'],
  },
  {
    n: '벙커컴퍼니', r: '경기', a: '하남 하남대로 249번길 16-16',
    ns: 'https://smartstore.naver.com/bunkercompany',
    w: 'https://bunkercompany.co.kr',
    sb: [{ n: '#8 비터스윗', p: { ns: '14,000', w: '14,000' } }],
    desc: '추출 안정성 극대화 설계. 하남 본점과 압구정점의 탄탄한 기술력.',
    tags: ['하남', '안정성'],
  },
  {
    n: '커피스니퍼', r: '서울', a: '중구 세종대로16길 27',
    ns: 'https://smartstore.naver.com/coffeesniffer',
    w: 'https://coffeesniffer.com',
    sb: [{ n: '스니퍼 블렌드', p: { ns: '16,000', w: '16,000' } }],
    desc: '향기를 맡는 사람들의 명소. 시청역 근처의 조용하고 깊은 향미.',
    tags: ['시청역', '향미'],
  },
  {
    n: '로우키 커피', r: '서울', a: '성동구 연무장길 6',
    ns: 'https://smartstore.naver.com/lowkeycoffee',
    w: 'https://lowkeycoffee.com',
    c29: 'https://www.29cm.co.kr/shop/brand/10292',
    sb: [{ n: '클라시코', p: { ns: '16,000', w: '16,000', c29: '17,000' } }],
    desc: '성수동의 상징적인 로스터리. 본질에 집중하는 탄탄한 실력파.',
    tags: ['성수동', '본질'],
  },
  {
    n: '베르크 로스터스', r: '부산', a: '부산진구 서전로58번길 115',
    ns: 'https://smartstore.naver.com/werkroasters',
    w: 'https://werk.co.kr',
    c29: 'https://www.29cm.co.kr/shop/brand/10103',
    sb: [{ n: '베이비 블렌드', p: { ns: '18,000', w: '18,000', c29: '18,000' } }],
    desc: '전포동 힙 문화를 상징하는 곳. 브랜드 경험을 중시하는 강력한 팬덤.',
    tags: ['전포동', '브랜딩'],
  },
  {
    n: '히떼 로스터리', r: '부산', a: '수영구 수영로510번길 43',
    ns: 'https://smartstore.naver.com/hytte',
    w: 'https://hytte.kr',
    sb: [{ n: '히떼 블렌드', p: { ns: '16,000', w: '16,000' } }],
    desc: '노르딕 스타일의 맑은 커피. 숲속 오두막 같은 차분한 로스터리.',
    tags: ['수영구', '노르딕'],
  },
  {
    n: '비전스트롤', r: '서울', a: '마포구 망원로 61',
    ns: 'https://smartstore.naver.com/visionstroll',
    sb: [{ n: '비전 블렌드', p: { ns: '16,000' } }],
    desc: '망원동의 묵직한 존재감. 강배전 원두와 버터푸딩의 환상적 시너지.',
    tags: ['망원동', '강배전'],
  },
  // --- 21~40 ---
  {
    n: '타셋 커피 로스터스', r: '경기', a: '파주시 교하로 1229',
    ns: 'https://smartstore.naver.com/tassetcoffee',
    sb: [{ n: '필업 블렌드', p: { ns: '16,000' } }],
    desc: '커피 조직 파괴를 최소화하는 정교한 로스팅 기술의 파주 명소.',
    tags: ['파주', '정교함'],
  },
  {
    n: '가델로 커피', r: '경기', a: '남양주시 별내5로5번길 4-61',
    ns: 'https://smartstore.naver.com/gardellocoffee',
    sb: [{ n: '벨벳 블렌드', p: { ns: '14,000' } }],
    desc: '블렌딩 천재가 만드는 최고의 질감. 놀라운 밸런스와 가성비.',
    tags: ['남양주', '블렌딩'],
  },
  {
    n: '딥 다이브 로스터스', r: '경기', a: '평택시 비전9길 12-14',
    ns: 'https://smartstore.naver.com/deepdiveroasters',
    sb: [{ n: '딥 블렌드', p: { ns: '15,000' } }],
    desc: '생두의 잠재력을 깊게 파고들어 특성을 살려내는 평택의 강자.',
    tags: ['평택', '깊은맛'],
  },
  {
    n: '시에나 커피 로스터스', r: '경기', a: '화성시 동탄대로14길 5-29',
    ns: 'https://smartstore.naver.com/siennacoffee',
    sb: [{ n: '모던 블렌드', p: { ns: '16,000' } }],
    desc: '향미 극대화를 추구하는 동탄의 스페셜티 로스터리 카페.',
    tags: ['동탄', '향미'],
  },
  {
    n: '커피볶는 홍소', r: '경기', a: '용인시 처인구 역북로 745',
    ns: 'https://smartstore.naver.com/hongso',
    sb: [{ n: '홍소 강배전', p: { ns: '14,000' } }],
    desc: '강배전 커피의 진수. 묵직하고 고소한 맛을 선호한다면 추천.',
    tags: ['용인', '강배전'],
  },
  {
    n: '로스터리 향초', r: '충북', a: '청주시 서원구 분평로6번길 10',
    ns: 'https://smartstore.naver.com/hyangcho_coffee',
    sb: [{ n: '향초 블렌드', p: { ns: '14,000' } }],
    desc: '상큼달콤한 향미 전문샵. 청주 스페셜티 커피의 정수.',
    tags: ['청주', '상큼달콤'],
  },
  {
    n: '어떤커피', r: '경기', a: '부천시 조마루로285번길 50',
    ns: 'https://smartstore.naver.com/whichcoffee',
    sb: [{ n: '어떤 블렌드', p: { ns: '16,000' } }],
    desc: '로스팅 챔피언의 다양한 원두를 만날 수 있는 부천의 자랑.',
    tags: ['부천', '챔피언'],
  },
  {
    n: '커피 정경', r: '서울', a: '은평구 통일로83길 5-6',
    ns: 'https://smartstore.naver.com/junggyeong',
    sb: [{ n: '정경 블렌드', p: { ns: '15,000' } }],
    desc: '맛과 향이 조화로운 은평구 골목의 조용한 실력파 로스터리.',
    tags: ['은평구', '조화'],
  },
  {
    n: '58MM 커피 로스터스', r: '경기', a: '성남시 분당구 판교로25번길 18-5',
    ns: 'https://smartstore.naver.com/58mmcoffee',
    sb: [{ n: '58MM 시그니처', p: { ns: '15,000' } }],
    desc: '매일 마셔도 질리지 않는 신선함을 제안하는 판교 로스터리.',
    tags: ['판교', '신선함'],
  },
  {
    n: '언더빈', r: '경기', a: '용인시 수지구 성복2로 76',
    ns: 'https://smartstore.naver.com/underbean',
    sb: [{ n: '궁금한 콩', p: { ns: '15,000' } }],
    desc: '재밌는 콩들을 소개하는 유쾌한 수지의 스페셜티 거점.',
    tags: ['수지', '재미'],
  },
  {
    n: '일프로 커피', r: '서울', a: '송파구 가락로 125',
    ns: 'https://smartstore.naver.com/1percentcoffee',
    sb: [{ n: '뉴크롭 클래식', p: { ns: '13,000' } }],
    desc: '신선한 뉴크롭 원두를 착한 가격에 제공하는 송파의 강자.',
    tags: ['송파', '가성비'],
  },
  {
    n: '로스터 릭', r: '서울', a: '마포구 월드컵로16길 10',
    ns: 'https://smartstore.naver.com/roasterrick',
    sb: [{ n: '릭 블렌드', p: { ns: '16,000' } }],
    desc: '상세한 커핑노트를 제공하는 학구적인 마포의 로스터리.',
    tags: ['마포', '학구적'],
  },
  {
    n: '루비아', r: '경기', a: '안양시 만안구 박달로 491',
    ns: 'https://smartstore.naver.com/rubiacoffee',
    sb: [{ n: '루비아 강배전', p: { ns: '14,000' } }],
    desc: '깊고 진한 강배전의 정석. 안양 로컬 스페셜티의 자부심.',
    tags: ['안양', '강배전'],
  },
  {
    n: '도안 셀렉트 샵', r: '경기', a: '수원시 팔달구 효원로307번길 61',
    ns: 'https://smartstore.naver.com/doan_selectshop',
    sb: [{ n: '도안 블렌드', p: { ns: '17,000' } }],
    desc: '수원의 편집숍 형태 로스터리. 세심하게 선별된 원두 큐레이션.',
    tags: ['수원', '큐레이션'],
  },
  {
    n: '클로스 커피', r: '서울', a: '마포구 백범로 152',
    ns: 'https://smartstore.naver.com/closecoffee',
    sb: [{ n: '클로스 블렌드', p: { ns: '15,000' } }],
    desc: '커피와 더 가까워질 수 있게 편안한 맛을 제안하는 공덕 명소.',
    tags: ['공덕역', '친근함'],
  },
  {
    n: '리얼빈', r: '경기', a: '안양시 동안구 관양로 17',
    ns: 'https://smartstore.naver.com/realbean',
    sb: [{ n: '리얼 블렌드', p: { ns: '14,000' } }],
    desc: '합리적인 가격에 훌륭한 품질. 이름 그대로 진짜 커피의 가치.',
    tags: ['안양', '가성비'],
  },
  {
    n: '미켈레커피', r: '경기', a: '성남시 분당구 판교역로 145',
    ns: 'https://smartstore.naver.com/michelecoffee',
    sb: [{ n: '미켈레 블렌드', p: { ns: '15,000' } }],
    desc: '판교역 인근 바리스타 챔피언의 정교한 추출 설계가 돋보이는 곳.',
    tags: ['판교', '밸런스'],
  },
  {
    n: '502 커피로스터스', r: '서울', a: '금천구 가산디지털1로 149',
    ns: 'https://smartstore.naver.com/502coffee',
    w: 'https://502coffee.com',
    sb: [{ n: '502 시그니처', p: { ns: '16,000', w: '16,000' } }],
    desc: '로스팅 팩토리 기반의 탄탄한 내공. 가산동의 터줏대감.',
    tags: ['가산동', '팩토리'],
  },
  {
    n: '억셉트 커피', r: '경기', a: '군포시 당정로 28번길 17',
    ns: 'https://smartstore.naver.com/acceptcoffee',
    w: 'https://acceptcoffee.com',
    sb: [{ n: '억셉트 블렌드', p: { ns: '14,000', w: '14,000' } }],
    desc: '대형 설비를 갖춘 커피 전문 기업. 일관된 고품질 원두 공급.',
    tags: ['군포', '대규모'],
  },
  {
    n: '필그림 커피', r: '경기', a: '의왕시 내손중앙로 4',
    ns: 'https://smartstore.naver.com/pilgrimcoffee',
    sb: [{ n: '사색 블렌드', p: { ns: '16,000' } }],
    desc: '커피 여정을 안내하는 순례자. 명확한 향미 표현이 강점.',
    tags: ['의왕', '순례자'],
  },
  // --- 41~ ---
  {
    n: '디 진테제', r: '서울', a: '강동구 성내로 40',
    ns: 'https://smartstore.naver.com/diesynthese',
    sb: [{ n: '진테제 블렌드', p: { ns: '16,000' } }],
    desc: '다채로운 풍미를 조화롭게 볶아내는 성내동의 실력파 로스터리.',
    tags: ['성내동', '조화'],
  },
  {
    n: 'UFO 커피 로스터스', r: '경기', a: '성남시 수정구 수정로 167',
    ns: 'https://smartstore.naver.com/ufocoffee',
    sb: [{ n: '갤럭시 믹스', p: { ns: '15,000' } }],
    desc: '우주적인 맛의 탐구. 성남의 소문난 탄탄한 로컬 샵.',
    tags: ['성남', '우주맛'],
  },
  {
    n: '호커스포커스', r: '경기', a: '평택시 장당길 43-15',
    ns: 'https://smartstore.naver.com/hocuspocus',
    sb: [{ n: '호커스 블렌드', p: { ns: '16,000' } }],
    desc: '평택의 대규모 가든형 로스터리 카페. 마술 같은 경험.',
    tags: ['평택', '가든형'],
  },
  {
    n: '헤이찰리', r: '서울', a: '성동구 아차산로 11길 7',
    ns: 'https://smartstore.naver.com/heycharlie',
    sb: [{ n: '찰리 블렌드', p: { ns: '15,000' } }],
    desc: '성수동의 감각적인 신예 로스터리. 수준 높은 스페셜티.',
    tags: ['성수동', '신예'],
  },
  {
    n: '피에로커피', r: '서울', a: '강동구 올림픽로48길 31',
    ns: 'https://smartstore.naver.com/pierrotcoffee',
    sb: [{ n: '피에로 블렌드', p: { ns: '15,000' } }],
    desc: '유쾌한 반전이 있는 맛. 성내동 골목의 개성파 로스터리.',
    tags: ['성내동', '피에로'],
  },
  {
    n: '필아웃', r: '경기', a: '성남시 분당구 벌말로 30번길 12',
    ns: 'https://smartstore.naver.com/fillout',
    sb: [{ n: '필아웃 블렌드', p: { ns: '15,000' } }],
    desc: '분당 야탑의 힙플레이스. 확실한 캐릭터와 힙한 무드.',
    tags: ['야탑', '힙플레이스'],
  },
  {
    n: '한국커피', r: '경기', a: '광주시 오포읍 상태길 199',
    ns: 'https://smartstore.naver.com/hankookcoffee',
    w: 'https://hankookcoffee.co.kr',
    sb: [{ n: '벨 칸토', p: { ns: '16,000', w: '16,000' } }],
    desc: '오랜 역사와 전통의 팩토리 로스터리. 신뢰받는 품질.',
    tags: ['경기광주', '역사'],
  },
  {
    n: '궤도 커피 로스터스', r: '서울', a: '서대문구 연희로 11가길 56',
    ns: 'https://smartstore.naver.com/gwedo',
    w: 'https://gwedo.kr',
    sb: [{ n: '인공위성', p: { ns: '18,000', w: '18,000' } }],
    desc: '미각과 시각을 동시에 만족시키는 연희동의 실험적 공간.',
    tags: ['연희동', '궤도'],
  },
  {
    n: '블랙소울커피', r: '서울', a: '중구 장충단로 7길 34',
    ns: 'https://smartstore.naver.com/blacksoul',
    sb: [{ n: '블랙소울', p: { ns: '15,000' } }],
    desc: '장충동 골목의 고수. 깊고 진한 로스팅의 정수.',
    tags: ['장충동', '소울'],
  },
  {
    n: '인크 커피', r: '서울', a: '금천구 가산디지털2로 127-20',
    ns: 'https://smartstore.naver.com/inccoffee',
    w: 'https://inccoffee.kr',
    sb: [{ n: '인크 블렌드', p: { ns: '16,000', w: '16,000' } }],
    desc: '가산동의 압도적 대형 카페. 로스팅 과정을 보는 개방감.',
    tags: ['가산동', '인크'],
  },
  {
    n: '디폴트밸류', r: '서울', a: '서대문구 성산로 333',
    ns: 'https://smartstore.naver.com/defaultvalue',
    sb: [{ n: '디폴트 블렌드', p: { ns: '16,000' } }],
    desc: '연희동의 신흥 강자. 놀라운 향미적 가치와 추출 실력.',
    tags: ['연희동', '사이폰'],
  },
  {
    n: '시그니쳐 로스터스', r: '경기', a: '안양시 동안구 경수대로 911',
    ns: 'https://smartstore.naver.com/signatureroasters',
    sb: [{ n: '텍스쳐 블렌드', p: { ns: '15,000' } }],
    desc: '월드 로스팅 챔피언 장문규 대표의 명확한 캐릭터.',
    tags: ['안양', '챔피언'],
  },
  {
    n: '파스텔커피웍스', r: '서울', a: '마포구 독막로2길 38',
    ns: 'https://smartstore.naver.com/pastelcoffeeworks',
    w: 'https://pastelcoffee.com',
    sb: [{ n: '블랙캔디', p: { ns: '17,000', w: '17,000' } }],
    desc: '균형 잡힌 부드러움과 단맛의 뛰어난 조화가 강점.',
    tags: ['합정역', '밸런스'],
  },
  {
    n: '블랙업커피', r: '부산', a: '부산진구 서전로10번길 41',
    ns: 'https://smartstore.naver.com/blackupcoffee',
    w: 'https://blackupcoffee.com',
    sb: [{ n: '네로 블렌드', p: { ns: '12,600', w: '12,600' } }],
    desc: '부산 스페셜티의 자존심. 해수염 커피의 정수.',
    tags: ['서면', '해수염'],
  },
  {
    n: '오멜라스커피', r: '인천', a: '인천 미추홀구 석정로 222',
    ns: 'https://smartstore.naver.com/omelas',
    w: 'https://omelas.coffee',
    sb: [{ n: '오멜라스 블렌드', p: { ns: '15,000', w: '15,000' } }],
    desc: '대형 설비와 일관된 품질 관리의 인천 실력파 로스터리.',
    tags: ['인천', '유토피아'],
  },
  {
    n: '피어커피', r: '서울', a: '성동구 광나루로4가길 9',
    ns: 'https://smartstore.naver.com/peercoffee',
    w: 'https://peercoffee.co.kr',
    sb: [{ n: '피어 블렌드', p: { ns: '16,000', w: '16,000' } }],
    desc: '도전적 소싱과 힙한 브랜딩의 성수동 거점.',
    tags: ['성수동', '도전'],
  },
  {
    n: '향미사', r: '경북', a: '경주시 사정로 53',
    ns: 'https://smartstore.naver.com/hyangmisa',
    w: 'https://hyangmisa.com',
    sb: [{ n: '경주 블렌드', p: { ns: '14,000', w: '14,000' } }],
    desc: '경주 황리단길 정취를 담은 정밀한 커피 연구소.',
    tags: ['경주', '황리단길'],
  },
  {
    n: '루베르 로스터리', r: '서울', a: '서초구 효령로23길 94',
    ns: 'https://smartstore.naver.com/louvert',
    sb: [{ n: '하이엔드 게이샤', p: { ns: '22,000' } }],
    desc: '희귀 하이엔드 원두를 다루는 방배동의 고수.',
    tags: ['방배동', '게이샤'],
  },
  {
    n: '에어리', r: '서울', a: '마포구 와우산로29길 4-13',
    ns: 'https://smartstore.naver.com/aerycoffee',
    sb: [{ n: '에어리 블렌드', p: { ns: '18,000' } }],
    desc: '맑고 청명한 표현의 에티오피아 향미 전문가.',
    tags: ['서교동', '맑은맛'],
  },
  {
    n: '말릭 커피', r: '서울', a: '마포구 와우산로29길 69',
    ns: 'https://smartstore.naver.com/malikcoffee',
    sb: [{ n: '말릭 시그니처', p: { ns: '18,000' } }],
    desc: '하이엔드 게이샤 원두의 성지. 복합적 향미 극대화.',
    tags: ['홍대', '하이엔드'],
  },
  {
    n: '커넥츠 커피', r: '서울', a: '마포구 성지길 60',
    ns: 'https://smartstore.naver.com/connectscoffee',
    w: 'https://connectscoffee.com',
    sb: [{ n: '커넥츠 블렌드', p: { ns: '13,000', w: '13,000' } }],
    desc: '사람을 잇는 합정역 인근의 탄탄한 브랜드.',
    tags: ['합정역', '연결'],
  },
  {
    n: '무우수 커피', r: '제주', a: '제주시 조천읍 신촌북2길 31-2',
    ns: 'https://smartstore.naver.com/muwusu',
    sb: [{ n: '무우수 블렌드', p: { ns: '12,000' } }],
    desc: '제주 평온함을 담은 깔끔 정교한 마무리.',
    tags: ['조천읍', '평온'],
  },
  {
    n: '노띵커피', r: '서울', a: '중구 필동로 7-1',
    ns: 'https://smartstore.naver.com/nothingcoffee',
    w: 'https://nothingcoffee.cafe24.com',
    sb: [{ n: '노띵 블렌드', p: { ns: '12,000', w: '12,000' } }],
    desc: '비움의 미학. 원두 순수 잠재력 발굴 공간.',
    tags: ['충무로', '미니멀'],
  },
  {
    n: '커피화 로스터스', r: '인천', a: '인천 연수구 송도문화로 28',
    ns: 'https://smartstore.naver.com/coffeehwa',
    sb: [{ n: '커피화 블렌드', p: { ns: '14,000' } }],
    desc: '송도의 예술적 로스팅. 원두마다 고유 스토리.',
    tags: ['송도', '예술'],
  },
  {
    n: '토치커피', r: '서울', a: '강남구 논현로24길 41',
    ns: 'https://smartstore.naver.com/torchcoffee',
    w: 'https://torch.coffee',
    sb: [{ n: '토치 블렌드', p: { ns: '12,000', w: '12,000' } }],
    desc: '선명 강렬한 에너지. 도곡동 숨은 고수.',
    tags: ['도곡동', '에너지'],
  },
  {
    n: '크레이트커피', r: '서울', a: '용산구 독서당로 97',
    ns: 'https://smartstore.naver.com/cratecoffee',
    sb: [{ n: '크레이트 블렌드', p: { ns: '16,000' } }],
    desc: '한남동의 감각적 공간. 고품질 큐레이션.',
    tags: ['한남동', '감각'],
  },
  {
    n: '가치커피', r: '인천', a: '인천 부평구 부흥로 267',
    ns: 'https://smartstore.naver.com/gachicoffee',
    sb: [{ n: '가치 블렌드', p: { ns: '14,000' } }],
    desc: '커피 가치를 바르게 전달하는 친절한 가이드.',
    tags: ['부평', '가치'],
  },
  {
    n: '존스몰 로스터리', r: '부산', a: '부산 연제구 거제천로182번길 42',
    ns: 'https://smartstore.naver.com/jonsmall',
    sb: [{ n: '존스몰 블렌드', p: { ns: '14,000' } }],
    desc: '부산의 보물. 소량 로스팅 극한 품질 관리.',
    tags: ['연제구', '소량생산'],
  },
  {
    n: '블랙로드', r: '대구', a: '대구 중구 중앙대로 457',
    ns: 'https://smartstore.naver.com/blackroad',
    w: 'https://blackroad.coffee',
    sb: [{ n: '블랙로드 셀렉션', p: { ns: '22,000', w: '22,000' } }],
    desc: '탐험가 이치훈 대표 운영. 게이샤의 성지.',
    tags: ['대구', '탐험가'],
  },
  {
    n: '다이어', r: '경기', a: '경기 광주 초월읍 경충대로 1234',
    ns: 'https://smartstore.naver.com/diercoffee',
    sb: [{ n: '다이어 블렌드', p: { ns: '16,000' } }],
    desc: '투명한 소싱과 일관된 품질 기록의 실력파.',
    tags: ['경기광주', '일관성'],
  },
  {
    n: '비브레이브', r: '제주', a: '제주 서귀포 서호중로 85',
    ns: 'https://smartstore.naver.com/bebrave',
    w: 'https://bebrave.kr',
    sb: [{ n: '샤크 블렌드', p: { ns: '16,000', w: '16,000' } }],
    desc: '서귀포 용기 있는 도전. 상어 로고 상징.',
    tags: ['서귀포', '도전적'],
  },
  {
    n: '180 커피 로스터스', r: '경기', a: '성남 분당구 불정로 7',
    ns: 'https://smartstore.naver.com/180coffee',
    w: 'https://180coffee.com',
    sb: [{ n: '초콜릿 캔디', p: { ns: '15,000', w: '15,000' } }],
    desc: "혁신적 시도. '180도' 다른 커피 경험.",
    tags: ['분당', '혁신'],
  },
  {
    n: '폰트커피', r: '서울', a: '용산 한강대로21길 17-18',
    ns: 'https://smartstore.naver.com/fontcoffee',
    w: 'https://font.coffee',
    sb: [{ n: '폰트 블렌드', p: { ns: '16,000', w: '16,000' } }],
    desc: '명료한 인상의 맛. 용산 감각적인 거점.',
    tags: ['용산', '명료함'],
  },
  {
    n: '안밀', r: '경기', a: '수원 장안구 경수대로 935',
    ns: 'https://smartstore.naver.com/anmil',
    sb: [{ n: '안밀 블렌드', p: { ns: '17,000' } }],
    desc: '수원 행궁동 밀도 있는 맛과 차분한 무드.',
    tags: ['수원', '밀도'],
  },
  {
    n: 'YM 커피 프로젝트', r: '서울', a: '은평 연서로29길 21-8',
    ns: 'https://smartstore.naver.com/ymcoffeeproject',
    sb: [{ n: '홈 시그니처', p: { ns: '10,500' } }],
    desc: '은평 골목 속 클래식 실험의 공존 공간.',
    tags: ['연신내', '실험'],
  },
  {
    n: '칼라스커피', r: '서울', a: '마포 월드컵북로16길 8',
    ns: 'https://smartstore.naver.com/callascoffee',
    w: 'https://callascoffee.com',
    sb: [{ n: '칼라스 블렌드', p: { ns: '17,000', w: '17,000' } }],
    desc: '완성도 높은 품질 지향 글로벌 명소.',
    tags: ['성산동', '완성도'],
  },
  {
    n: '예셰숄', r: '경기', a: '고양 일산동구 정발산로 196',
    ns: 'https://smartstore.naver.com/yesheshol',
    sb: [{ n: '발라드', p: { ns: '16,000' } }],
    desc: '에티오피아 원두 명가. 화사함의 극치.',
    tags: ['일산', '화사함'],
  },
  {
    n: 'NSWF', r: '경기', a: '수원 팔달구 매산로 139',
    ns: 'https://smartstore.naver.com/nswf',
    sb: [{ n: '시그니처', p: { ns: '19,000' } }],
    desc: '수원 주택 개조. 강렬 선명한 에너지.',
    tags: ['수원', '강렬함'],
  },
  {
    n: '클라리멘토', r: '경기', a: '고양 덕양구 권율대로 420',
    ns: 'https://smartstore.naver.com/clarimento',
    sb: [{ n: 'HBC 블렌드', p: { ns: '14,000' } }],
    desc: '명료 깨끗 클린컵. 고양 덕양 신흥 강자.',
    tags: ['고양', '클린컵'],
  },
  {
    n: '해월커피', r: '경기', a: '경기 광주 남구로길 9',
    ns: 'https://smartstore.naver.com/haewolcoffee',
    sb: [{ n: '해월', p: { ns: '13,000' } }],
    desc: '서정성 담은 섬세한 로스팅. 광주 명소.',
    tags: ['광주', '서정성'],
  },
  {
    n: '파브스커피', r: '서울', a: '마포 월드컵로14길 19',
    ns: 'https://smartstore.naver.com/favscoffee',
    sb: [{ n: '파브스', p: { ns: '16,000' } }],
    desc: '서교동 골목 개성파 정교한 프로파일러.',
    tags: ['서교동', '개성파'],
  },
  {
    n: '아얀투', r: '서울', a: '마포 성미산로 153-12',
    ns: 'https://smartstore.naver.com/ayanto',
    sb: [{ n: '아얀투 시그니처', p: { ns: '18,000' } }],
    desc: '최신 트렌드 선두. 하이엔드 지향 강자.',
    tags: ['마포', '트렌디'],
  },
  {
    n: '올웨이즈 어거스트', r: '서울', a: '마포 망원로6길 18',
    ns: 'https://smartstore.naver.com/alwaysaugust',
    sb: [{ n: '화이트', p: { ns: '16,000' } }],
    desc: '망원동 8월 무드. 과일 향미 라이트 로스팅.',
    tags: ['망원동', '화사함'],
  },
  {
    n: '고로커피 로스터스', r: '서울', a: '관악 남부순환로231길 33',
    ns: 'https://smartstore.naver.com/gorocoffee',
    sb: [{ n: '고로', p: { ns: '14,000' } }],
    desc: '탄탄한 내공의 로컬 강자. 주민들의 명소.',
    tags: ['봉천동', '내공'],
  },
  {
    n: '키헤이', r: '서울', a: '강남 테헤란로25길 31',
    ns: 'https://smartstore.naver.com/kiheicoffee',
    sb: [{ n: '키헤이', p: { ns: '17,000' } }],
    desc: '하와이 청명함 담은 강남 오피스 스페셜티.',
    tags: ['역삼동', '청명함'],
  },
  {
    n: '레이지모먼트', r: '부산', a: '동래 온천천로453번길 19',
    ns: 'https://smartstore.naver.com/lazymoment',
    sb: [{ n: '레이지', p: { ns: '16,000' } }],
    desc: '느긋한 미학 원두 본연 맛 집중 동래 명소.',
    tags: ['부산', '느긋함'],
  },
  {
    n: '비라티오', r: '경기', a: '고양 일산서구 현중로 26',
    ns: 'https://smartstore.naver.com/bratio',
    sb: [{ n: '레이쇼', p: { ns: '15,000' } }],
    desc: '일산 싱글 에스프레소 베이스 오랜 브랜드.',
    tags: ['일산', '로컬'],
  },
  {
    n: '카페 뮬', r: '경기', a: '고양 일산동구 일산로380번길 35',
    ns: 'https://smartstore.naver.com/cafemule',
    sb: [{ n: '뮬 블렌딩', p: { ns: '16,000' } }],
    desc: '밤리단길 터줏대감 전문성 높은 실력파.',
    tags: ['일산', '밤리단길'],
  },
  {
    n: '정지영 커피', r: '경기', a: '수원 팔달구 정조로905번길 13',
    ns: 'https://smartstore.naver.com/jungjiyoung',
    sb: [{ n: '수워너 다크', p: { ns: '17,000' } }],
    desc: "'WE ARE SUWONER' 수원 힙 랜드마크.",
    tags: ['수원', '힙플레이스'],
  },
  {
    n: '에프엠 커피', r: '부산', a: '부산진구 전포대로199번길 26',
    ns: 'https://smartstore.naver.com/fmcoffee',
    sb: [{ n: 'FM 헤리티지', p: { ns: '13,000' } }],
    desc: '전포동 원조 깊은 로스팅 내공 강자.',
    tags: ['전포동', '원조'],
  },
  {
    n: '모지포그라운드', r: '부산', a: '부산진구 전포대로190번길 3',
    ns: 'https://smartstore.naver.com/mogipoground',
    sb: [{ n: '모지', p: { ns: '14,000' } }],
    desc: 'HACCP 인증 대형 팩토리 안정적 품질.',
    tags: ['부산', '신뢰'],
  },
  {
    n: '커피 어웨이크', r: '부산', a: '금정구 부산대학로 64번길 6',
    ns: 'https://smartstore.naver.com/coffeeawake',
    sb: [{ n: '어웨이큰', p: { ns: '12,000' } }],
    desc: '부산대 앞 대학가 대표 실력파 로스터리.',
    tags: ['부산대', '어웨이큰'],
  },
  {
    n: '커피명가', r: '대구', a: '경북 경산시 임당로 40',
    ns: 'https://smartstore.naver.com/myungga',
    w: 'https://myungga.com',
    sb: [{ n: '명가', p: { ns: '16,000', w: '16,000' } }],
    desc: '1세대 스페셜티 명가 게이샤의 전설.',
    tags: ['대구경북', '1세대'],
  },
  {
    n: '1LL 커피', r: '대구', a: '수성구 달구벌대로496길 21',
    ns: 'https://smartstore.naver.com/1llcoffee',
    sb: [{ n: '1LL', p: { ns: '16,000' } }],
    desc: '전자동 필터 시스템 일관된 라이트 로스팅.',
    tags: ['대구', '시스템'],
  },
  {
    n: '수평적관계', r: '대구', a: '대구 중구 달구벌대로443길 44',
    ns: 'https://smartstore.naver.com/equalrelationship',
    sb: [{ n: '수평', p: { ns: '16,000' } }],
    desc: '직화 로스팅 유니크 풍미 삼덕동 미학 공간.',
    tags: ['대구', '삼덕동'],
  },
  {
    n: '류 커피 로스터스', r: '대구', a: '대구 중구 동성로2길 50-11',
    ns: 'https://smartstore.naver.com/ryucoffee',
    sb: [{ n: '류', p: { ns: '16,000' } }],
    desc: '전통 가옥 핸드드립 정수 동성로 터줏대감.',
    tags: ['동성로', '전통가옥'],
  },
  {
    n: '304 커피', r: '광주', a: '광산구 첨단중앙로182번길 42',
    ns: 'https://smartstore.naver.com/304coffee',
    w: 'https://304coffee.com',
    sb: [{ n: '짙은', p: { ns: '14,000', w: '14,000' } }],
    desc: '지역 최대 규모 체계적 생산 플랫폼.',
    tags: ['광주', '대형'],
  },
  {
    n: '서프클럽', r: '광주', a: '남구 방림로 24',
    ns: 'https://smartstore.naver.com/surfclub',
    sb: [{ n: '스윙', p: { ns: '15,000' } }],
    desc: '음악 커피 공존 4종 시그니처 블렌드.',
    tags: ['광주', '음악'],
  },
  {
    n: '화이트셔츠', r: '광주', a: '광산구 임방울대로826번길 29-12',
    ns: 'https://smartstore.naver.com/whiteshirts',
    sb: [{ n: '화이트', p: { ns: '16,000' } }],
    desc: '골목 숨겨진 보물 고퀄리티 드립 전문.',
    tags: ['광주', '숨은맛집'],
  },
  {
    n: '우든버러', r: '광주', a: '광산구 수완로74번길 11-68',
    ns: 'https://smartstore.naver.com/woodenburrow',
    sb: [{ n: '우든', p: { ns: '15,000' } }],
    desc: '유럽풍 외관 신선 로스팅 매력적 조화.',
    tags: ['광주', '유럽풍'],
  },
  {
    n: '제주커피 로스터리', r: '제주', a: '제주 한림읍 한림상로 123',
    ns: 'https://smartstore.naver.com/jejucoffeeroastery',
    sb: [{ n: '하소로', p: { ns: '14,000' } }],
    desc: '제주 최대 인프라 하소로 산하 전문 유닛.',
    tags: ['제주', '대규모'],
  },
  {
    n: '유동 커피', r: '제주', a: '서귀포 태평로 406',
    ns: 'https://smartstore.naver.com/yudongcoffee',
    sb: [{ n: '총각맛', p: { ns: '15,000' } }],
    desc: '서귀포 전설 조유동 바리스타의 명소.',
    tags: ['서귀포', '개성'],
  },
  {
    n: '커피냅 제주', r: '제주', a: '제주 한림읍 가령로 21',
    ns: 'https://smartstore.naver.com/coffeenaproasters',
    w: 'https://coffeenap.kr',
    sb: [{ n: '냅', p: { ns: '16,000', w: '16,000' } }],
    desc: '폐가 개조 랜드마크 공간 미학 테루아 소싱.',
    tags: ['제주', '공간미학'],
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

  // 온보딩 후보: 상위 20개 (주요 채널 다수 보유)
  const ONBOARDING_CANDIDATE_NAMES = new Set(SEED_DATA.slice(0, 20).map((e) => e.n))

  let roasteryCount = 0
  let beanCount = 0
  let priceCount = 0

  for (const entry of SEED_DATA) {
    const priceRange = derivePriceRange(entry)
    const isOnboardingCandidate = ONBOARDING_CANDIDATE_NAMES.has(entry.n)

    // 지역 + 특성 태그 처리
    const tagIds = await upsertTags(
      [entry.r],
      (entry.tags ?? []).map((t) => t.trim()).filter(Boolean)
    )

    // 로스터리 upsert
    let roastery = await prisma.roastery.findFirst({ where: { name: entry.n } })
    if (!roastery) {
      roastery = await prisma.roastery.create({
        data: {
          name: entry.n,
          description: entry.desc ?? null,
          address: entry.a ?? null,
          priceRange,
          decaf: false,
          isOnboardingCandidate,
          tags: { create: tagIds.map(({ id: tagId, isPrimary }) => ({ tagId, isPrimary })) },
        },
      })
    } else {
      roastery = await prisma.roastery.update({
        where: { id: roastery.id },
        data: {
          description: entry.desc ?? null,
          address: entry.a ?? null,
          priceRange,
          isOnboardingCandidate,
          tags: {
            deleteMany: {},
            create: tagIds.map(({ id: tagId, isPrimary }) => ({ tagId, isPrimary })),
          },
        },
      })
    }
    roasteryCount++

    // 채널 upsert (기존 삭제 후 재생성)
    await prisma.roasteryChannel.deleteMany({ where: { roasteryId: roastery.id } })
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

    // 원두 + 가격 (기존 삭제 후 재생성)
    await prisma.bean.deleteMany({ where: { roasteryId: roastery.id } })

    for (const sb of entry.sb) {
      const bean = await prisma.bean.create({
        data: {
          roasteryId: roastery.id,
          name: sb.n,
          origins: [],
          roastingLevel: 'MEDIUM',
          decaf: false,
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
