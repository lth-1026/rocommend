'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ListToolbar } from '@/components/ui/list-toolbar'
import { RemoveBookmarkDialog } from './RemoveBookmarkDialog'
import type { BookmarkWithRoastery, BookmarkSort } from '@/types/bookmark'

const SORT_OPTIONS: { value: BookmarkSort; label: string }[] = [
  { value: 'name', label: '이름순' },
  { value: 'myRating_desc', label: '별점 높은순' },
  { value: 'myRating_asc', label: '별점 낮은순' },
]

interface BookmarkListProps {
  bookmarks: BookmarkWithRoastery[]
  initialSort: BookmarkSort
}

export function BookmarkList({ bookmarks, initialSort }: BookmarkListProps) {
  const [sort, setSort] = useState<BookmarkSort>(initialSort)
  const [search, setSearch] = useState('')
  const [removeTarget, setRemoveTarget] = useState<BookmarkWithRoastery | null>(null)
  const router = useRouter()

  const sorted = [...bookmarks].sort((a, b) => {
    if (sort === 'name') return a.roastery.name.localeCompare(b.roastery.name, 'ko')
    const dir = sort === 'myRating_desc' ? -1 : 1
    if (a.myRating === null && b.myRating === null) return 0
    if (a.myRating === null) return 1
    if (b.myRating === null) return -1
    return dir * (a.myRating - b.myRating)
  })

  const filtered = search.trim()
    ? sorted.filter((item) =>
        item.roastery.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : sorted

  return (
    <>
      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="로스터리 검색"
        sortValue={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={setSort}
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
          {search.trim() ? '검색 결과가 없습니다.' : '즐겨찾기한 로스터리가 없습니다.'}
        </p>
      ) : (
        <div className="flex flex-col gap-1 pt-2">
          {filtered.map((item) => (
            <div key={item.id} className={`rounded-md ${item.isUnavailable ? 'opacity-50' : ''}`}>
              {item.isUnavailable ? (
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-muted-foreground">
                      {item.roastery.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      더 이상 이용할 수 없는 로스터리입니다
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(item)}
                    className="shrink-0 cursor-pointer text-xs text-destructive hover:underline"
                  >
                    해제
                  </button>
                </div>
              ) : (
                <div className="relative flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-[var(--color-surface)] active:bg-[var(--color-surface)]">
                  <Link
                    href={`/roasteries/${item.roasteryId}`}
                    className="absolute inset-0 rounded-md"
                    aria-label={item.roastery.name}
                  />
                  <div className="pointer-events-none flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {item.roastery.name}
                    </span>
                    {item.isClosed && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-amber-300 bg-amber-50 text-xs text-amber-700"
                      >
                        폐업
                      </Badge>
                    )}
                    {item.myRating !== null && (
                      <span className="ml-auto shrink-0 text-xs text-[var(--color-accent)]">
                        {'★'.repeat(item.myRating)}
                        {'☆'.repeat(5 - item.myRating)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(item)}
                    className="relative z-10 shrink-0 cursor-pointer text-xs text-destructive hover:underline"
                  >
                    해제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
