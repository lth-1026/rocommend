'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { fetchUserRatings } from '@/actions/rating'
import type { MyRatingItem } from '@/types/rating'

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
  const [items, setItems] = useState<MyRatingItem[]>(initialItems)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!nextCursor || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isPending && nextCursor) {
          startTransition(async () => {
            const page = await fetchUserRatings(nextCursor)
            setItems((prev) => [...prev, ...page.items])
            setNextCursor(page.nextCursor)
          })
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [nextCursor, isPending])

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
        아직 작성한 한줄평이 없습니다.
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <MyRatingRow key={item.id} item={item} />
      ))}
      <div ref={sentinelRef} className="h-1" />
      {isPending && (
        <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
          불러오는 중...
        </p>
      )}
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
      className="flex flex-col gap-1 py-4 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg)] -mx-4 px-4 transition-colors"
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
