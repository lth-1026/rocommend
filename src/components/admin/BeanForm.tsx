'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBean, updateBean } from '@/actions/admin'
import { TagInput } from './TagInput'
import { ImageUpload } from './ImageUpload'

interface Roastery {
  id: string
  name: string
}

interface BeanFormProps {
  roasteries: Roastery[]
  beanId?: string
  fixedRoasteryId?: string
  redirectTo?: string
  initialData?: {
    roasteryId: string
    name: string
    origins: string[]
    roastingLevel: string
    decaf: boolean
    cupNotes: string[]
    imageUrl: string
  }
}

const ROASTING_LEVELS = [
  { value: 'LIGHT', label: '라이트' },
  { value: 'MEDIUM', label: '미디엄' },
  { value: 'MEDIUM_DARK', label: '미디엄 다크' },
  { value: 'DARK', label: '다크' },
]

export function BeanForm({
  roasteries,
  beanId,
  fixedRoasteryId,
  redirectTo,
  initialData,
}: BeanFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [roasteryId, setRoasteryId] = useState(
    fixedRoasteryId ?? initialData?.roasteryId ?? roasteries[0]?.id ?? ''
  )
  const [name, setName] = useState(initialData?.name ?? '')
  const [origins, setOrigins] = useState<string[]>(initialData?.origins ?? [])
  const [roastingLevel, setRoastingLevel] = useState(initialData?.roastingLevel ?? 'MEDIUM')
  const [decaf, setDecaf] = useState(initialData?.decaf ?? false)
  const [cupNotes, setCupNotes] = useState<string[]>(initialData?.cupNotes ?? [])
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')

  const isEdit = !!beanId

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const input = { roasteryId, name, origins, roastingLevel, decaf, cupNotes, imageUrl }

    startTransition(async () => {
      const result = isEdit ? await updateBean(beanId, input) : await createBean(input)

      if (!result.success) {
        setError(result.error)
        return
      }

      router.push(redirectTo ?? '/admin/beans')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}

      {/* 로스터리 선택 (fixedRoasteryId가 없을 때만 표시) */}
      {!fixedRoasteryId && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text">
            로스터리 <span className="text-error">*</span>
          </label>
          {roasteries.length === 0 ? (
            <p className="text-sm text-error">먼저 로스터리를 등록해주세요.</p>
          ) : (
            <select
              value={roasteryId}
              onChange={(e) => setRoasteryId(e.target.value)}
              required
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
            >
              {roasteries.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* 원두 이름 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">
          원두 이름 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="예: 에티오피아 예가체프"
        />
      </div>

      {/* 원산지 (태그) */}
      <TagInput label="원산지" tags={origins} onChange={setOrigins} placeholder="예: 에티오피아" />

      {/* 로스팅 레벨 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">
          로스팅 레벨 <span className="text-error">*</span>
        </label>
        <select
          value={roastingLevel}
          onChange={(e) => setRoastingLevel(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
        >
          {ROASTING_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* 컵 노트 (태그) */}
      <TagInput
        label="컵 노트"
        tags={cupNotes}
        onChange={setCupNotes}
        placeholder="예: 자몽, 카카오, 흑설탕"
      />

      {/* 이미지 업로드 */}
      <ImageUpload
        folder="beans"
        value={imageUrl}
        onChange={setImageUrl}
        onError={(msg) => {
          if (msg) setError(msg)
        }}
      />

      {/* 디카페인 */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={decaf}
          onChange={(e) => setDecaf(e.target.checked)}
          className="h-4 w-4 rounded accent-primary"
        />
        <span className="text-sm text-text">디카페인</span>
      </label>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text hover:bg-surface-sub transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending || (!fixedRoasteryId && roasteries.length === 0)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? '저장 중...' : isEdit ? '변경사항 저장' : '원두 등록'}
        </button>
      </div>
    </form>
  )
}
