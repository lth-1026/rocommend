'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { DecafToggle } from './DecafToggle'
import { RecommendSection } from './RecommendSection'
import { PopularSection } from './PopularSection'
import { LoginCTASection } from './LoginCTASection'
import { logClientEvent } from '@/actions/events'
import type { RecommendationResult, RecommendationItem } from '@/lib/recommender'
import type { FeaturedSectionData } from '@/lib/queries/recommendation'
import type { RoasteryWithStats } from '@/types/roastery'
import { fadeUpVariants } from '@/lib/motion'

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
    <div className="flex flex-col gap-8">
      {showDecafToggle && (
        <div className="page-wrapper flex items-center">
          <DecafToggle decafOn={decafOn} onToggle={() => setDecafOn((v) => !v)} />
        </div>
      )}

      {sections.map((section) => {
        let content: React.ReactNode = null

        switch (section.type) {
          case 'CF_NEW':
            if (!isLoggedIn) content = <LoginCTASection title={section.title} />
            else if (result.source === 'fallback') return null
            else
              content = (
                <RecommendSection
                  title={section.title}
                  items={cfNewItems}
                  onCardClick={handleCardClick}
                />
              )
            break

          case 'CF_REPEAT':
            if (!isLoggedIn) content = <LoginCTASection title={section.title} />
            else if (result.source === 'fallback') return null
            else
              content = (
                <RecommendSection
                  title={section.title}
                  items={cfRepeatItems}
                  onCardClick={handleCardClick}
                />
              )
            break

          case 'POPULAR':
            content = (
              <PopularSection
                title={section.title}
                items={popularItems}
                onCardClick={handleCardClick}
              />
            )
            break

          case 'CUSTOM':
            content = (
              <PopularSection
                title={section.title}
                items={section.roasteries}
                onCardClick={handleCardClick}
              />
            )
            break
        }

        if (!content) return null

        return (
          <motion.div
            key={section.id}
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {content}
          </motion.div>
        )
      })}
    </div>
  )
}
