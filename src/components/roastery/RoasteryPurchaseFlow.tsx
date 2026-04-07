'use client'

import { useState } from 'react'
import { PurchaseSection } from './PurchaseSection'
import { BeanTabs } from './BeanTabs'
import type { ChannelWithPrice } from '@/types/roastery'

interface BeanForPurchase {
  id: string
  name: string
  channelPrices: ChannelWithPrice[]
}

interface RoasteryPurchaseFlowProps {
  roasteryId: string
  /** 로스터리 기본 채널 (가격 없이 URL만) */
  baseChannels: ChannelWithPrice[]
  beans: BeanForPurchase[]
}

export function RoasteryPurchaseFlow({
  roasteryId,
  baseChannels,
  beans,
}: RoasteryPurchaseFlowProps) {
  const [selectedBeanId, setSelectedBeanId] = useState<string | null>(beans[0]?.id ?? null)

  if (baseChannels.length === 0) return null

  // 선택된 원두의 채널 가격, 없으면 기본 채널 사용
  const selectedBean = beans.find((b) => b.id === selectedBeanId)
  const channels: ChannelWithPrice[] =
    selectedBean && selectedBean.channelPrices.length > 0
      ? selectedBean.channelPrices
      : baseChannels

  return (
    <div className="flex flex-col gap-3">
      {/* 원두 탭 (복수일 때만 표시) */}
      {beans.length > 1 && (
        <BeanTabs beans={beans} selectedBeanId={selectedBeanId} onSelect={setSelectedBeanId} />
      )}

      {/* 채널별 가격 + 구매 버튼 */}
      <PurchaseSection roasteryId={roasteryId} channels={channels} />
    </div>
  )
}
