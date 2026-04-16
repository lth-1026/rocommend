'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SortOption } from '@/types/roastery'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: '인기순' },
  { value: 'name', label: '이름순' },
]

interface SortSelectorProps {
  sort: SortOption
}

export function SortSelector({ sort }: SortSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleChange(value: SortOption) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    startTransition(() => {
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <select
      value={sort}
      onChange={(e) => handleChange(e.target.value as SortOption)}
      disabled={isPending}
      aria-label="정렬 기준"
      className="rounded-md border border-border bg-background px-3 py-1.5 text-[16px] leading-snug text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
