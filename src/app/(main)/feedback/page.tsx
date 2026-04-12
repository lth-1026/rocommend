import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { FeedbackPageClient } from '@/components/feedback/FeedbackPageClient'

export default async function FeedbackPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">의견 남기기</h1>
      <p className="text-sm text-text-secondary">
        불편한 점, 개선 아이디어, 오류 등 편하게 남겨 주세요.
      </p>
      <FeedbackPageClient />
    </div>
  )
}
