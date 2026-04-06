import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { getRecommendations } from '@/lib/recommender'
import { HomeFeedClient } from '@/components/home/HomeFeedClient'
import { FeedSkeleton } from '@/components/home/FeedSkeleton'

async function HomeFeed({ userId }: { userId?: string }) {
  const result = await getRecommendations(userId)
  return <HomeFeedClient result={result} />
}

export default async function HomePage() {
  const session = await auth()
  const userId = session?.user?.id

  return (
    <div className="py-8 flex flex-col gap-6">
      <h1 className="page-wrapper text-xl font-semibold">추천</h1>
      <Suspense fallback={<FeedSkeleton />}>
        <HomeFeed userId={userId} />
      </Suspense>
    </div>
  )
}
