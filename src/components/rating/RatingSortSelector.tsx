'use client'

import type { RatingSortOption } from '@/types/rating'

const OPTIONS: { value: RatingSortOption; label: string }[] = [
  { value: 'SIMILAR', label: '유사한 사람 순' },
  { value: 'HIGH', label: '높은 순' },
  { value: 'LOW', label: '낮은 순' },
]

interface RatingSortSelectorProps {
  value: RatingSortOption
  onChange: (v: RatingSortOption) => void
}

export function RatingSortSelector({ value, onChange }: RatingSortSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            value === opt.value
              ? 'border-[var(--color-action)] bg-[var(--color-action)] text-[var(--color-action-text)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
