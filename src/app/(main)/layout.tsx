import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/layout/Navigation'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const onboarding = await prisma.onboarding.findUnique({
    where: { userId: session!.user.id },
    select: { id: true },
  })

  if (!onboarding) redirect('/onboarding')

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navigation />
      {/* 모바일: BottomTab 높이(64px)만큼 하단 패딩 */}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
    </div>
  )
}
