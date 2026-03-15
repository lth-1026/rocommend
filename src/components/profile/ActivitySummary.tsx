import Link from 'next/link'

interface ActivitySummaryProps {
  ratingCount: number
  bookmarkCount: number
}

export function ActivitySummary({ ratingCount, bookmarkCount }: ActivitySummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link
        href="/roasteries?rated=1"
        className="flex flex-col items-center gap-1 rounded-xl bg-surface px-4 py-5 transition-colors hover:bg-border"
      >
        <span className="text-2xl font-bold text-text-primary">{ratingCount}</span>
        <span className="text-xs text-text-secondary">평가한 로스터리</span>
      </Link>
      <Link
        href="/bookmarks"
        className="flex flex-col items-center gap-1 rounded-xl bg-surface px-4 py-5 transition-colors hover:bg-border"
      >
        <span className="text-2xl font-bold text-text-primary">{bookmarkCount}</span>
        <span className="text-xs text-text-secondary">즐겨찾기</span>
      </Link>
    </div>
  )
}
