import Link from 'next/link'
import { getAdminBeans } from '@/actions/admin'

const ROASTING_LEVEL_LABEL: Record<string, string> = {
  LIGHT: '라이트',
  MEDIUM: '미디엄',
  MEDIUM_DARK: '미디엄 다크',
  DARK: '다크',
}

export default async function AdminBeansPage() {
  const beans = await getAdminBeans()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">원두 목록</h1>
        <Link
          href="/admin/beans/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:opacity-90 transition-opacity"
        >
          + 새 원두
        </Link>
      </div>

      {beans.length === 0 ? (
        <p className="text-text-sub">등록된 원두가 없습니다.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-sub">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-sub">이름</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">로스터리</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">로스팅</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">원산지</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">디카페인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {beans.map((b) => (
                <tr key={b.id} className="hover:bg-surface-sub transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{b.name}</td>
                  <td className="px-4 py-3 text-text-sub">{b.roastery.name}</td>
                  <td className="px-4 py-3 text-text-sub">{ROASTING_LEVEL_LABEL[b.roastingLevel] ?? b.roastingLevel}</td>
                  <td className="px-4 py-3 text-text-sub">{b.origins.join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-text-sub">{b.decaf ? 'O' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
