'use client'

import { useEffect } from 'react'

// 지도뷰 마운트 시 main(overflow-y-auto)의 스크롤을 직접 차단한다.
// - scrollTop 초기화: 목록→지도 클라이언트 전환 시 커스텀 스크롤 컨테이너 위치가 Next.js에 의해 리셋되지 않음
// - touchmove preventDefault: iOS Safari는 overflow:hidden 단독으로는 touch 스크롤을 막지 못함
export function MapScrollLock() {
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    const prevOverflow = main.style.overflow
    const prevOverscroll = main.style.overscrollBehavior

    main.scrollTop = 0
    main.style.overflow = 'hidden'
    main.style.overscrollBehavior = 'none'

    const preventTouch = (e: TouchEvent) => e.preventDefault()
    main.addEventListener('touchmove', preventTouch, { passive: false })

    return () => {
      main.style.overflow = prevOverflow
      main.style.overscrollBehavior = prevOverscroll
      main.removeEventListener('touchmove', preventTouch)
    }
  }, [])
  return null
}
