import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const onboarding = await prisma.onboarding.findUnique({
    where: { userId: session!.user.id },
    select: { id: true },
  })

  if (!onboarding) redirect('/onboarding')

  return <>{children}</>
}
