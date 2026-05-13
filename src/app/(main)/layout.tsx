import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navigation } from '@/components/layout/Navigation'
import { PageTransition } from '@/components/motion/PageTransition'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (session?.user?.id) {
    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!onboarding) redirect('/onboarding')
  }

  return (
    <div className="bg-bg">
      <Navigation />
      <main className="pb-[var(--bottom-tab-height)] lg:pt-[var(--header-height)] lg:pb-0">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
