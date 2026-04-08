import Link from 'next/link'
import { getAdminRoasteries } from '@/actions/admin'

const PRICE_RANGE_LABEL: Record<string, string> = {
  LOW: '2만원 미만',
  MID: '2~3.5만원',
  HIGH: '3.5만원+',
}

export default async function AdminRoasteriesPage() {
  const roasteries = await getAdminRoasteries()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">로스터리 목록</h1>
        <Link
          href="/admin/roasteries/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          + 새 로스터리
        </Link>
      </div>

      {roasteries.length === 0 ? (
        <p className="text-text-sub">등록된 로스터리가 없습니다.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-sub">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-sub">이름</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">대표 지역</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">가격대</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">디카페인</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">원두 수</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">Q5 노출</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {roasteries.map((r) => (
                <tr key={r.id} className="hover:bg-surface-sub transition-colors">
                  <td className="px-4 py-3 font-medium text-text">
                    <Link
                      href={`/admin/roasteries/${r.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-sub">
                    {r.tags.find((t) => t.category === 'REGION')?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-text-sub">{PRICE_RANGE_LABEL[r.priceRange]}</td>
                  <td className="px-4 py-3 text-text-sub">{r.decaf ? 'O' : '—'}</td>
                  <td className="px-4 py-3 text-text-sub">{r._count.beans}</td>
                  <td className="px-4 py-3 text-text-sub">{r.isOnboardingCandidate ? 'O' : '—'}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/roasteries/${r.id}/edit`}
                      className="text-xs text-text-sub hover:text-text transition-colors"
                    >
                      수정
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
