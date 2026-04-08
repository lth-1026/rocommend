import Link from 'next/link'
import { getAdminRoasteries } from '@/actions/admin'
import { SectionForm } from '@/components/admin/SectionForm'
import { getRegions } from '@/types/roastery'

export default async function NewSectionPage() {
  const roasteries = await getAdminRoasteries()
  const options = roasteries.map((r) => ({
    id: r.id,
    name: r.name,
    primaryRegion: getRegions(r.tags)[0] ?? null,
  }))

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/sections" className="text-sm text-text-sub hover:text-text">
          ← 목록
        </Link>
        <h1 className="text-2xl font-bold text-text">새 추천 섹션</h1>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <SectionForm roasteries={options} />
      </div>
    </div>
  )
}
