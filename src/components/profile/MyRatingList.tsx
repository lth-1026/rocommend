'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { fetchUserRatings } from '@/actions/rating'
import { cn } from '@/lib/utils'
import type { MyRatingItem, MyRatingSort } from '@/types/rating'

const SORT_OPTIONS: { value: MyRatingSort; label: string }[] = [
  { value: 'date_desc', label: '최신순' },
  { value: 'score_desc', label: '별점 높은순' },
  { value: 'score_asc', label: '별점 낮은순' },
  { value: 'name_asc', label: '이름순' },
  { value: 'name_desc', label: '이름 역순' },
]

function StarRow({ score }: { score: number }) {
  return (
    <span className="text-xs text-[var(--color-accent)]">
      {'★'.repeat(score)}
      {'☆'.repeat(5 - score)}
    </span>
  )
}

interface MyRatingListProps {
  initialItems: MyRatingItem[]
  initialNextCursor: string | null
}

export function MyRatingList({ initialItems, initialNextCursor }: MyRatingListProps) {
  const [sort, setSort] = useState<MyRatingSort>('date_desc')
  const [items, setItems] = useState<MyRatingItem[]>(initialItems)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 버튼 클릭 핸들러에서 sort 변경 + 상태 즉시 초기화: effect 내 setState 금지 규칙 회피 + stale cursor race 방지
  function handleSortChange(newSort: MyRatingSort) {
    setSort(newSort)
    setItems([])
    setNextCursor(null)
    startTransition(async () => {
      const page = await fetchUserRatings(newSort, '')
      setItems(page.items)
      setNextCursor(page.nextCursor)
    })
  }

  useEffect(() => {
    if (!nextCursor || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isPending && nextCursor) {
          startTransition(async () => {
            const page = await fetchUserRatings(sort, nextCursor)
            setItems((prev) => [...prev, ...page.items])
            setNextCursor(page.nextCursor)
          })
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [nextCursor, isPending, sort])

  if (!isPending && items.length === 0) {
    return (
      <>
        <SortBar sort={sort} onChange={handleSortChange} />
        <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
          아직 작성한 한줄평이 없습니다.
        </p>
      </>
    )
  }

  return (
    <div className="flex flex-col">
      <SortBar sort={sort} onChange={handleSortChange} />
      {isPending && items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
          불러오는 중...
        </p>
      ) : (
        <>
          {items.map((item) => (
            <MyRatingRow key={item.id} item={item} />
          ))}
          <div ref={sentinelRef} className="h-1" />
          {isPending && (
            <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
              불러오는 중...
            </p>
          )}
        </>
      )}
    </div>
  )
}

function SortBar({ sort, onChange }: { sort: MyRatingSort; onChange: (s: MyRatingSort) => void }) {
  return (
    <div className="flex gap-3 border-b border-[var(--color-border)] py-3 overflow-x-auto">
      {SORT_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            'text-sm font-medium transition-colors cursor-pointer shrink-0',
            sort === value
              ? 'text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function MyRatingRow({ item }: { item: MyRatingItem }) {
  const date = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(item.updatedAt))

  return (
    <Link
      href={`/roasteries/${item.roastery.id}`}
      className="flex flex-col gap-1 py-4 border-b border-[var(--color-border)] last-of-type:border-b-0 hover:bg-[var(--color-bg)] -mx-4 px-4 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {item.roastery.name}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StarRow score={item.score} />
          <span className="text-xs text-[var(--color-text-disabled)]">{date}</span>
        </div>
      </div>
      {item.comment && (
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{item.comment}</p>
      )}
    </Link>
  )
}
