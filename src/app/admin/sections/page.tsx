import Link from 'next/link'
import { getAdminSections } from '@/actions/admin'

export default async function SectionsPage() {
  const sections = await getAdminSections()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">추천 섹션 관리</h1>
        <Link
          href="/admin/sections/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + 새 섹션
        </Link>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
          <p className="text-text-sub">등록된 섹션이 없습니다.</p>
          <Link
            href="/admin/sections/new"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            첫 번째 섹션 추가하기
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-sub">순서</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">제목</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">로스터리 수</th>
                <th className="px-4 py-3 text-left font-medium text-text-sub">상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sections.map((s) => (
                <tr key={s.id} className="hover:bg-bg/50">
                  <td className="px-4 py-3 text-text-sub">{s.order}</td>
                  <td className="px-4 py-3 font-medium text-text">{s.title}</td>
                  <td className="px-4 py-3 text-text-sub">{s._count.roasteries}개</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {s.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/sections/${s.id}/edit`}
                      className="text-xs text-primary hover:underline"
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
