import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getRoasteryById } from '@/lib/queries/roastery'
import { getUserRating } from '@/lib/queries/rating'
import { RoasteryDetail } from '@/components/roastery/RoasteryDetail'

interface RoasteryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RoasteryDetailPage({ params }: RoasteryDetailPageProps) {
  const { id } = await params
  const [roastery, session] = await Promise.all([getRoasteryById(id), auth()])

  if (!roastery) notFound()

  const userRating = session?.user?.id ? await getUserRating(session.user.id, id) : null

  return (
    <div className="page-wrapper py-8">
      <RoasteryDetail
        roastery={roastery}
        isLoggedIn={!!session?.user?.id}
        userRating={userRating ? { score: userRating.score, comment: userRating.comment ?? undefined } : undefined}
      />
    </div>
  )
}
