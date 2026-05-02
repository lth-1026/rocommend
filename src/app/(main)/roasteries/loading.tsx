import { Skeleton } from '@/components/ui/skeleton'

export default function RoasteriesLoading() {
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
