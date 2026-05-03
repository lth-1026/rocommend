'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { fetchUserRatings } from '@/actions/rating'
import { SortDropdown } from '@/components/ui/sort-dropdown'
import type { MyRatingItem, MyRatingSort } from '@/types/rating'

const SORT_OPTIONS: { value: MyRatingSort; label: string }[] = [
  { value: 'date_desc', label: '최신순' },
  { value: 'score_desc', label: '별점 높은순' },
  { value: 'score_asc', label: '별점 낮은순' },
]

function StarRow({ score }: { score: number }) {
  return (
    <span className="text-xs text-[var(--color-accent)] shrink-0">
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

  return (
    <div className="flex flex-col">
      <div className="flex justify-end py-3 border-b border-[var(--color-border)]">
        <SortDropdown value={sort} options={SORT_OPTIONS} onChange={handleSortChange} />
      </div>

      {isPending && items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
          불러오는 중...
        </p>
      ) : !isPending && items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
          아직 작성한 한줄평이 없습니다.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1 pt-2">
            {items.map((item) => (
              <MyRatingRow key={item.id} item={item} />
            ))}
          </div>
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

function MyRatingRow({ item }: { item: MyRatingItem }) {
  return (
    <Link
      href={`/roasteries/${item.roastery.id}`}
      className="flex flex-col gap-1 px-3 py-3 rounded-md hover:bg-[var(--color-surface)] transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {item.roastery.name}
        </span>
        <StarRow score={item.score} />
      </div>
      {item.comment && (
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{item.comment}</p>
      )}
    </Link>
  )
}
