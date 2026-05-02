'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { SPRING_GENTLE } from '@/lib/motion'

// 라우트 이동 시 페이지가 아래에서 스르륵 올라오는 entrance 전환
// key={pathname}으로 경로가 바뀔 때마다 새 인스턴스 생성 → 애니메이션 재실행
// App Router에서 exit 애니메이션은 구조상 지원 어려워 entrance만 적용
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_GENTLE}
    >
      {children}
    </motion.div>
  )
}
