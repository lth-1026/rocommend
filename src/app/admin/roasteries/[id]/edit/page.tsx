import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getAdminRoastery } from '@/actions/admin'
import { RoasteryForm } from '@/components/admin/RoasteryForm'
import type { PriceRange, TagCategory } from '@prisma/client'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditRoasteryPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/home')

  const { id } = await params
  const roastery = await getAdminRoastery(id)
  if (!roastery) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/roasteries" className="text-sm text-text-sub hover:text-text">
          ← 목록
        </Link>
        <h1 className="text-2xl font-bold text-text">로스터리 수정</h1>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <RoasteryForm
          roasteryId={roastery.id}
          initialData={{
            name: roastery.name,
            description: roastery.description ?? '',
            tags: roastery.tags.map((t) => ({ ...t, category: t.category as TagCategory })),
            priceRange: roastery.priceRange as PriceRange,
            decaf: roastery.decaf,
            imageUrl: roastery.imageUrl ?? '',
            website: roastery.website ?? '',
            isOnboardingCandidate: roastery.isOnboardingCandidate,
          }}
        />
      </div>
    </div>
  )
}
