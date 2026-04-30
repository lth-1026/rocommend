import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getRoasteryById } from '@/lib/queries/roastery'
import { getUserRating, getRoasteryRatings, getRatingCount } from '@/lib/queries/rating'
import { getBookmarkStatus } from '@/lib/queries/bookmark'
import { RoasteryDetail } from '@/components/roastery/RoasteryDetail'
import { ROASTING_LEVEL_LABELS } from '@/types/roastery'

interface RoasteryDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: RoasteryDetailPageProps): Promise<Metadata> {
  const roastery = await getRoasteryById((await params).id)
  if (!roastery) return {}

  const tagNames = roastery.tags.map((t) => t.name).join(', ')
  const description =
    roastery.description ?? `${roastery.name} 로스터리 정보와 추천 원두를 확인하세요. ${tagNames}`

  return {
    title: roastery.name,
    description,
    alternates: {
      canonical: `/roasteries/${roastery.id}`,
    },
    openGraph: {
      title: roastery.name,
      description,
      images: roastery.imageUrl ? [{ url: roastery.imageUrl }] : [],
      type: 'website',
    },
  }
}

export default async function RoasteryDetailPage({ params }: RoasteryDetailPageProps) {
  const { id } = await params
  const [roastery, session] = await Promise.all([getRoasteryById(id), auth()])

  if (!roastery) notFound()

  const userId = session?.user?.id

  const [userRating, isBookmarked, ratingCount] = userId
    ? await Promise.all([
        getUserRating(userId, id),
        getBookmarkStatus(userId, id),
        getRatingCount(userId),
      ])
    : [null, false, 0]

  // 평가 3개 미만이면 유사도 계산 불가 → HIGH fallback
  const initialSort = userId && ratingCount >= 3 ? 'SIMILAR' : 'HIGH'

  const initialRatings = await getRoasteryRatings({
    roasteryId: id,
    sort: initialSort,
    currentUserId: userId,
  })

  // 원두별 최저가 채널 → Offer 스키마
  const beanOffers = roastery.beans.map((bean) => {
    const cheapest = bean.channelPrices
      .filter((c) => c.price !== null)
      .sort((a, b) => a.price! - b.price!)[0]

    const descParts = [
      ROASTING_LEVEL_LABELS[bean.roastingLevel] ?? bean.roastingLevel,
      bean.origins.join(', '),
      bean.cupNotes.join(', '),
    ].filter(Boolean)

    return {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Product',
        name: bean.name,
        ...(descParts.length > 0 && { description: descParts.join(' · ') }),
        ...(bean.imageUrl && { image: bean.imageUrl }),
      },
      ...(cheapest && {
        price: cheapest.price,
        priceCurrency: 'KRW',
        url: cheapest.url,
        seller: { '@type': 'Organization', name: cheapest.label },
      }),
    }
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: roastery.name,
    ...(roastery.description && { description: roastery.description }),
    ...(roastery.imageUrl && { image: roastery.imageUrl }),
    ...(roastery.website && { url: roastery.website }),
    ...(roastery.avgRating !== null && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: roastery.avgRating.toFixed(1),
        reviewCount: roastery.ratingCount,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(beanOffers.length > 0 && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: '원두 목록',
        itemListElement: beanOffers,
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page-wrapper py-8">
        <RoasteryDetail
          roastery={roastery}
          isLoggedIn={!!userId}
          userRating={
            userRating
              ? { score: userRating.score, comment: userRating.comment ?? undefined }
              : undefined
          }
          isBookmarked={isBookmarked}
          initialRatings={initialRatings.items}
          initialNextCursor={initialRatings.nextCursor}
          initialSort={initialSort}
        />
      </div>
    </>
  )
}
