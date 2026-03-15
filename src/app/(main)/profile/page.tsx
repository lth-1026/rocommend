import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getProfileSummary } from '@/lib/queries/profile'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { ActivitySummary } from '@/components/profile/ActivitySummary'
import { LogoutButton } from '@/components/profile/LogoutButton'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const summary = await getProfileSummary(session.user.id)

  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">프로필</h1>

      <ProfileCard
        name={session.user.name ?? null}
        email={session.user.email ?? null}
        image={session.user.image ?? null}
      />

      <ActivitySummary
        ratingCount={summary.ratingCount}
        bookmarkCount={summary.bookmarkCount}
      />

      <LogoutButton />
    </div>
  )
}
