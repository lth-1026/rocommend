'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createBean, updateBean } from '@/actions/admin'
import { TagInput } from './TagInput'
import { ImageUpload } from './ImageUpload'
import { CHANNEL_DEFS } from '@/types/roastery'

interface Roastery {
  id: string
  name: string
}

interface ChannelInfo {
  id: string
  channelKey: string
}

interface BeanFormProps {
  roasteries: Roastery[]
  beanId?: string
  fixedRoasteryId?: string
  redirectTo?: string
  channels?: ChannelInfo[]
  initialData?: {
    roasteryId: string
    name: string
    origins: string[]
    roastingLevel: string
    decaf: boolean
    cupNotes: string[]
    imageUrl: string
    prices?: {
      channelId: string
      price: number
      sizeGrams?: number | null
      sourceUrl?: string | null
    }[]
  }
}

const ROASTING_LEVELS = [
  { value: 'LIGHT', label: '라이트' },
  { value: 'MEDIUM_LIGHT', label: '미디엄 라이트' },
  { value: 'MEDIUM', label: '미디엄' },
  { value: 'MEDIUM_DARK', label: '미디엄 다크' },
  { value: 'DARK', label: '다크' },
]

export function BeanForm({
  roasteries,
  beanId,
  fixedRoasteryId,
  redirectTo,
  channels = [],
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

  // 채널별 가격: channelId → price string (빈 문자열 = 미입력)
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const ch of channels) {
      const existing = initialData?.prices?.find((p) => p.channelId === ch.id)
      map[ch.id] = existing ? String(existing.price) : ''
    }
    return map
  })

  // 채널별 그람 수: channelId → sizeGrams string
  const [sizeGrams, setSizeGrams] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const ch of channels) {
      const existing = initialData?.prices?.find((p) => p.channelId === ch.id)
      map[ch.id] = existing?.sizeGrams != null ? String(existing.sizeGrams) : ''
    }
    return map
  })

  // 채널별 구매 링크: channelId → sourceUrl string
  const [sourceUrls, setSourceUrls] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const ch of channels) {
      const existing = initialData?.prices?.find((p) => p.channelId === ch.id)
      map[ch.id] = existing?.sourceUrl ?? ''
    }
    return map
  })

  const isEdit = !!beanId

  function handlePriceChange(channelId: string, value: string) {
    setPrices((prev) => ({ ...prev, [channelId]: value }))
  }

  function handleSizeGramsChange(channelId: string, value: string) {
    setSizeGrams((prev) => ({ ...prev, [channelId]: value }))
  }

  function handleSourceUrlChange(channelId: string, value: string) {
    setSourceUrls((prev) => ({ ...prev, [channelId]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const priceList = channels.map((ch) => ({
      channelId: ch.id,
      price: prices[ch.id] !== '' ? Number(prices[ch.id]) : null,
      sizeGrams: sizeGrams[ch.id] !== '' ? Number(sizeGrams[ch.id]) : null,
      sourceUrl: sourceUrls[ch.id]?.trim() || null,
    }))

    const input = {
      roasteryId,
      name,
      origins,
      roastingLevel,
      decaf,
      cupNotes,
      imageUrl,
      prices: priceList,
    }

    startTransition(async () => {
      const result = isEdit ? await updateBean(beanId, input) : await createBean(input)

      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      toast.success(isEdit ? '원두가 수정되었습니다.' : '원두가 등록되었습니다.')
      router.push(redirectTo ?? '/admin/beans')
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

      {/* 채널별 가격 */}
      {channels.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-text">채널별 가격 및 구매 링크</label>
          <ul className="flex flex-col gap-4">
            {channels.map((ch) => {
              const def = CHANNEL_DEFS.find((d) => d.key === ch.channelKey)
              const label = def?.label ?? ch.channelKey
              return (
                <li key={ch.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                  <span className="text-sm font-medium text-text">{label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={prices[ch.id] ?? ''}
                      onChange={(e) => handlePriceChange(ch.id, e.target.value)}
                      className="w-32 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="가격 (원)"
                    />
                    <span className="text-sm text-text-sub">/</span>
                    <input
                      type="number"
                      min={1}
                      value={sizeGrams[ch.id] ?? ''}
                      onChange={(e) => handleSizeGramsChange(ch.id, e.target.value)}
                      className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="그람 (g)"
                    />
                    <span className="text-sm text-text-sub">g</span>
                  </div>
                  <input
                    type="url"
                    value={sourceUrls[ch.id] ?? ''}
                    onChange={(e) => handleSourceUrlChange(ch.id, e.target.value)}
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="원두 직접 구매 링크 (선택)"
                  />
                </li>
              )
            })}
          </ul>
        </div>
      )}

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
