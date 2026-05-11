'use client'

import { useEffect } from 'react'

// 지도뷰 마운트 시 main(overflow-y-auto)의 스크롤을 직접 차단한다.
// 높이 calc 오차와 무관하게 Naver Map touch pan과의 nested scroll 경쟁을 막는다.
export function MapScrollLock() {
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    const prev = main.style.overflow
    main.style.overflow = 'hidden'
    return () => {
      main.style.overflow = prev
    }
  }, [])
  return null
}
