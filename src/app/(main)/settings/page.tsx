import Link from 'next/link'
import { auth } from '@/lib/auth'
import { ThemeToggle } from '@/components/profile/ThemeToggle'

export default async function SettingsPage() {
  const session = await auth()

  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">설정</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-text-secondary">테마</h2>
        <ThemeToggle />
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
