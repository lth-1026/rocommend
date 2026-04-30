import Link from 'next/link'
import { getAdminSections } from '@/actions/admin'
import { SectionList } from './_components/SectionList'

export default async function SectionsPage() {
  const sections = await getAdminSections()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">추천 섹션 관리</h1>
        <Link
          href="/admin/sections/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + 새 섹션
        </Link>
      </div>

      <p className="mb-4 text-sm text-text-sub">행을 드래그해서 순서를 변경한 뒤 저장하세요.</p>

      <SectionList initialSections={sections} />
    </div>
  )
}
