'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { toast } from 'sonner'
import { RatingListItem } from './RatingListItem'
import { RatingSortSelector } from './RatingSortSelector'
import { fetchRoasteryRatings } from '@/actions/rating'
import type { RatingListItem as RatingListItemType, RatingSortOption } from '@/types/rating'

interface RatingListProps {
  roasteryId: string
  initialItems: RatingListItemType[]
  initialNextCursor: string | null
  initialSort: RatingSortOption
  isLoggedIn: boolean
}

export function RatingList({
  roasteryId,
  initialItems,
  initialNextCursor,
  initialSort,
  isLoggedIn,
}: RatingListProps) {
  const [sort, setSort] = useState<RatingSortOption>(initialSort)
  const [items, setItems] = useState<RatingListItemType[]>(initialItems)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 정렬 변경 시 서버에서 재조회
  function handleSortChange(newSort: RatingSortOption) {
    setSort(newSort)
    // 즉시 cursor를 null로 초기화해 IntersectionObserver가 이전 cursor로 동시 fetch하는 경쟁 조건 방지
    setNextCursor(null)
    startTransition(async () => {
      try {
        const page = await fetchRoasteryRatings({ roasteryId, sort: newSort, cursor: '' })
        setItems(page.items)
        setNextCursor(page.nextCursor)
      } catch {
        toast.error('한줄평을 불러오지 못했어요. 다시 시도해 주세요.')
      }
    })
  }

  // IntersectionObserver — 스크롤 바닥 감지
  useEffect(() => {
    if (!nextCursor || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isPending) {
          startTransition(async () => {
            const page = await fetchRoasteryRatings({ roasteryId, sort, cursor: nextCursor! })
            setItems((prev) => [...prev, ...page.items])
            setNextCursor(page.nextCursor)
          })
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [nextCursor, isPending, roasteryId, sort])

  if (items.length === 0 && !isPending) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">한줄평</h2>
          <RatingSortSelector value={sort} onChange={handleSortChange} />
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
          아직 한줄평이 없습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">한줄평 {items.length > 0 && `${items.length}+`}</h2>
        <RatingSortSelector value={sort} onChange={handleSortChange} />
      </div>

      <div className="flex flex-col">
        {items.map((item) => (
          <RatingListItem key={item.id} item={item} isLoggedIn={isLoggedIn} />
        ))}
      </div>

      {/* 무한 스크롤 감지 sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {isPending && (
        <div className="flex justify-center py-4">
          <span className="text-sm text-[var(--color-text-secondary)]">불러오는 중...</span>
        </div>
      )}
    </div>
  )
}
