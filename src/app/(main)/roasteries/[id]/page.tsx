import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getRoasteryById } from '@/lib/queries/roastery'
import { getUserRating } from '@/lib/queries/rating'
import { getBookmarkStatus } from '@/lib/queries/bookmark'
import { RoasteryDetail } from '@/components/roastery/RoasteryDetail'

interface RoasteryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RoasteryDetailPage({ params }: RoasteryDetailPageProps) {
  const { id } = await params
  const [roastery, session] = await Promise.all([getRoasteryById(id), auth()])

  if (!roastery) notFound()

  const userId = session?.user?.id
  const [userRating, isBookmarked] = userId
    ? await Promise.all([getUserRating(userId, id), getBookmarkStatus(userId, id)])
    : [null, false]

  return (
    <div className="page-wrapper py-8">
      <RoasteryDetail
        roastery={roastery}
        isLoggedIn={!!userId}
        userRating={userRating ? { score: userRating.score, comment: userRating.comment ?? undefined } : undefined}
        isBookmarked={isBookmarked}
      />
    </div>
  )
}
