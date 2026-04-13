import { getAdminUsers } from '@/actions/admin'
import { FeedbackEmailToggle } from './_components/FeedbackEmailToggle'

export default async function AdminSettingsPage() {
  const admins = await getAdminUsers()

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-text">설정</h1>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text">피드백 이메일 수신</h2>
          <p className="mt-1 text-sm text-text-sub">
            의견이 접수될 때 이메일 알림을 받을 어드민을 설정합니다.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-text">{admin.name ?? '(이름 없음)'}</span>
                <span className="text-xs text-text-sub">{admin.email ?? '(이메일 없음)'}</span>
              </div>
              <FeedbackEmailToggle userId={admin.id} enabled={admin.receiveFeedbackEmail} />
            </div>
          ))}
          {admins.length === 0 && (
            <p className="text-sm text-text-sub">등록된 어드민이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  )
}
