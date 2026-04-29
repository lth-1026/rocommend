import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getAdminRoastery, getAdminRoasteryBeans } from '@/actions/admin'
import { RoasteryStatusButtons } from '@/components/admin/RoasteryStatusButtons'
import { BeanStatusButton } from '@/components/admin/BeanStatusButton'

const PRICE_RANGE_LABEL: Record<string, string> = {
  LOW: '2만원 미만',
  MID: '2~3.5만원',
  HIGH: '3.5만원+',
}

const ROASTING_LEVEL_LABEL: Record<string, string> = {
  LIGHT: '라이트',
  MEDIUM: '미디엄',
  MEDIUM_DARK: '미디엄 다크',
  DARK: '다크',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function RoasteryDetailPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/')

  const { id } = await params
  const [roastery, beans] = await Promise.all([getAdminRoastery(id), getAdminRoasteryBeans(id)])
  if (!roastery) notFound()

  const primaryRegion = roastery.tags.find((t) => t.category === 'REGION')?.name ?? '—'
  const isDeleted = roastery.deletedAt !== null
  const isClosed = roastery.closedAt !== null
  const isHidden = roastery.hidden

  return (
    <div className="flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/roasteries" className="text-sm text-text-sub hover:text-text">
          ← 목록
        </Link>
        <h1 className="text-2xl font-bold text-text">{roastery.name}</h1>
        {isDeleted && (
          <span className="rounded px-2 py-0.5 text-xs bg-red-100 text-red-700">삭제됨</span>
        )}
        {!isDeleted && isClosed && (
          <span className="rounded px-2 py-0.5 text-xs bg-amber-100 text-amber-700">폐업</span>
        )}
        {!isDeleted && !isClosed && isHidden && (
          <span className="rounded px-2 py-0.5 text-xs bg-gray-100 text-gray-600">숨김</span>
        )}
      </div>

      {/* 로스터리 정보 카드 */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-semibold text-text">로스터리 정보</h2>
          <div className="flex items-center gap-3">
            {!isDeleted && (
              <Link
                href={`/admin/roasteries/${id}/edit`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-sub hover:text-text transition-colors"
              >
                수정
              </Link>
            )}
            <RoasteryStatusButtons
              roasteryId={id}
              deletedAt={roastery.deletedAt}
              hidden={roastery.hidden}
              closedAt={roastery.closedAt}
            />
          </div>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-text-sub">대표 지역</dt>
            <dd className="text-text">{primaryRegion}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-text-sub">가격대</dt>
            <dd className="text-text">{PRICE_RANGE_LABEL[roastery.priceRange]}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-text-sub">디카페인</dt>
            <dd className="text-text">{roastery.decaf ? 'O' : '—'}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-text-sub">Q5 노출</dt>
            <dd className="text-text">{roastery.isOnboardingCandidate ? 'O' : '—'}</dd>
          </div>
          {roastery.description && (
            <div className="col-span-2 flex gap-2">
              <dt className="w-20 shrink-0 text-text-sub">설명</dt>
              <dd className="text-text">{roastery.description}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* 원두 목록 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">원두 목록 ({beans.length})</h2>
          {!isDeleted && (
            <Link
              href={`/admin/roasteries/${id}/beans/new`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              + 새 원두
            </Link>
          )}
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
                  <th className="px-4 py-3 text-left font-medium text-text-sub">상태</th>
                  <th className="px-4 py-3 text-left font-medium text-text-sub"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {beans.map((b) => {
                  const beanDeleted = b.deletedAt !== null
                  const beanHidden = b.hidden
                  return (
                    <tr
                      key={b.id}
                      className={`transition-colors ${beanDeleted ? 'opacity-50' : 'hover:bg-surface-sub'}`}
                    >
                      <td className="px-4 py-3 font-medium text-text">{b.name}</td>
                      <td className="px-4 py-3 text-text-sub">
                        {ROASTING_LEVEL_LABEL[b.roastingLevel] ?? b.roastingLevel}
                      </td>
                      <td className="px-4 py-3 text-text-sub">{b.origins.join(', ') || '—'}</td>
                      <td className="px-4 py-3 text-text-sub">{b.decaf ? 'O' : '—'}</td>
                      <td className="px-4 py-3">
                        {beanDeleted ? (
                          <span className="rounded px-1.5 py-0.5 text-xs bg-red-100 text-red-700">
                            삭제됨
                          </span>
                        ) : beanHidden ? (
                          <span className="rounded px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600">
                            숨김
                          </span>
                        ) : (
                          <span className="text-xs text-text-sub">활성</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!beanDeleted && (
                            <Link
                              href={`/admin/roasteries/${id}/beans/${b.id}/edit`}
                              className="text-xs text-text-sub hover:text-text transition-colors"
                            >
                              수정
                            </Link>
                          )}
                          <BeanStatusButton
                            beanId={b.id}
                            deletedAt={b.deletedAt}
                            hidden={b.hidden}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
