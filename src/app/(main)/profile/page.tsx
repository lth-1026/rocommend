import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getProfileSummary } from '@/lib/queries/profile'
import { getUserRatings } from '@/lib/queries/rating'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { ActivitySummary } from '@/components/profile/ActivitySummary'
import { MyRatingList } from '@/components/profile/MyRatingList'
import { LogoutButton } from '@/components/profile/LogoutButton'
import { ThemeToggle } from '@/components/profile/ThemeToggle'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [summary, user, myRatings] = await Promise.all([
    getProfileSummary(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true },
    }),
    getUserRatings(session.user.id),
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
        <h2 className="text-sm font-medium text-text-secondary">내 한줄평</h2>
        <div className="rounded-xl bg-surface px-4 overflow-hidden">
          <MyRatingList initialItems={myRatings.items} initialNextCursor={myRatings.nextCursor} />
        </div>
      </section>

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

      <LogoutButton />
    </div>
  )
}
