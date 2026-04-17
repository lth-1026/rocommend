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

function BeanCard({ bean, roasteryId }: { bean: BeanWithDetails; roasteryId: string }) {
  const [channelsOpen, setChannelsOpen] = useState(false)

  const sortedChannels = sortChannels(bean.channelPrices)
  const [primary, ...rest] = sortedChannels
  const hasPurchase = sortedChannels.length > 0

  function handlePurchaseClick(channelKey: string) {
    logClientEvent({
      event: 'purchase_link_clicked',
      payload: { roasteryId, channelKey, beanId: bean.id },
    })
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border p-4">
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
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{bean.name}</span>
            {bean.decaf && (
              <Badge variant="secondary" className="text-xs">
                디카페인
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {ROASTING_LEVEL_LABELS[bean.roastingLevel] ?? bean.roastingLevel}
            </span>
            {bean.origins.length > 0 && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="text-xs text-muted-foreground">{bean.origins.join(', ')}</span>
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

      {hasPurchase && (
        <div className="flex flex-col gap-1">
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handlePurchaseClick(primary.channelKey)}
            className="flex items-center justify-between gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-opacity hover:opacity-90 min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{primary.label}</span>
              {primary.price !== null && (
                <span className="text-xs opacity-80">{formatPrice(primary.price)}</span>
              )}
            </div>
            <span className="text-sm font-medium">구매하기 →</span>
          </a>

          {rest.length > 0 && (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setChannelsOpen((v) => !v)}
                className="flex items-center gap-1 px-1 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer"
              >
                <span>{channelsOpen ? '▲' : '▼'}</span>
                <span>다른 채널 {channelsOpen ? '닫기' : '보기'}</span>
              </button>

              {channelsOpen && (
                <ul className="flex flex-col gap-1 pt-1">
                  {rest.map((ch) => (
                    <li key={ch.channelId}>
                      <a
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handlePurchaseClick(ch.channelKey)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <span className="text-foreground">{ch.label}</span>
                        {ch.price !== null ? (
                          <span className="text-muted-foreground text-xs">
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
        </div>
      )}
    </li>
  )
}

export function BeanList({ beans, roasteryId }: BeanListProps) {
  if (beans.length === 0) {
    return <p className="text-sm text-muted-foreground">등록된 원두가 없습니다.</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {beans.map((bean) => (
        <BeanCard key={bean.id} bean={bean} roasteryId={roasteryId} />
      ))}
    </ul>
  )
}
