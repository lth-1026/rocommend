'use client'

import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { PurchaseSection } from './PurchaseSection'
import { BeanList } from './BeanList'
import type { BeanWithDetails, ChannelWithPrice } from '@/types/roastery'

interface RoasteryBuyAndBeansProps {
  roasteryId: string
  baseChannels: ChannelWithPrice[]
  beans: BeanWithDetails[]
}

export function RoasteryBuyAndBeans({ roasteryId, baseChannels, beans }: RoasteryBuyAndBeansProps) {
  const [selectedBeanId, setSelectedBeanId] = useState<string | null>(beans[0]?.id ?? null)

  const selectedBean = beans.find((b) => b.id === selectedBeanId)
  const channels: ChannelWithPrice[] =
    selectedBean && selectedBean.channelPrices.length > 0
      ? selectedBean.channelPrices
      : baseChannels

  const hasPurchase = channels.length > 0

  return (
    <>
      {hasPurchase && <PurchaseSection roasteryId={roasteryId} channels={channels} />}

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">원두 라인업 ({beans.length})</h2>
        <BeanList
          beans={beans}
          selectedBeanId={hasPurchase ? selectedBeanId : undefined}
          onBeanSelect={hasPurchase ? setSelectedBeanId : undefined}
        />
      </section>
    </>
  )
}
