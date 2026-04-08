'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createSection, updateSection } from '@/actions/admin'

interface RoasteryOption {
  id: string
  name: string
  primaryRegion: string | null
}

interface SectionFormProps {
  sectionId?: string
  isSystem?: boolean // 시스템 섹션: 로스터리 선택 불가
  initialData?: {
    title: string
    order: number
    isActive: boolean
    roasteryIds: string[]
  }
  roasteries: RoasteryOption[]
}

const MAX_ROASTERIES = 7

export function SectionForm({
  sectionId,
  isSystem = false,
  initialData,
  roasteries,
}: SectionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [order, setOrder] = useState(initialData?.order ?? 0)
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [selectedIds, setSelectedIds] = useState<string[]>(initialData?.roasteryIds ?? [])
  const [search, setSearch] = useState('')

  const isEdit = !!sectionId

  const filtered = roasteries.filter(
    (r) =>
      !selectedIds.includes(r.id) &&
      (search === '' || r.name.toLowerCase().includes(search.toLowerCase()))
  )

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_ROASTERIES) return prev
      return [...prev, id]
    })
  }

  function removeSelected(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const input = { title, order, isActive, roasteryIds: selectedIds }
      const result = isEdit ? await updateSection(sectionId, input) : await createSection(input)

      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(isEdit ? '섹션이 수정되었습니다.' : '섹션이 생성되었습니다.')
      router.push('/admin/sections')
    })
  }

  const selectedRoasteries = selectedIds
    .map((id) => roasteries.find((r) => r.id === id))
    .filter(Boolean) as RoasteryOption[]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 섹션 제목 */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-text">
          섹션 제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 이번 주 추천 로스터리"
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-sub focus:border-primary focus:outline-none"
          required
        />
      </div>

      {/* 순서 + 활성 */}
      <div className="flex gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-text">노출 순서</label>
          <input
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-24 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex items-end gap-2 pb-0.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            활성화
          </label>
        </div>
      </div>

      {/* 로스터리 선택 — 시스템 섹션은 비노출 */}
      {isSystem ? (
        <p className="rounded-lg bg-bg px-4 py-3 text-sm text-text-sub">
          시스템 섹션은 로스터리를 직접 선택하지 않습니다.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text">
              로스터리 선택{' '}
              <span className="text-text-sub">
                ({selectedIds.length}/{MAX_ROASTERIES})
              </span>
            </label>
          </div>

          {/* 선택된 로스터리 */}
          {selectedRoasteries.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-bg p-3">
              {selectedRoasteries.map((r) => (
                <span
                  key={r.id}
                  className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary"
                >
                  {r.name}
                  <button
                    type="button"
                    onClick={() => removeSelected(r.id)}
                    className="text-primary/60 hover:text-primary"
                    aria-label={`${r.name} 선택 해제`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 검색 + 목록 */}
          {selectedIds.length < MAX_ROASTERIES && (
            <div className="rounded-lg border border-border bg-bg">
              <div className="border-b border-border p-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="로스터리 검색..."
                  className="w-full bg-transparent px-2 py-1 text-sm text-text placeholder:text-text-sub focus:outline-none"
                />
              </div>
              <ul className="max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-text-sub">검색 결과 없음</li>
                ) : (
                  filtered.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => toggleSelect(r.id)}
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-surface"
                      >
                        <span className="text-text">{r.name}</span>
                        {r.primaryRegion && (
                          <span className="text-xs text-text-sub">{r.primaryRegion}</span>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {selectedIds.length >= MAX_ROASTERIES && (
            <p className="text-xs text-text-sub">최대 {MAX_ROASTERIES}개까지 선택할 수 있습니다.</p>
          )}
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? '저장 중...' : isEdit ? '수정' : '생성'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-text-sub hover:text-text"
        >
          취소
        </button>
      </div>
    </form>
  )
}
