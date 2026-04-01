import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { getRoasteries } from '@/lib/queries/roastery'
import { RoasteryGrid } from '@/components/roastery/RoasteryGrid'
import { FilterPanel } from '@/components/roastery/FilterPanel'
import { toArray } from '@/lib/utils'
import { PRICE_OPTIONS } from '@/types/roastery'
import type { SortOption, FilterParams, PriceRange } from '@/types/roastery'

interface RoasteriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RoasteriesPage({ searchParams }: RoasteriesPageProps) {
  const [params, session] = await Promise.all([searchParams, auth()])
  const userId = session?.user?.id

  const sort: SortOption = params.sort === 'name' ? 'name' : 'popular'

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

  const roasteries = await getRoasteries(sort, filter, userId)

  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">로스터리</h1>

      <Suspense fallback={null}>
        <FilterPanel filter={filter} sort={sort} isLoggedIn={!!userId} />
      </Suspense>

      {roasteries.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-2 text-center">
          <p className="text-base font-medium">조건에 맞는 로스터리가 없어요.</p>
          <p className="text-sm text-muted-foreground">필터를 조정하거나 검색어를 바꿔보세요.</p>
        </div>
      ) : (
        <RoasteryGrid roasteries={roasteries} activeRegions={filter.regions} />
      )}
    </div>
  )
}
