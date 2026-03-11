'use client'

import { useTransition, useId } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { PRICE_RANGE_LABELS, REGIONS } from '@/types/roastery'
import type { FilterParams, PriceRange } from '@/types/roastery'

interface FilterPanelProps {
  filter: FilterParams
}

const PRICE_OPTIONS: PriceRange[] = ['LOW', 'MID', 'HIGH']

export function FilterPanel({ filter }: FilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const searchId = useId()

  function buildParams(updates: Partial<FilterParams>): string {
    const params = new URLSearchParams(searchParams.toString())

    const next = { ...filter, ...updates }

    if (next.q) params.set('q', next.q)
    else params.delete('q')

    params.delete('price')
    next.price.forEach((p) => params.append('price', p))

    if (next.decaf) params.set('decaf', '1')
    else params.delete('decaf')

    params.delete('region')
    next.regions.forEach((r) => params.append('region', r))

    return params.toString()
  }

  function navigate(updates: Partial<FilterParams>) {
    startTransition(() => {
      router.replace(`${pathname}?${buildParams(updates)}`)
    })
  }

  function togglePrice(price: PriceRange) {
    const next = filter.price.includes(price)
      ? filter.price.filter((p) => p !== price)
      : [...filter.price, price]
    navigate({ price: next })
  }

  function toggleRegion(region: string) {
    const next = filter.regions.includes(region)
      ? filter.regions.filter((r) => r !== region)
      : [...filter.regions, region]
    navigate({ regions: next })
  }

  function reset() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('price')
    params.delete('decaf')
    params.delete('region')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const isFiltered =
    filter.q || filter.price.length > 0 || filter.decaf || filter.regions.length > 0

  return (
    <div className={isPending ? 'opacity-60 pointer-events-none' : ''}>
      {/* 검색 input — 모바일/데스크탑 공통 */}
      <div className="flex items-center gap-2">
        <input
          id={searchId}
          type="search"
          placeholder="로스터리 이름 검색..."
          defaultValue={filter.q}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate({ q: (e.target as HTMLInputElement).value.trim() })
          }}
          onBlur={(e) => {
            const val = e.target.value.trim()
            if (val !== filter.q) navigate({ q: val })
          }}
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="로스터리 이름 검색"
        />

        {/* 모바일: Sheet 버튼 */}
        <Sheet>
          <SheetTrigger className="lg:hidden inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent/10 transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            필터
            {isFiltered && (
              <span className="ml-1 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>필터</SheetTitle>
            </SheetHeader>
            <FilterGroups
              filter={filter}
              onTogglePrice={togglePrice}
              onToggleDecaf={() => navigate({ decaf: !filter.decaf })}
              onToggleRegion={toggleRegion}
              onReset={reset}
              isFiltered={!!isFiltered}
            />
          </SheetContent>
        </Sheet>

        {/* 데스크탑: 초기화 버튼 */}
        {isFiltered && (
          <button
            onClick={reset}
            className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화
          </button>
        )}
      </div>

      {/* 데스크탑: inline 필터 그룹 */}
      <div className="hidden lg:flex flex-wrap items-start gap-6 pt-4">
        <PriceGroup selected={filter.price} onToggle={togglePrice} />
        <DecafGroup checked={filter.decaf} onToggle={() => navigate({ decaf: !filter.decaf })} />
        <RegionGroup selected={filter.regions} onToggle={toggleRegion} />
      </div>
    </div>
  )
}

// ── 재사용 필터 그룹 ──────────────────────────────────────────

function PriceGroup({
  selected,
  onToggle,
}: {
  selected: PriceRange[]
  onToggle: (p: PriceRange) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">가격대</legend>
      <div className="flex flex-wrap gap-3">
        {PRICE_OPTIONS.map((p) => (
          <div key={p} className="flex items-center gap-1.5">
            <Checkbox
              id={`price-${p}`}
              checked={selected.includes(p)}
              onCheckedChange={() => onToggle(p)}
            />
            <Label htmlFor={`price-${p}`} className="text-sm cursor-pointer">
              {PRICE_RANGE_LABELS[p]}
            </Label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

function DecafGroup({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">디카페인</legend>
      <div className="flex items-center gap-1.5">
        <Checkbox id="decaf" checked={checked} onCheckedChange={onToggle} />
        <Label htmlFor="decaf" className="text-sm cursor-pointer">
          디카페인 가능
        </Label>
      </div>
    </fieldset>
  )
}

function RegionGroup({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (r: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">지역</legend>
      <div className="flex flex-wrap gap-3">
        {REGIONS.map((r) => (
          <div key={r} className="flex items-center gap-1.5">
            <Checkbox
              id={`region-${r}`}
              checked={selected.includes(r)}
              onCheckedChange={() => onToggle(r)}
            />
            <Label htmlFor={`region-${r}`} className="text-sm cursor-pointer">
              {r}
            </Label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

function FilterGroups({
  filter,
  onTogglePrice,
  onToggleDecaf,
  onToggleRegion,
  onReset,
  isFiltered,
}: {
  filter: FilterParams
  onTogglePrice: (p: PriceRange) => void
  onToggleDecaf: () => void
  onToggleRegion: (r: string) => void
  onReset: () => void
  isFiltered: boolean
}) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <PriceGroup selected={filter.price} onToggle={onTogglePrice} />
      <DecafGroup checked={filter.decaf} onToggle={onToggleDecaf} />
      <RegionGroup selected={filter.regions} onToggle={onToggleRegion} />
      {isFiltered && (
        <button
          onClick={onReset}
          className="self-start inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent/10 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          필터 초기화
        </button>
      )}
    </div>
  )
}
