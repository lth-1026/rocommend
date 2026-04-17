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
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-2">
      <ul className="flex flex-col gap-1">
        {sorted.map((ch, i) => (
          <li key={ch.channelId}>
            <a
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(ch.channelKey)}
              className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted"
            >
              <span className={`text-sm ${i === 0 ? 'font-medium' : 'text-foreground'}`}>
                {ch.label}
              </span>
              <div className="flex items-center gap-2 text-sm">
                {ch.price !== null && (
                  <span className={i === 0 ? 'font-medium' : 'text-muted-foreground text-xs'}>
                    {formatPrice(ch.price)}
                  </span>
                )}
                <span className="text-muted-foreground text-xs">→</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
