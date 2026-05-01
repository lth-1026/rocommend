'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { SortDropdown } from '@/components/ui/sort-dropdown'
import { RemoveBookmarkDialog } from './RemoveBookmarkDialog'
import type { BookmarkWithRoastery, BookmarkSort } from '@/types/bookmark'

const SORT_OPTIONS: { value: BookmarkSort; label: string }[] = [
  { value: 'name', label: '이름순' },
  { value: 'myRating', label: '내 별점순' },
]

interface BookmarkListProps {
  bookmarks: BookmarkWithRoastery[]
  initialSort: BookmarkSort
}

export function BookmarkList({ bookmarks, initialSort }: BookmarkListProps) {
  const [sort, setSort] = useState<BookmarkSort>(initialSort)
  const [removeTarget, setRemoveTarget] = useState<BookmarkWithRoastery | null>(null)
  const router = useRouter()

  const sorted = [...bookmarks].sort((a, b) => {
    if (sort === 'name') return a.roastery.name.localeCompare(b.roastery.name, 'ko')
    if (a.myRating === null && b.myRating === null) return 0
    if (a.myRating === null) return 1
    if (b.myRating === null) return -1
    return b.myRating - a.myRating
  })

  return (
    <>
      <div className="flex justify-end py-3 border-b border-[var(--color-border)]">
        <SortDropdown value={sort} options={SORT_OPTIONS} onChange={setSort} />
      </div>

      <ul className="flex flex-col">
        {sorted.map((item) => (
          <li
            key={item.id}
            className={`border-b border-[var(--color-border)] last-of-type:border-b-0 ${item.isUnavailable ? 'opacity-50' : ''}`}
          >
            {item.isUnavailable ? (
              <div className="flex items-center gap-3 py-4">
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-muted-foreground truncate">
                    {item.roastery.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    더 이상 이용할 수 없는 로스터리입니다
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRemoveTarget(item)}
                  className="text-xs text-destructive hover:underline cursor-pointer shrink-0"
                >
                  해제
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-4 hover:bg-[var(--color-surface)] transition-colors">
                <Link
                  href={`/roasteries/${item.roasteryId}`}
                  className="flex flex-1 items-center gap-2 min-w-0"
                >
                  <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {item.roastery.name}
                  </span>
                  {item.isClosed && (
                    <Badge
                      variant="outline"
                      className="text-xs shrink-0 text-amber-700 border-amber-300 bg-amber-50"
                    >
                      폐업
                    </Badge>
                  )}
                  {item.myRating !== null && (
                    <span className="text-xs text-[var(--color-accent)] shrink-0 ml-auto">
                      {'★'.repeat(item.myRating)}
                      {'☆'.repeat(5 - item.myRating)}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => setRemoveTarget(item)}
                  className="text-xs text-destructive hover:underline cursor-pointer shrink-0"
                >
                  해제
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {removeTarget && (
        <RemoveBookmarkDialog
          open={!!removeTarget}
          onOpenChange={(open) => {
            if (!open) setRemoveTarget(null)
          }}
          roasteryId={removeTarget.roasteryId}
          roasteryName={removeTarget.roastery.name}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
