import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getBookmarks } from '@/lib/queries/bookmark'
import { getUserRatings } from '@/lib/queries/rating'
import { getProfileSummary } from '@/lib/queries/profile'
import { ActivitySummary } from '@/components/profile/ActivitySummary'
import { ActivityTabs } from '@/components/activity/ActivityTabs'

export default async function ActivityPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [ratings, bookmarks, summary] = await Promise.all([
    getUserRatings(session.user.id),
    getBookmarks(session.user.id),
    getProfileSummary(session.user.id),
  ])

  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">내 활동</h1>
      <ActivitySummary ratingCount={summary.ratingCount} bookmarkCount={summary.bookmarkCount} />
      <Suspense>
        <ActivityTabs ratings={ratings} bookmarks={bookmarks} />
      </Suspense>
    </div>
  )
}
