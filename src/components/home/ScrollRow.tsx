'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ScrollRowProps {
  children: React.ReactNode
}

const CARD_WIDTH = 176 // w-44 = 176px
const GAP = 16 // gap-4

export function ScrollRow({ children }: ScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      ro.disconnect()
    }
  }, [updateArrows])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -(CARD_WIDTH + GAP) * 2 : (CARD_WIDTH + GAP) * 2,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      {/* 왼쪽 화살표 — 데스크탑 전용 */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/3 z-10 hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors cursor-pointer"
          aria-label="왼쪽으로 스크롤"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* 바깥 래퍼: negative margin으로 page-wrapper 패딩 영역까지 확장 */}
      <div style={{ marginInline: 'calc(-1 * var(--page-padding))' }}>
        {/* 스크롤 컨테이너 */}
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <div className="flex gap-4">
            {/* 좌측 spacer: gap 한 칸 빼서 spacer+gap = page-padding 정확히 맞춤 */}
            {/* scroll-snap-align: start → scrollLeft=0이 유효한 snap point가 되어 초기 위치 유지 */}
            <div aria-hidden="true" style={{ minWidth: 'calc(var(--page-padding) - 1rem)', flexShrink: 0, scrollSnapAlign: 'start' }} />
            {children}
            {/* 우측 spacer */}
            <div aria-hidden="true" style={{ minWidth: 'calc(var(--page-padding) - 1rem)', flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* 오른쪽 화살표 — 데스크탑 전용 */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/3 z-10 hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors cursor-pointer"
          aria-label="오른쪽으로 스크롤"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/** ScrollRow 내 개별 카드 래퍼 — 고정 너비 + snap */
export function ScrollItem({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-36 sm:w-40 lg:w-[calc((100%-96px)/7)] flex-shrink-0"
      style={{ scrollSnapAlign: 'start' }}
    >
      {children}
    </div>
  )
}
