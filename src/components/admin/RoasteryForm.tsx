'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createRoastery } from '@/actions/admin'
import { TagInput } from './TagInput'
import { ImageUpload } from './ImageUpload'
import type { PriceRange } from '@prisma/client'

export function RoasteryForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [regions, setRegions] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<PriceRange>('MID')
  const [decaf, setDecaf] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [website, setWebsite] = useState('')
  const [isOnboardingCandidate, setIsOnboardingCandidate] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await createRoastery({
        name,
        description,
        regions,
        priceRange,
        decaf,
        imageUrl,
        website,
        isOnboardingCandidate,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      router.push('/admin/roasteries')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>
      )}

      {/* 이름 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">
          로스터리 이름 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="예: 모모스커피"
        />
      </div>

      {/* 설명 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          placeholder="로스터리 소개를 입력하세요"
        />
      </div>

      {/* 지역 (태그) */}
      <TagInput
        label="지역"
        tags={regions}
        onChange={setRegions}
        placeholder="예: 서울 (첫 번째 = 대표 지역)"
        required
      />

      {/* 가격대 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">
          가격대 <span className="text-error">*</span>
        </label>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value as PriceRange)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="LOW">LOW — 200g 2만원 미만</option>
          <option value="MID">MID — 200g 2~3.5만원</option>
          <option value="HIGH">HIGH — 200g 3.5만원 초과</option>
        </select>
      </div>

      {/* 이미지 업로드 */}
      <ImageUpload
        folder="roasteries"
        value={imageUrl}
        onChange={setImageUrl}
        onError={(msg) => { if (msg) setError(msg) }}
      />

      {/* 웹사이트 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">웹사이트</label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="https://..."
        />
      </div>

      {/* 체크박스 옵션 */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={decaf}
            onChange={(e) => setDecaf(e.target.checked)}
            className="h-4 w-4 rounded accent-primary"
          />
          <span className="text-sm text-text">디카페인 원두 취급</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isOnboardingCandidate}
            onChange={(e) => setIsOnboardingCandidate(e.target.checked)}
            className="h-4 w-4 rounded accent-primary"
          />
          <span className="text-sm text-text">온보딩 Q5 목록에 노출</span>
        </label>
      </div>

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
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? '저장 중...' : '로스터리 등록'}
        </button>
      </div>
    </form>
  )
}
