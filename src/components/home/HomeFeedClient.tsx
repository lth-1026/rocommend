'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DecafToggle } from './DecafToggle'
import { RecommendSection } from './RecommendSection'
import { PopularSection } from './PopularSection'
import { logClientEvent } from '@/actions/events'
import type { RecommendationResult } from '@/lib/recommender'

interface HomeFeedClientProps {
  result: RecommendationResult
}

export function HomeFeedClient({ result }: HomeFeedClientProps) {
  const [decafOn, setDecafOn] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleCardClick = (roasteryId: string) => {
    startTransition(async () => {
      await logClientEvent({
        event: 'recommendation_clicked',
        payload: {
          roasteryId,
          recommendationSource: result.source === 'cf' ? 'cf' : 'fallback_global',
        },
      })
    })
    router.push(`/roasteries/${roasteryId}`)
  }

  // 폴백 (인기 로스터리)
  if (result.source === 'fallback') {
    return (
      <div className="flex flex-col gap-8">
        <PopularSection
          items={result.newItems.map((i) => i.roastery)}
          onCardClick={handleCardClick}
        />
      </div>
    )
  }

  // CF 활성 — 디카페인 필터 적용
  const filteredNew = decafOn ? result.newItems.filter((i) => i.roastery.decaf) : result.newItems
  const filteredRepeat = decafOn
    ? result.repeatItems.filter((i) => i.roastery.decaf)
    : result.repeatItems

  const showDecafToggle = result.newItems.length > 0 || result.repeatItems.length > 0
  const bothEmpty = filteredNew.length === 0 && filteredRepeat.length === 0

  return (
    <div className="flex flex-col gap-6">
      {showDecafToggle && (
        <div className="page-wrapper flex items-center">
          <DecafToggle decafOn={decafOn} onToggle={() => setDecafOn((v) => !v)} />
        </div>
      )}

      {bothEmpty && decafOn ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          현재 디카페인 원두를 보유한 추천 로스터리가 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          <RecommendSection
            title="새로운 로스터리"
            items={filteredNew}
            onCardClick={handleCardClick}
          />
          <RecommendSection
            title="또 사고 싶은 로스터리"
            items={filteredRepeat}
            onCardClick={handleCardClick}
          />
        </div>
      )}
    </div>
  )
}
