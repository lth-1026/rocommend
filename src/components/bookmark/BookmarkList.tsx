'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { RatingDisplay } from '@/components/roastery/RatingDisplay'
import { RegionDisplay } from '@/components/roastery/RegionDisplay'
import { RemoveBookmarkDialog } from './RemoveBookmarkDialog'
import { PRICE_RANGE_LABELS, getRegions } from '@/types/roastery'
import type { BookmarkWithRoastery, BookmarkSort } from '@/types/bookmark'
import { cn } from '@/lib/utils'

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
      {/* 정렬 */}
      <div className="flex gap-3 border-b border-[var(--color-border)] py-3">
        {(['name', 'myRating'] as BookmarkSort[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSort(s)}
            className={cn(
              'text-sm font-medium transition-colors cursor-pointer',
              sort === s
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {s === 'name' ? '이름순' : '내 별점순'}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <ul className="flex flex-col">
        {sorted.map((item) => (
          <li
            key={item.id}
            className={cn(
              'border-b border-[var(--color-border)] last-of-type:border-b-0',
              item.isUnavailable ? 'opacity-50' : ''
            )}
          >
            {item.isUnavailable ? (
              <div className="flex items-start gap-3 py-4">
                <div className="flex flex-1 flex-col gap-1 min-w-0">
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
              <div className="flex items-start gap-3 py-4 hover:bg-[var(--color-bg)] -mx-4 px-4 transition-colors">
                <Link
                  href={`/roasteries/${item.roasteryId}`}
                  className="flex flex-1 flex-col gap-1 min-w-0"
                >
                  <div className="flex items-center gap-2">
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
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    <RegionDisplay regions={getRegions(item.roastery.tags)} />
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {PRICE_RANGE_LABELS[item.roastery.priceRange]}
                    </Badge>
                    {item.roastery.decaf && (
                      <Badge variant="secondary" className="text-xs">
                        디카페인
                      </Badge>
                    )}
                  </div>
                </Link>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <RatingDisplay
                    avgRating={item.roastery.avgRating}
                    ratingCount={item.roastery.ratingCount}
                  />
                  {item.myRating !== null && (
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      내 평가 {item.myRating}점
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(item)}
                    className="text-xs text-destructive hover:underline cursor-pointer"
                  >
                    해제
                  </button>
                </div>
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
