'use client'

import { logClientEvent } from '@/actions/events'
import type { ChannelWithPrice } from '@/types/roastery'
import { sortChannels } from '@/types/roastery'

interface PurchaseSectionProps {
  roasteryId: string
  channels: ChannelWithPrice[]
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

export function PurchaseSection({ roasteryId, channels }: PurchaseSectionProps) {
  if (channels.length === 0) return null

  const sorted = sortChannels(channels)

  function handleClick(channelKey: string) {
    logClientEvent({ event: 'purchase_link_clicked', payload: { roasteryId, channelKey } })
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden">
      <ul className="flex flex-col">
        {sorted.map((ch, i) => (
          <li key={ch.channelId} className={i > 0 ? 'border-t border-border' : ''}>
            <a
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(ch.channelKey)}
              className="flex min-h-[44px] cursor-pointer items-center justify-between px-4 py-2 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{ch.label}</span>
                {i === 0 && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    최저가
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {ch.price !== null ? formatPrice(ch.price) : '→'}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
