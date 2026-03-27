import Link from 'next/link'
import { RoasteryForm } from '@/components/admin/RoasteryForm'

export default function NewRoasteryPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/roasteries" className="text-sm text-text-sub hover:text-text">
          ← 목록
        </Link>
        <h1 className="text-2xl font-bold text-text">새 로스터리 등록</h1>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <RoasteryForm />
      </div>
    </div>
  )
}
