'use client'

import { useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { reorderSections } from '@/actions/admin'

interface SectionItem {
  id: string
  title: string
  order: number
  isActive: boolean
  _count: { roasteries: number }
}

export function SectionList({ initialSections }: { initialSections: SectionItem[] }) {
  const router = useRouter()
  const [sections, setSections] = useState(initialSections)
  const [isPending, startTransition] = useTransition()
  const dragId = useRef<string | null>(null)
  const dragOverId = useRef<string | null>(null)

  function handleDragStart(id: string) {
    dragId.current = id
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    dragOverId.current = id
  }

  function handleDrop() {
    const from = dragId.current
    const to = dragOverId.current
    if (!from || !to || from === to) return

    setSections((prev) => {
      const next = [...prev]
      const fromIdx = next.findIndex((s) => s.id === from)
      const toIdx = next.findIndex((s) => s.id === to)
      const [item] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, item)
      return next
    })

    dragId.current = null
    dragOverId.current = null
  }

  function handleSaveOrder() {
    startTransition(async () => {
      const result = await reorderSections(sections.map((s) => s.id))
      if (result.success) {
        toast.success('순서가 저장되었습니다.')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <p className="text-text-sub">등록된 섹션이 없습니다.</p>
        <Link
          href="/admin/sections/new"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          첫 번째 섹션 추가하기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg">
            <tr>
              <th className="w-8 px-3 py-3" />
              <th className="px-4 py-3 text-left font-medium text-text-sub">제목</th>
              <th className="px-4 py-3 text-left font-medium text-text-sub">로스터리 수</th>
              <th className="px-4 py-3 text-left font-medium text-text-sub">상태</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sections.map((s) => (
              <tr
                key={s.id}
                draggable
                onDragStart={() => handleDragStart(s.id)}
                onDragOver={(e) => handleDragOver(e, s.id)}
                onDrop={handleDrop}
                className="hover:bg-bg/50 cursor-grab active:cursor-grabbing active:opacity-60 transition-opacity"
              >
                <td className="px-3 py-3 text-text-sub text-center select-none">⠿</td>
                <td className="px-4 py-3 font-medium text-text">{s.title}</td>
                <td className="px-4 py-3 text-text-sub">{s._count.roasteries}개</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {s.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/sections/${s.id}/edit`}
                    className="text-xs text-primary hover:underline"
                  >
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveOrder}
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? '저장 중...' : '순서 저장'}
        </button>
      </div>
    </div>
  )
}
