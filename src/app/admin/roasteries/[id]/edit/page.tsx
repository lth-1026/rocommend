import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getAdminRoastery, getAdminRoasteryBeans } from '@/actions/admin'
import { RoasteryForm } from '@/components/admin/RoasteryForm'
import type { PriceRange } from '@prisma/client'

const ROASTING_LEVEL_LABEL: Record<string, string> = {
  LIGHT: '라이트',
  MEDIUM_LIGHT: '미디움 라이트',
  MEDIUM: '미디엄',
  MEDIUM_DARK: '미디엄 다크',
  DARK: '다크',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditRoasteryPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/')

  const { id } = await params
  const [roastery, beans] = await Promise.all([getAdminRoastery(id), getAdminRoasteryBeans(id)])
  if (!roastery) notFound()

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-8">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/roasteries" className="text-sm text-text-sub hover:text-text">
            ← 목록
          </Link>
          <h1 className="text-2xl font-bold text-text">로스터리 수정</h1>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <RoasteryForm
            roasteryId={roastery.id}
            initialData={{
              name: roastery.name,
              description: roastery.description ?? '',
              address: roastery.address ?? '',
              tags: roastery.tags,
              priceRange: roastery.priceRange as PriceRange,
              decaf: roastery.decaf,
              imageUrl: roastery.imageUrl ?? '',
              isOnboardingCandidate: roastery.isOnboardingCandidate,
              channels: roastery.channels,
            }}
          />
        </div>
      </div>

      {/* 원두 목록 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">원두 목록 ({beans.length})</h2>
          <Link
            href={`/admin/roasteries/${id}/beans/new`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            + 새 원두
          </Link>
        </div>

        {beans.length === 0 ? (
          <p className="text-sm text-text-sub">등록된 원두가 없습니다.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-sub">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-sub">이름</th>
                  <th className="px-4 py-3 text-left font-medium text-text-sub">로스팅</th>
                  <th className="px-4 py-3 text-left font-medium text-text-sub">원산지</th>
                  <th className="px-4 py-3 text-left font-medium text-text-sub">디카페인</th>
                  <th className="px-4 py-3 text-left font-medium text-text-sub"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {beans.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-sub transition-colors">
                    <td className="px-4 py-3 font-medium text-text">{b.name}</td>
                    <td className="px-4 py-3 text-text-sub">
                      {ROASTING_LEVEL_LABEL[b.roastingLevel] ?? b.roastingLevel}
                    </td>
                    <td className="px-4 py-3 text-text-sub">{b.origins.join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-text-sub">{b.decaf ? 'O' : '—'}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/roasteries/${id}/beans/${b.id}/edit`}
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
    </div>
  )
}
