import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function RoasteryDetailLoading() {
  return (
    <div className="page-wrapper py-8 flex flex-col gap-8">
      {/* 뒤로가기 버튼 */}
      <Skeleton className="h-8 w-16 rounded-lg" />

      {/* 기본 정보 */}
      <div className="flex flex-col gap-2">
        {/* 이미지 + 이름/평점 행 */}
        <div className="flex gap-4 items-start">
          <Skeleton className="size-20 rounded-xl shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-8 w-48" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>

        {/* 지역 */}
        <Skeleton className="h-4 w-20" />

        {/* 설명 */}
        <Skeleton className="h-4 w-full max-w-prose" />
        <Skeleton className="h-4 w-3/4 max-w-prose" />

        {/* 배지 row */}
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <Separator />

      {/* 원두 라인업 */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-xl border border-border p-4">
            <Skeleton className="size-16 rounded-lg shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-start justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* 한줄평 목록 */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-20" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
