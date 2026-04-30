'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { MyRatingList } from '@/components/profile/MyRatingList'
import { BookmarkList } from '@/components/bookmark/BookmarkList'
import { EmptyBookmark } from '@/components/bookmark/EmptyBookmark'
import { cn } from '@/lib/utils'
import type { MyRatingItem } from '@/types/rating'
import type { BookmarkWithRoastery } from '@/types/bookmark'

interface ActivityTabsProps {
  ratings: { items: MyRatingItem[]; nextCursor: string | null }
  bookmarks: BookmarkWithRoastery[]
}

const TABS = [
  { key: 'ratings', label: '내 평가' },
  { key: 'bookmarks', label: '즐겨찾기' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function ActivityTabs({ ratings, bookmarks }: ActivityTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab: TabKey = searchParams.get('tab') === 'bookmarks' ? 'bookmarks' : 'ratings'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => router.replace(`/activity?tab=${key}`)}
            className={cn(
              'pb-3 text-sm font-medium transition-colors cursor-pointer',
              activeTab === key
                ? 'text-text-primary border-b-2 border-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'ratings' ? (
        <div className="rounded-xl bg-surface px-4 overflow-hidden">
          <MyRatingList initialItems={ratings.items} initialNextCursor={ratings.nextCursor} />
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyBookmark />
      ) : (
        <BookmarkList bookmarks={bookmarks} initialSort="name" />
      )}
    </div>
  )
}
