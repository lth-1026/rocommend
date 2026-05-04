'use client'

import { Search } from 'lucide-react'
import { SortDropdown } from './sort-dropdown'

interface ListToolbarProps<T extends string> {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  sortValue: T
  sortOptions: { value: T; label: string }[]
  onSortChange: (value: T) => void
}

export function ListToolbar<T extends string>({
  searchValue,
  onSearchChange,
  searchPlaceholder = '검색',
  sortValue,
  sortOptions,
  onSortChange,
}: ListToolbarProps<T>) {
  return (
    <div className="flex items-center gap-2 py-3 border-b border-[var(--color-border)]">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <SortDropdown value={sortValue} options={sortOptions} onChange={onSortChange} />
    </div>
  )
}
