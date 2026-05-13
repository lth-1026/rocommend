import { Skeleton } from '@/components/ui/skeleton'

export function RatingListSkeleton() {
  return (
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
  )
}
