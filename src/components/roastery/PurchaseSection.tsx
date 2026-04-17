'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
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
  const [open, setOpen] = useState(false)

  if (channels.length === 0) return null

  const sorted = sortChannels(channels)
  const [primary, ...rest] = sorted

  function handleClick(channelKey: string) {
    logClientEvent({ event: 'purchase_link_clicked', payload: { roasteryId, channelKey } })
  }

  // 채널이 1개면 드롭다운 없이 바로 링크
  if (rest.length === 0) {
    return (
      <a
        href={primary.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleClick(primary.channelKey)}
        className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 transition-colors hover:bg-muted"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{primary.label}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            최저가
          </span>
        </div>
        {primary.price !== null && (
          <span className="text-sm font-medium">{formatPrice(primary.price)}</span>
        )}
      </a>
    )
  }

  return (
    <div className="relative">
      {/* 드롭다운 트리거 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 transition-colors hover:bg-muted"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{primary.label}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            최저가
          </span>
          {primary.price !== null && (
            <span className="text-sm font-medium">{formatPrice(primary.price)}</span>
          )}
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 드롭다운 목록 */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 rounded-xl border border-border bg-surface shadow-md">
          <ul className="flex flex-col p-1">
            {sorted.map((ch, i) => (
              <li key={ch.channelId}>
                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    handleClick(ch.channelKey)
                    setOpen(false)
                  }}
                  className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{ch.label}</span>
                    {i === 0 && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        최저가
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {ch.price !== null ? (
                      <span className={i === 0 ? 'font-medium' : 'text-muted-foreground'}>
                        {formatPrice(ch.price)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">→</span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
