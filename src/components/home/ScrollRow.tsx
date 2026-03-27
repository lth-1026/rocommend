'use client'

import { useRef } from 'react'

interface ScrollRowProps {
  children: React.ReactNode
}

export function ScrollRow({ children }: ScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div>
      {/* 모바일/태블릿: edge-to-edge 가로 스크롤 */}
      <div
        ref={scrollRef}
        className="lg:hidden overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth [scroll-snap-type:x_mandatory] [scroll-padding-inline-start:1rem] md:[scroll-padding-inline-start:2rem]"
      >
        <div className="flex gap-4 pl-4 md:pl-8">
          {children}
          <div aria-hidden="true" className="-ml-4 min-w-4 md:min-w-8 shrink-0" />
        </div>
      </div>

      {/* 데스크탑: 스크롤 없이 전체 카드 표시 */}
      <div className="hidden lg:flex gap-4 page-wrapper">{children}</div>
    </div>
  )
}

/** ScrollRow 내 개별 카드 래퍼 — 고정 너비 + snap */
export function ScrollItem({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-36 sm:w-40 lg:w-[calc((100%-6rem)/7)] flex-shrink-0"
      style={{ scrollSnapAlign: 'start' }}
    >
      {children}
    </div>
  )
}
