import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { flattenTags } from '@/types/roastery'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const session = await auth()
  const existing = await prisma.onboarding.findUnique({
    where: { userId: session!.user.id },
    select: { id: true },
  })
  if (existing) redirect('/home')

  const roasteries = await prisma.roastery.findMany({
    where: { isOnboardingCandidate: true },
    select: {
      id: true,
      name: true,
      tags: {
        select: { isPrimary: true, tag: { select: { id: true, name: true, category: true } } },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="w-full max-w-md space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">취향 설문</h1>
        <p className="mt-1 text-sm text-text-secondary">
          맞춤 로스터리 추천을 위해 취향을 알려주세요
        </p>
      </div>
      <OnboardingWizard roasteries={roasteries.map((r) => ({ ...r, tags: flattenTags(r.tags) }))} />
    </div>
  )
}
