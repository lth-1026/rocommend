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
      <main className="flex-1 overflow-y-auto">
        <PageTransition>{children}</PageTransition>
      </main>
      {/* 모바일 BottomTab 스페이서 — flex 레이아웃에서 탭 높이만큼 공간 확보,
          main 스크롤바가 BottomTab 뒤로 들어가지 않도록 함 */}
      <div
        className="flex-none lg:hidden h-[calc(var(--bottom-tab-height)+env(safe-area-inset-bottom,0px))]"
        aria-hidden="true"
      />
    </div>
  )
}
