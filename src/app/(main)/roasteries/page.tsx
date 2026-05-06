import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: '로스터리',
  description: '한국 커피 로스터리를 취향에 맞게 찾아보세요.',
  alternates: {
    canonical: '/roasteries',
  },
}
import { getRoasteries, getRoasteryById } from '@/lib/queries/roastery'
import { getUserRating, getRatingCount, getRoasteryRatings } from '@/lib/queries/rating'
import { getBookmarkStatus } from '@/lib/queries/bookmark'
import { FilterPanel } from '@/components/roastery/FilterPanel'
import { RequestRoasteryButton } from '@/components/roastery/RequestRoasteryButton'
import { RoasteryGrid } from '@/components/roastery/RoasteryGrid'
import { RoasteryMapLayout } from '@/components/roastery/map/RoasteryMapLayout'
import { toArray } from '@/lib/utils'
import { PRICE_OPTIONS } from '@/types/roastery'
import type { SortOption, FilterParams, PriceRange } from '@/types/roastery'
import type { SelectedRoasteryData } from '@/components/roastery/map/RoasteryMapLayout'

interface RoasteriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RoasteriesPage({ searchParams }: RoasteriesPageProps) {
  const [params, session] = await Promise.all([searchParams, auth()])
  const userId = session?.user?.id

  const isMapView = params.view === 'map'
  const sort: SortOption = params.sort === 'name' ? 'name' : 'popular'
  const selectedId = isMapView && typeof params.id === 'string' ? params.id : undefined

  const filter: FilterParams = {
    q: typeof params.q === 'string' ? params.q.trim() : '',
    price: toArray(params.price).filter((v): v is PriceRange =>
      PRICE_OPTIONS.includes(v as PriceRange)
    ),
    decaf: params.decaf === '1',
    regions: toArray(params.region),
    tags: toArray(params.tag),
    rated: params.rated === '1',
  }

  // 필터 파라미터만 담은 URLSearchParams (view, id 제외)
  const filterParams = new URLSearchParams()
  if (filter.q) filterParams.set('q', filter.q)
  filter.price.forEach((v) => filterParams.append('price', v))
  if (filter.decaf) filterParams.set('decaf', '1')
  filter.regions.forEach((v) => filterParams.append('region', v))
  filter.tags.forEach((v) => filterParams.append('tag', v))
  if (filter.rated) filterParams.set('rated', '1')
  if (sort !== 'popular') filterParams.set('sort', sort)

  const mapUrlParams = new URLSearchParams(filterParams)
  mapUrlParams.set('view', 'map')
  const mapUrl = `/roasteries?${mapUrlParams.toString()}`
  const listUrl = filterParams.toString() ? `/roasteries?${filterParams.toString()}` : '/roasteries'

  // 목록 + 지도 뷰에서만 상세 fetch
  const [roasteries, selectedRoastery, ratingCount] = await Promise.all([
    getRoasteries(sort, filter, userId),
    selectedId ? getRoasteryById(selectedId) : null,
    isMapView && userId && selectedId ? getRatingCount(userId) : 0,
  ])

  // 선택된 로스터리 상세 데이터
  let selectedDetail: SelectedRoasteryData | null = null
  if (selectedRoastery) {
    const initialSort = userId && ratingCount >= 3 ? 'SIMILAR' : 'HIGH'
    const [userRating, isBookmarked, ratingsResult] = await Promise.all([
      userId ? getUserRating(userId, selectedRoastery.id) : null,
      userId ? getBookmarkStatus(userId, selectedRoastery.id) : false,
      getRoasteryRatings({
        roasteryId: selectedRoastery.id,
        sort: initialSort,
        currentUserId: userId,
      }),
    ])
    selectedDetail = {
      roastery: selectedRoastery,
      isBookmarked,
      userRating: userRating
        ? { score: userRating.score, comment: userRating.comment ?? undefined }
        : undefined,
      initialRatings: ratingsResult.items,
      initialNextCursor: ratingsResult.nextCursor,
      initialSort,
    }
  }

  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">로스터리</h1>

      <Suspense fallback={null}>
        <FilterPanel filter={filter} sort={sort} isLoggedIn={!!userId} />
      </Suspense>

      {roasteries.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3 text-center">
          <p className="text-base font-medium">조건에 맞는 로스터리가 없어요.</p>
          <p className="text-sm text-muted-foreground">필터를 조정하거나 검색어를 바꿔보세요.</p>
          <RequestRoasteryButton />
        </div>
      ) : isMapView ? (
        <Suspense fallback={null}>
          <RoasteryMapLayout
            roasteries={roasteries}
            selectedDetail={selectedDetail}
            isLoggedIn={!!userId}
            activeRegions={filter.regions}
            listUrl={listUrl}
          />
        </Suspense>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{roasteries.length}개 로스터리</span>
            <Link
              href={mapUrl}
              className="flex items-center gap-1.5 text-sm border rounded-md px-3 py-1.5 hover:bg-muted transition-colors"
            >
              <MapPin className="size-4" />
              지도로 보기
            </Link>
          </div>
          <RoasteryGrid roasteries={roasteries} activeRegions={filter.regions} />
          <div className="flex justify-center pt-4 pb-2">
            <RequestRoasteryButton />
          </div>
        </>
      )}
    </div>
  )
}
