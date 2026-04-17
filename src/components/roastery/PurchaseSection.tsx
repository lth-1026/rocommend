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
    <div className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden">
      {/* 트리거: 왼쪽은 primary 링크, 오른쪽은 토글 */}
      <div className="flex min-h-[44px] items-stretch">
        <a
          href={primary.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick(primary.channelKey)}
          className="flex flex-1 items-center gap-2 px-4 transition-colors hover:bg-muted"
        >
          <span className="text-sm font-medium">{primary.label}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            최저가
          </span>
          {primary.price !== null && (
            <span className="text-sm font-medium">{formatPrice(primary.price)}</span>
          )}
        </a>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-center border-l border-border px-3 transition-colors hover:bg-muted"
          aria-label={open ? '채널 목록 닫기' : '다른 채널 보기'}
        >
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* 확장 목록: primary 제외한 나머지만 */}
      {open && (
        <ul className="flex flex-col border-t border-border px-1 pb-1">
          {rest.map((ch) => (
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
                <span className="text-sm">{ch.label}</span>
                <span className="text-muted-foreground text-sm">
                  {ch.price !== null ? formatPrice(ch.price) : '→'}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
