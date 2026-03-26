'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { RatingDisplay } from '@/components/roastery/RatingDisplay'
import { RegionDisplay } from '@/components/roastery/RegionDisplay'
import { RemoveBookmarkDialog } from './RemoveBookmarkDialog'
import { PRICE_RANGE_LABELS } from '@/types/roastery'
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
      {/* 정렬 탭 */}
      <div className="flex gap-3 border-b border-border pb-3">
        {(['name', 'myRating'] as BookmarkSort[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSort(s)}
            className={cn(
              'text-sm font-medium transition-colors cursor-pointer',
              sort === s ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {s === 'name' ? '이름순' : '내 별점순'}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <ul className="flex flex-col divide-y divide-border">
        {sorted.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-4">
            <Link
              href={`/roasteries/${item.roasteryId}`}
              className="flex flex-1 flex-col gap-1 min-w-0"
            >
              <span className="font-medium truncate">{item.roastery.name}</span>
              <span className="text-sm text-muted-foreground">
                <RegionDisplay regions={item.roastery.regions} />
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

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-sm flex items-center gap-1">
                <RatingDisplay
                  avgRating={item.roastery.avgRating}
                  ratingCount={item.roastery.ratingCount}
                />
              </div>
              {item.myRating !== null && (
                <span className="text-xs text-muted-foreground">내 평가 {item.myRating}점</span>
              )}
              <button
                type="button"
                onClick={() => setRemoveTarget(item)}
                className="text-xs text-destructive hover:underline cursor-pointer"
              >
                해제
              </button>
            </div>
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
