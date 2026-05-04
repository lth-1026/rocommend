'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { fetchUserRatings } from '@/actions/rating'
import { ListToolbar } from '@/components/ui/list-toolbar'
import type { MyRatingItem, MyRatingSort } from '@/types/rating'

const SORT_OPTIONS: { value: MyRatingSort; label: string }[] = [
  { value: 'date_desc', label: '최신순' },
  { value: 'date_asc', label: '오래된순' },
  { value: 'score_desc', label: '별점 높은순' },
  { value: 'score_asc', label: '별점 낮은순' },
]

function StarRow({ score }: { score: number }) {
  return (
    <span className="shrink-0 text-xs text-[var(--color-accent)]">
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
  const [search, setSearch] = useState('')
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

  const filtered = search.trim()
    ? items.filter(
        (item) =>
          item.roastery.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          item.comment?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : items

  return (
    <div className="flex flex-col">
      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="로스터리명 또는 한줄평 검색"
        sortValue={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={handleSortChange}
      />

      {isPending && items.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">
          불러오는 중...
        </p>
      ) : items.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">
          아직 작성한 한줄평이 없습니다.
        </p>
      ) : (
        <>
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">
              검색 결과가 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-1 pt-2">
              {filtered.map((item) => (
                <MyRatingRow key={item.id} item={item} />
              ))}
            </div>
          )}
          <div ref={sentinelRef} className="h-1" />
          {isPending && (
            <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">
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
      className="flex flex-col gap-1 rounded-md px-3 py-3 transition-colors hover:bg-[var(--color-surface)] active:bg-[var(--color-surface)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {item.roastery.name}
        </span>
        <StarRow score={item.score} />
      </div>
      {item.comment && (
        <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">{item.comment}</p>
      )}
    </Link>
  )
}
