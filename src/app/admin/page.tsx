import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text">관리자 대시보드</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/roasteries"
          className="rounded-xl border border-border bg-surface p-6 hover:border-primary transition-colors"
        >
          <h2 className="mb-1 text-lg font-semibold text-text">로스터리 관리</h2>
          <p className="text-sm text-text-sub">로스터리 목록 조회 및 신규 등록</p>
        </Link>
        <Link
          href="/admin/beans"
          className="rounded-xl border border-border bg-surface p-6 hover:border-primary transition-colors"
        >
          <h2 className="mb-1 text-lg font-semibold text-text">원두 관리</h2>
          <p className="text-sm text-text-sub">원두 목록 조회 및 신규 등록</p>
        </Link>
      </div>
    </div>
  )
}
