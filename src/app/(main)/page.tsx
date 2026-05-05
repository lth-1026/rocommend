import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: '취향에 맞는 커피 로스터리 추천',
  description:
    '취향 설문 한 번으로 나만의 커피 로스터리를 추천받으세요. 협업 필터링 기반의 개인화 추천 서비스.',
}
import { getRecommendations } from '@/lib/recommender'
import { getFeaturedSections, getPopularRoasteries } from '@/lib/queries/recommendation'
import { HomeFeedClient } from '@/components/home/HomeFeedClient'
import { FeedSkeleton } from '@/components/home/FeedSkeleton'

async function HomeFeed({ userId }: { userId?: string }) {
  const [result, sections, popularItems] = await Promise.all([
    getRecommendations(userId),
    getFeaturedSections(),
    getPopularRoasteries(),
  ])

  return (
    <HomeFeedClient
      result={result}
      sections={sections}
      popularItems={popularItems}
      isLoggedIn={!!userId}
    />
  )
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
