import { notFound } from 'next/navigation'
import { getRoasteryById } from '@/lib/queries/roastery'
import { RoasteryDetail } from '@/components/roastery/RoasteryDetail'

interface RoasteryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RoasteryDetailPage({ params }: RoasteryDetailPageProps) {
  const { id } = await params
  const roastery = await getRoasteryById(id)

  if (!roastery) notFound()

  return (
    <div className="page-wrapper py-8">
      <RoasteryDetail roastery={roastery} />
    </div>
  )
}
