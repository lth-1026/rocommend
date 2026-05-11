import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { BottomTab } from '@/components/layout/BottomTab'
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
    <div className="flex h-[100svh] flex-col bg-bg">
      <Header className="hidden lg:flex" />
      <main className="flex-1 overflow-y-auto">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomTab className="flex lg:hidden" />
    </div>
  )
}
