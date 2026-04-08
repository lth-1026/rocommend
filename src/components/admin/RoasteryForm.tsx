'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createRoastery, updateRoastery } from '@/actions/admin'
import type { ChannelInput } from '@/actions/admin'
import { TagInput } from './TagInput'
import { ImageUpload } from './ImageUpload'
import type { PriceRange } from '@prisma/client'
import type { TagItem } from '@/types/roastery'
import {
  getRegions,
  getCharacteristicTags,
  CHARACTERISTIC_TAGS,
  CHANNEL_DEFS,
} from '@/types/roastery'

interface RoasteryFormProps {
  roasteryId?: string
  initialData?: {
    name: string
    description: string
    address: string
    tags: TagItem[]
    priceRange: PriceRange
    decaf: boolean
    imageUrl: string
    isOnboardingCandidate: boolean
    channels: { id: string; channelKey: string; url: string }[]
  }
}

export function RoasteryForm({ roasteryId, initialData }: RoasteryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [address, setAddress] = useState(initialData?.address ?? '')
  const [regions, setRegions] = useState<string[]>(initialData ? getRegions(initialData.tags) : [])
  const [characteristicTags, setCharacteristicTags] = useState<string[]>(
    initialData ? getCharacteristicTags(initialData.tags) : []
  )
  const [priceRange, setPriceRange] = useState<PriceRange>(initialData?.priceRange ?? 'MID')
  const [decaf, setDecaf] = useState(initialData?.decaf ?? false)
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')
  const [isOnboardingCandidate, setIsOnboardingCandidate] = useState(
    initialData?.isOnboardingCandidate ?? false
  )
  const [channels, setChannels] = useState<ChannelInput[]>(
    initialData?.channels.map((c) => ({ channelKey: c.channelKey, url: c.url })) ?? []
  )

  const isEdit = !!roasteryId

  function addChannel() {
    setChannels((prev) => [...prev, { channelKey: 'naver', url: '' }])
  }

  function removeChannel(index: number) {
    setChannels((prev) => prev.filter((_, i) => i !== index))
  }

  function updateChannel(index: number, field: keyof ChannelInput, value: string) {
    setChannels((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const input = {
      name,
      description,
      address,
      regions,
      tags: characteristicTags,
      priceRange,
      decaf,
      imageUrl,
      channels,
      isOnboardingCandidate,
    }

    startTransition(async () => {
      const result = isEdit ? await updateRoastery(roasteryId, input) : await createRoastery(input)

      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      toast.success(isEdit ? '로스터리가 수정되었습니다.' : '로스터리가 등록되었습니다.')
      router.push('/admin/roasteries')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}

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

      {/* 주소 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">주소</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="예: 마포구 도화동 179-9"
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

      {/* 특성 태그 */}
      <TagInput
        label="특성 태그"
        tags={characteristicTags}
        onChange={setCharacteristicTags}
        placeholder="예: 싱글오리진 (Tab으로 추가)"
        suggestions={CHARACTERISTIC_TAGS as unknown as string[]}
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
        onError={(msg) => {
          if (msg) setError(msg)
        }}
      />

      {/* 구매 채널 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text">구매 채널</label>
        {channels.length > 0 && (
          <ul className="flex flex-col gap-2">
            {channels.map((ch, i) => (
              <li key={i} className="flex items-center gap-2">
                <select
                  value={ch.channelKey}
                  onChange={(e) => updateChannel(i, 'channelKey', e.target.value)}
                  className="w-36 shrink-0 rounded-lg border border-border bg-surface px-2 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {CHANNEL_DEFS.map((def) => (
                    <option key={def.key} value={def.key}>
                      {def.label}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  value={ch.url}
                  onChange={(e) => updateChannel(i, 'url', e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => removeChannel(i)}
                  className="shrink-0 rounded-lg border border-border px-2 py-2 text-sm text-muted-foreground hover:bg-surface-sub hover:text-error transition-colors"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={addChannel}
          className="w-fit rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-surface-sub transition-colors"
        >
          + 채널 추가
        </button>
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
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? '저장 중...' : isEdit ? '변경사항 저장' : '로스터리 등록'}
        </button>
      </div>
    </form>
  )
}
