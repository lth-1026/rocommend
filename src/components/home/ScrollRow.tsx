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
      <div className="relative lg:hidden">
        <div style={{ marginInline: 'calc(-1 * var(--page-padding))' }}>
          <div
            ref={scrollRef}
            className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
            style={{
              scrollSnapType: 'x mandatory',
              scrollPaddingInline: 'var(--page-padding)',
            }}
          >
            <div className="flex gap-4">
              {/* 좌측 spacer: spacer+gap = page-padding (snap 없음 — scroll-padding-left가 카드를 여백 위치에 스냅) */}
              <div aria-hidden="true" style={{ minWidth: 'calc(var(--page-padding) - 1rem)', flexShrink: 0 }} />
              {children}
              {/* 우측 spacer */}
              <div aria-hidden="true" style={{ minWidth: 'calc(var(--page-padding) - 1rem)', flexShrink: 0 }} />
            </div>
          </div>
        </div>
      </div>

      {/* 데스크탑: 스크롤 없이 전체 카드 표시 */}
      <div className="hidden lg:flex gap-4">
        {children}
      </div>
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
