import Link from 'next/link'

export function EmptyBookmark() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-base font-medium">아직 즐겨찾기한 로스터리가 없어요.</p>
      <p className="text-sm text-muted-foreground">마음에 드는 로스터리를 저장해보세요.</p>
      <Link
        href="/roasteries"
        className="mt-2 inline-flex h-8 items-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        로스터리 둘러보기
      </Link>
    </div>
  )
}
