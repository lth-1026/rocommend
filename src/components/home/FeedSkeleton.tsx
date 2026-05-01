import { Skeleton } from '@/components/ui/skeleton'

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border p-4">
      <Skeleton className="h-36 w-full rounded-lg" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-border">
      <div className="flex flex-col gap-4 py-6">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 py-6">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
