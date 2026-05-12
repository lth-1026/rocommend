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
    <div className="flex h-dvh flex-col bg-bg">
      <Navigation />
      <main
        className="fixed inset-x-0 top-0 overflow-y-auto bg-bg
          bottom-[calc(var(--bottom-tab-height)+env(safe-area-inset-bottom,0px))]
          lg:static lg:flex-1 lg:bottom-auto"
      >
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
