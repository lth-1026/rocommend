import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { RoasteriesContent } from './RoasteriesContent'

export const metadata: Metadata = {
  title: '로스터리',
  description: '한국 커피 로스터리를 취향에 맞게 찾아보세요.',
  alternates: {
    canonical: '/roasteries',
  },
}

function ListViewSkeleton() {
  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <Skeleton className="h-7 w-24" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-row items-start gap-3 rounded-xl p-2">
            <Skeleton className="size-16 rounded-lg shrink-0" />
            <div className="flex flex-col justify-between h-16 min-w-0 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MapViewSkeleton() {
  return (
    <div className="page-wrapper flex flex-col lg:py-8">
      {/* 헤더 스켈레톤 */}
      <div className="pt-8 pb-3 flex flex-col gap-4 border-b lg:border-none lg:pb-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-20" />
          {/* 데스크탑: 뷰 토글 버튼 */}
          <div className="hidden lg:flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
        {/* 모바일: 검색 + 필터 버튼 */}
        <div className="flex gap-2 lg:hidden">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
        {/* 데스크탑: pill 필터 */}
        <div className="hidden lg:flex gap-2">
          <Skeleton className="h-9 w-56 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>
      {/* 지도 플레이스홀더 */}
      <Skeleton
        style={{
          borderRadius: 0,
          height:
            'calc(100svh - var(--bottom-tab-height) - env(safe-area-inset-bottom, 0px) - 8rem)',
          width: 'calc(100% + 2 * var(--page-padding))',
          marginLeft: 'calc(-1 * var(--page-padding))',
          marginRight: 'calc(-1 * var(--page-padding))',
        }}
      />
    </div>
  )
}

interface RoasteriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RoasteriesPage({ searchParams }: RoasteriesPageProps) {
  const params = await searchParams
  const isMapView = params.view === 'map'

  return (
    <Suspense fallback={isMapView ? <MapViewSkeleton /> : <ListViewSkeleton />}>
      <RoasteriesContent params={params} />
    </Suspense>
  )
}
