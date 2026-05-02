import { Skeleton } from '@/components/ui/skeleton'

function CardSkeleton() {
  return (
    <div className="w-36 sm:w-40 lg:w-[calc((100%-6rem)/7)] flex-shrink-0 flex flex-col gap-2">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <div className="flex flex-col gap-0.5 px-0.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-1.5 pt-0.5">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </div>
  )
}

function SectionSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="page-wrapper">
        <Skeleton className={`h-5 ${titleWidth} border-b border-border pb-2`} />
      </div>
      <div>
        {/* 모바일/태블릿: 가로 스크롤 */}
        <div className="lg:hidden flex gap-4 pl-4 md:pl-8 overflow-x-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        {/* 데스크탑: flex row */}
        <div className="hidden lg:flex gap-4 page-wrapper">
          {Array.from({ length: 7 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <SectionSkeleton titleWidth="w-32" />
      <SectionSkeleton titleWidth="w-40" />
    </div>
  )
}
