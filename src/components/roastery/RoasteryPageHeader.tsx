import { Suspense } from 'react'
import { FilterPanel } from './FilterPanel'
import type { FilterParams, SortOption } from '@/types/roastery'

interface Props {
  filter: FilterParams
  sort: SortOption
  isLoggedIn: boolean
}

export function RoasteryPageHeader({ filter, sort, isLoggedIn }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">로스터리</h1>
      <Suspense fallback={null}>
        <FilterPanel filter={filter} sort={sort} isLoggedIn={isLoggedIn} />
      </Suspense>
    </div>
  )
}
