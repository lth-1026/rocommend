import Link from 'next/link'
import { auth } from '@/lib/auth'
import { ThemeToggle } from '@/components/profile/ThemeToggle'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'

export default async function SettingsPage() {
  const session = await auth()

  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">설정</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-text-secondary">테마</h2>
        <ThemeToggle />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-text-secondary">피드백</h2>
        <FeedbackButton />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-text-secondary">법적 고지</h2>
        <div className="flex flex-col rounded-xl bg-surface overflow-hidden">
          <Link
            href="/legal/privacy"
            className="flex items-center justify-between px-4 py-3 text-sm text-text-primary hover:bg-bg transition-colors border-b border-border"
          >
            <span>개인정보처리방침</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-text-secondary"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/legal/terms"
            className="flex items-center justify-between px-4 py-3 text-sm text-text-primary hover:bg-bg transition-colors"
          >
            <span>이용약관</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-text-secondary"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>

      {!session?.user && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-text-secondary">계정</h2>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg"
          >
            로그인
          </Link>
        </section>
      )}
    </div>
  )
}
