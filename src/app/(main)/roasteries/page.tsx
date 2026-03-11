import { Suspense } from 'react'
import { getRoasteries } from '@/lib/queries/roastery'
import { RoasteryGrid } from '@/components/roastery/RoasteryGrid'
import { SortSelector } from '@/components/roastery/SortSelector'
import type { SortOption } from '@/types/roastery'

interface RoasteriesPageProps {
  searchParams: Promise<{ sort?: string }>
}

export default async function RoasteriesPage({ searchParams }: RoasteriesPageProps) {
  const { sort: sortParam } = await searchParams
  const sort: SortOption = sortParam === 'name' ? 'name' : 'popular'

  const roasteries = await getRoasteries(sort)

  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">로스터리</h1>
        <Suspense fallback={null}>
          <SortSelector sort={sort} />
        </Suspense>
      </div>
      <RoasteryGrid roasteries={roasteries} />
    </div>
  )
}
