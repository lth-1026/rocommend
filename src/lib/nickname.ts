import { prisma } from '@/lib/prisma'

const FRONT_WORDS = [
  '블루베리',
  '레몬',
  '초콜릿',
  '캐러멜',
  '복숭아',
  '딸기',
  '바닐라',
  '자두',
  '오렌지',
  '망고',
  '체리',
  '크랜베리',
  '패션후르츠',
  '사과',
  '자몽',
  '라임',
  '파인애플',
  '살구',
  '장미',
  '라벤더',
  '히비스커스',
  '아몬드',
  '시나몬',
  '헤이즐넛',
  '메이플',
]

const BACK_WORDS = [
  '재스민',
  '허니',
  '다크초콜릿',
  '버터스카치',
  '흑당',
  '마카다미아',
  '피칸',
  '코코넛',
  '리치',
  '수박',
  '멜론',
  '카모마일',
  '얼그레이',
  '민트',
  '토피',
  '마멀레이드',
  '브라운슈가',
  '진저',
  '유자',
  '로즈힙',
  '흑설탕',
  '계피',
  '생강',
  '대추',
  '매실',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function generateUniqueNickname(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = pick(FRONT_WORDS) + pick(BACK_WORDS)
    const exists = await prisma.user.findUnique({ where: { nickname: candidate } })
    if (!exists) return candidate
  }
  // 10회 실패 시 타임스탬프 접미사로 보장
  return pick(FRONT_WORDS) + pick(BACK_WORDS) + Date.now().toString().slice(-4)
}
