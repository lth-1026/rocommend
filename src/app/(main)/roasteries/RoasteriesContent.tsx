import { Suspense } from 'react'
import Link from 'next/link'
import { MapPin, List } from 'lucide-react'
import { auth } from '@/lib/auth'
import { getRoasteries, getRoasteryById } from '@/lib/queries/roastery'
import { getUserRating, getRatingCount, getRoasteryRatings } from '@/lib/queries/rating'
import { getBookmarkStatus } from '@/lib/queries/bookmark'
import { RequestRoasteryButton } from '@/components/roastery/RequestRoasteryButton'
import { RoasteryPageHeader } from '@/components/roastery/RoasteryPageHeader'
import { RoasteryGrid } from '@/components/roastery/RoasteryGrid'
import { RoasteryMapLayout } from '@/components/roastery/map/RoasteryMapLayout'
import { RoasteriesViewTracker } from '@/components/roastery/RoasteriesViewTracker'
import { toArray } from '@/lib/utils'
import { PRICE_OPTIONS } from '@/types/roastery'
import type { SortOption, FilterParams, PriceRange } from '@/types/roastery'
import type { SelectedRoasteryData } from '@/components/roastery/map/RoasteryMapLayout'

interface Props {
  params: { [key: string]: string | string[] | undefined }
}

export async function RoasteriesContent({ params }: Props) {
  const session = await auth()
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

  const filterParams = new URLSearchParams()
  if (filter.q) filterParams.set('q', filter.q)
  filter.price.forEach((v) => filterParams.append('price', v))
  if (filter.decaf) filterParams.set('decaf', '1')
  filter.regions.forEach((v) => filterParams.append('region', v))
  filter.tags.forEach((v) => filterParams.append('tag', v))
  if (filter.rated) filterParams.set('rated', '1')
  if (sort !== 'popular') filterParams.set('sort', sort)

  const isFiltered = !!(
    filter.q ||
    filter.price.length > 0 ||
    filter.decaf ||
    filter.regions.length > 0 ||
    filter.tags.length > 0 ||
    filter.rated
  )

  const mapUrlParams = new URLSearchParams(filterParams)
  mapUrlParams.set('view', 'map')
  const mapUrl = `/roasteries?${mapUrlParams.toString()}`
  const listUrl = filterParams.toString() ? `/roasteries?${filterParams.toString()}` : '/roasteries'

  const [roasteries, selectedRoastery, ratingCount] = await Promise.all([
    getRoasteries(sort, filter, userId),
    selectedId ? getRoasteryById(selectedId) : null,
    isMapView && userId && selectedId ? getRatingCount(userId) : 0,
  ])

  const mapRoasteries = isMapView
    ? roasteries.filter((r) => r.locations.some((l) => l.address))
    : roasteries

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

  const pageHeader = <RoasteryPageHeader filter={filter} sort={sort} isLoggedIn={!!userId} />

  if (isMapView) {
    return (
      <div className="flex flex-col lg:h-[calc(100vh-var(--header-height))] lg:overflow-hidden">
        <RoasteriesViewTracker view="map" />
        <div className="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
          <Suspense fallback={null}>
            <RoasteryMapLayout
              roasteries={mapRoasteries}
              selectedDetail={selectedDetail}
              isLoggedIn={!!userId}
              activeRegions={filter.regions}
              isFiltered={isFiltered}
              mobileHeader={pageHeader}
              listUrl={listUrl}
              filter={filter}
              sort={sort}
            />
          </Suspense>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper flex flex-col gap-6 py-8">
      <RoasteriesViewTracker view={isMapView ? 'map' : 'list'} />
      {pageHeader}

      {mapRoasteries.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3 text-center">
          <p className="text-base font-medium">조건에 맞는 로스터리가 없어요.</p>
          <p className="text-sm text-muted-foreground">필터를 조정하거나 검색어를 바꿔보세요.</p>
          <RequestRoasteryButton />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{roasteries.length}개 로스터리</span>
            <div className="hidden lg:flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
              <span className="flex items-center justify-center w-7 h-6 rounded-md bg-background shadow-sm text-foreground">
                <List className="size-3.5" />
              </span>
              <Link
                href={mapUrl}
                className="flex items-center justify-center w-7 h-6 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                aria-label="지도로 보기"
              >
                <MapPin className="size-3.5" />
              </Link>
            </div>
          </div>
          <RoasteryGrid roasteries={roasteries} activeRegions={filter.regions} />
          <div className="flex justify-center pt-4 pb-2">
            <RequestRoasteryButton />
          </div>
        </>
      )}

      {!isMapView && (
        <Link
          href={mapUrl}
          className="lg:hidden fixed bottom-[calc(var(--bottom-tab-height)+env(safe-area-inset-bottom,0px)+20px)] right-page-edge z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          style={{ touchAction: 'manipulation' }}
          aria-label="지도로 보기"
        >
          <MapPin className="size-6" />
        </Link>
      )}
    </div>
  )
}
