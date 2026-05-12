'use client'

import { useState } from 'react'

interface StarSelectorProps {
  value: number
  onChange: (score: number) => void
}

const LABELS: Record<number, string> = {
  1: '별로예요',
  2: '그저 그래요',
  3: '괜찮아요',
  4: '좋아요',
  5: '최고예요',
}

export function StarSelector({ value, onChange }: StarSelectorProps) {
  const [hovered, setHovered] = useState(0)

  const active = hovered || value

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`${star}점`}
            className="text-3xl leading-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            <span
              className={star <= active ? 'text-accent' : 'text-muted'}
              style={{ display: 'inline-block' }}
            >
              ★
            </span>
          </button>
        ))}
      </div>

      <div className="h-5 flex items-center">
        <span className="text-sm text-muted-foreground">
          {active > 0 ? LABELS[active] : '별점을 선택하세요'}
        </span>
      </div>
    </div>
  )
}
