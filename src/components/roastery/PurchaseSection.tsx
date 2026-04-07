'use client'

import { useState } from 'react'
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

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      {/* 메인 CTA — 최저가 채널 */}
      <a
        href={primary.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleClick(primary.channelKey)}
        className="flex items-center justify-between gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-opacity hover:opacity-90"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{primary.label}</span>
          {primary.price !== null && (
            <span className="text-xs opacity-80">{formatPrice(primary.price)}</span>
          )}
        </div>
        <span className="text-sm font-medium">구매하기 →</span>
      </a>

      {/* 다른 채널 토글 */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 px-1 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <span>{open ? '▲' : '▼'}</span>
            <span>다른 채널 {open ? '닫기' : '보기'}</span>
          </button>

          {open && (
            <ul className="flex flex-col gap-1 pt-1">
              {rest.map((ch) => (
                <li key={ch.channelId}>
                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClick(ch.channelKey)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <span className="text-foreground">{ch.label}</span>
                    {ch.price !== null ? (
                      <span className="text-muted-foreground text-xs">{formatPrice(ch.price)}</span>
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
  )
}
