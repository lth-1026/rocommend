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
  return (
    <>
      {baseChannels.length > 0 && (
        <PurchaseSection roasteryId={roasteryId} channels={baseChannels} />
      )}

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">원두 라인업 ({beans.length})</h2>
        <BeanList beans={beans} roasteryId={roasteryId} />
      </section>
    </>
  )
}
