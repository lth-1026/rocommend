import { prisma } from '@/lib/prisma'
import { MarkReadButton } from './_components/MarkReadButton'

export default async function AdminRoasteryRequestsPage() {
  const requests = await prisma.roasteryRequest.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      user: { select: { name: true, email: true } },
    },
  })

  const pending = requests.filter((r) => r.status === 'PENDING')
  const read = requests.filter((r) => r.status === 'READ')

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-text">로스터리 추가 요청</h1>
        <p className="mt-1 text-sm text-text-sub">
          사용자가 요청한 로스터리 목록입니다. 확인 후 등록 여부를 결정해 주세요.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-text">
          미확인 <span className="text-sm font-normal text-text-sub">({pending.length}건)</span>
        </h2>

        {pending.length === 0 ? (
          <p className="text-sm text-text-sub">미확인 요청이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-text">{req.name}</span>
                  <span className="text-xs text-text-sub">
                    {req.user.name ?? '(이름 없음)'} · {req.user.email ?? '(이메일 없음)'} ·{' '}
                    {req.createdAt.toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <MarkReadButton id={req.id} status={req.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {read.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-text">
            확인됨 <span className="text-sm font-normal text-text-sub">({read.length}건)</span>
          </h2>

          <div className="flex flex-col gap-2">
            {read.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 opacity-60"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-text">{req.name}</span>
                  <span className="text-xs text-text-sub">
                    {req.user.name ?? '(이름 없음)'} · {req.user.email ?? '(이메일 없음)'} ·{' '}
                    {req.createdAt.toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <MarkReadButton id={req.id} status={req.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
