'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteSection } from '@/actions/admin'

export function DeleteSectionButton({ sectionId }: { sectionId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('이 섹션을 삭제하시겠습니까?')) return
    startTransition(async () => {
      const result = await deleteSection(sectionId)
      if (result.success) {
        toast.success('섹션이 삭제되었습니다.')
        router.push('/admin/sections')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? '삭제 중...' : '삭제'}
    </button>
  )
}
