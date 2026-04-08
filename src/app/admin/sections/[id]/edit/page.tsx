import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminSection, getAdminRoasteries } from '@/actions/admin'
import { SectionForm } from '@/components/admin/SectionForm'
import { getRegions } from '@/types/roastery'
import { DeleteSectionButton } from '../../_components/DeleteSectionButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSectionPage({ params }: Props) {
  const { id } = await params
  const [section, roasteries] = await Promise.all([getAdminSection(id), getAdminRoasteries()])

  if (!section) notFound()

  const options = roasteries.map((r) => ({
    id: r.id,
    name: r.name,
    primaryRegion: getRegions(r.tags)[0] ?? null,
  }))

  const initialData = {
    title: section.title,
    order: section.order,
    isActive: section.isActive,
    roasteryIds: section.roasteries.map((r) => r.roasteryId),
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/sections" className="text-sm text-text-sub hover:text-text">
            ← 목록
          </Link>
          <h1 className="text-2xl font-bold text-text">섹션 수정</h1>
        </div>
        <DeleteSectionButton sectionId={id} />
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <SectionForm sectionId={id} initialData={initialData} roasteries={options} />
      </div>
    </div>
  )
}
