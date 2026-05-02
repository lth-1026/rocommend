import type { Transition, Variants } from 'framer-motion'

// 토스처럼 모든 인터랙션에 통일된 spring 물리 적용
// stiffness↑ = 빠르고 탄성, damping↑ = 덜 튕김

export const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
}

export const SPRING_MEDIUM: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
}

export const SPRING_GENTLE: Transition = {
  type: 'spring',
  stiffness: 240,
  damping: 26,
}

// 북마크처럼 "뭔가 됐다"는 피드백이 필요한 순간에만
export const SPRING_POP: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 18,
}

// 모든 리스트 아이템에 통일 적용
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_MEDIUM,
  },
}

// stagger 컨테이너 — children이 순서대로 등장
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
}

// 모든 탭/클릭 가능한 요소에 통일 적용 (whileTap prop에 직접 사용)
export const TAP_SCALE = { scale: 0.96 } as const
