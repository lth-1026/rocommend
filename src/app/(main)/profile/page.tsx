import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getProfileSummary } from '@/lib/queries/profile'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { ActivitySummary } from '@/components/profile/ActivitySummary'
import { LogoutButton } from '@/components/profile/LogoutButton'
import { ThemeToggle } from '@/components/profile/ThemeToggle'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [summary, user] = await Promise.all([
    getProfileSummary(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true },
    }),
  ])

  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">프로필</h1>

      <ProfileCard
        name={user?.name ?? session.user.name ?? null}
        email={session.user.email ?? null}
        image={user?.image ?? session.user.image ?? null}
      />

      <ActivitySummary ratingCount={summary.ratingCount} bookmarkCount={summary.bookmarkCount} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-text-secondary">테마</h2>
        <ThemeToggle />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-text-secondary">피드백</h2>
        <FeedbackButton />
      </section>

      <Link
        href="/account"
        className="w-full cursor-pointer rounded-lg border border-border bg-surface px-4 py-3 text-center text-sm font-medium text-text-primary transition-colors hover:bg-bg"
      >
        계정 관리
      </Link>

      <LogoutButton />
    </div>
  )
}
