'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DecafToggle } from './DecafToggle'
import { RecommendSection } from './RecommendSection'
import { PopularSection } from './PopularSection'
import { LoginCTASection } from './LoginCTASection'
import { logClientEvent } from '@/actions/events'
import type { RecommendationResult, RecommendationItem } from '@/lib/recommender'
import type { FeaturedSectionData } from '@/lib/queries/recommendation'
import type { RoasteryWithStats } from '@/types/roastery'

interface HomeFeedClientProps {
  result: RecommendationResult
  sections: FeaturedSectionData[]
  popularItems: RoasteryWithStats[]
  isLoggedIn: boolean
}

export function HomeFeedClient({
  result,
  sections,
  popularItems,
  isLoggedIn,
}: HomeFeedClientProps) {
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

  const cfNewItems: RecommendationItem[] =
    result.source === 'cf'
      ? decafOn
        ? result.newItems.filter((i) => i.roastery.decaf)
        : result.newItems
      : []

  const cfRepeatItems: RecommendationItem[] =
    result.source === 'cf'
      ? decafOn
        ? result.repeatItems.filter((i) => i.roastery.decaf)
        : result.repeatItems
      : []

  const hasCFSections = sections.some((s) => s.type === 'CF_NEW' || s.type === 'CF_REPEAT')
  const showDecafToggle = hasCFSections && result.source === 'cf' && isLoggedIn

  return (
    <div className="flex flex-col divide-y divide-border">
      {showDecafToggle && (
        <div className="page-wrapper flex items-center pb-4">
          <DecafToggle decafOn={decafOn} onToggle={() => setDecafOn((v) => !v)} />
        </div>
      )}

      {sections.map((section) => {
        switch (section.type) {
          case 'CF_NEW':
            if (!isLoggedIn) return <LoginCTASection key={section.id} title={section.title} />
            if (result.source === 'fallback') return null
            return (
              <RecommendSection
                key={section.id}
                title={section.title}
                items={cfNewItems}
                onCardClick={handleCardClick}
              />
            )

          case 'CF_REPEAT':
            if (!isLoggedIn) return <LoginCTASection key={section.id} title={section.title} />
            if (result.source === 'fallback') return null
            return (
              <RecommendSection
                key={section.id}
                title={section.title}
                items={cfRepeatItems}
                onCardClick={handleCardClick}
              />
            )

          case 'POPULAR':
            return (
              <PopularSection
                key={section.id}
                title={section.title}
                items={popularItems}
                onCardClick={handleCardClick}
              />
            )

          case 'CUSTOM':
            return (
              <PopularSection
                key={section.id}
                title={section.title}
                items={section.roasteries}
                onCardClick={handleCardClick}
              />
            )
        }
      })}
    </div>
  )
}
