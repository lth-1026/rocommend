'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ROASTING_LEVEL_LABELS, sortChannels } from '@/types/roastery'
import type { BeanWithDetails } from '@/types/roastery'
import { logClientEvent } from '@/actions/events'
import Image from 'next/image'

interface BeanListProps {
  beans: BeanWithDetails[]
  roasteryId: string
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

export function BeanList({ beans, roasteryId }: BeanListProps) {
  const [openBeanId, setOpenBeanId] = useState<string | null>(null)

  if (beans.length === 0) {
    return <p className="text-sm text-muted-foreground">등록된 원두가 없습니다.</p>
  }

  function handlePurchaseClick(channelKey: string, beanId: string) {
    logClientEvent({
      event: 'purchase_link_clicked',
      payload: { roasteryId, channelKey, beanId },
    })
  }

  return (
    <ul className="flex flex-col gap-4">
      {beans.map((bean) => {
        const isOpen = openBeanId === bean.id
        const sortedChannels = sortChannels(bean.channelPrices)
        const [primary, ...rest] = sortedChannels
        const hasPurchase = sortedChannels.length > 0

        return (
          <li
            key={bean.id}
            onClick={() => hasPurchase && setOpenBeanId(isOpen ? null : bean.id)}
            className={[
              'flex flex-col gap-3 rounded-xl border p-4 transition-colors',
              hasPurchase ? 'cursor-pointer' : '',
              isOpen
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border/70 hover:bg-muted/30',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {/* 카드 정보 (항상 표시) */}
            <div className="flex gap-4">
              {bean.imageUrl && (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={bean.imageUrl}
                    alt={bean.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={bean.imageUrl.startsWith('/')}
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{bean.name}</span>
                    {bean.decaf && (
                      <Badge variant="secondary" className="text-xs">
                        디카페인
                      </Badge>
                    )}
                  </div>
                  {hasPurchase && primary.price !== null && (
                    <span className="text-sm font-medium shrink-0 tabular-nums">
                      {formatPrice(primary.price)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    {ROASTING_LEVEL_LABELS[bean.roastingLevel] ?? bean.roastingLevel}
                  </span>
                  {bean.origins.length > 0 && (
                    <>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="text-xs text-muted-foreground">
                        {bean.origins.join(', ')}
                      </span>
                    </>
                  )}
                </div>
                {bean.cupNotes.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {bean.cupNotes.map((note) => (
                      <Badge key={note} variant="outline" className="text-xs h-4 px-1.5">
                        {note}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 구매 링크 (카드 클릭 시에만 표시) */}
            {isOpen && hasPurchase && (
              <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                <a
                  href={primary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handlePurchaseClick(primary.channelKey, bean.id)}
                  className="flex items-center justify-between gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-opacity hover:opacity-90 min-h-[44px]"
                >
                  <span className="text-sm font-medium">{primary.label}</span>
                  <span className="text-sm font-medium">구매하기 →</span>
                </a>

                {rest.length > 0 && (
                  <ul className="flex flex-col gap-1 pt-1">
                    {rest.map((ch) => (
                      <li key={ch.channelId}>
                        <a
                          href={ch.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handlePurchaseClick(ch.channelKey, bean.id)}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <span className="text-foreground">{ch.label}</span>
                          {ch.price !== null ? (
                            <span className="text-muted-foreground text-xs tabular-nums">
                              {formatPrice(ch.price)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">→</span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
