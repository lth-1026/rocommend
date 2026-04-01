'use client'

import { useTransition, useId, useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { PRICE_RANGE_LABELS, PRICE_OPTIONS, REGIONS, CHARACTERISTIC_TAGS } from '@/types/roastery'
import type { FilterParams, PriceRange, SortOption } from '@/types/roastery'
import { SortSelector } from './SortSelector'

interface FilterPanelProps {
  filter: FilterParams
  sort: SortOption
  isLoggedIn: boolean
}

type PillId = 'price' | 'region' | 'tag'

export function FilterPanel({ filter, sort, isLoggedIn }: FilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [openPill, setOpenPill] = useState<PillId | null>(null)
  const [inputValue, setInputValue] = useState(filter.q)
  const searchId = useId()

  useEffect(() => {
    setInputValue(filter.q)
  }, [filter.q])

  useEffect(() => {
    if (inputValue.trim() === filter.q) return
    const t = setTimeout(() => navigate({ q: inputValue.trim() }), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue])

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

    params.delete('tag')
    next.tags.forEach((t) => params.append('tag', t))

    if (next.rated) params.set('rated', '1')
    else params.delete('rated')

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

  function toggleTag(tag: string) {
    const next = filter.tags.includes(tag)
      ? filter.tags.filter((t) => t !== tag)
      : [...filter.tags, tag]
    navigate({ tags: next })
  }

  function reset() {
    navigate({ q: '', price: [], decaf: false, regions: [], tags: [], rated: false })
  }

  const isFiltered =
    filter.q ||
    filter.price.length > 0 ||
    filter.decaf ||
    filter.regions.length > 0 ||
    filter.tags.length > 0 ||
    filter.rated

  return (
    <div className={isPending ? 'opacity-60 pointer-events-none' : ''}>
      {/* 모바일 */}
      <div className="flex items-center gap-2 lg:hidden" role="toolbar">
        <input
          id={searchId}
          type="search"
          placeholder="로스터리 이름 검색..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate({ q: inputValue.trim() })
          }}
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="로스터리 이름 검색"
        />
        <Sheet>
          <SheetTrigger className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent/10 transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            필터
            {isFiltered && <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />}
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>필터</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6 px-4 pb-6">
              <PriceGroup selected={filter.price} onToggle={togglePrice} />
              <DecafGroup
                checked={filter.decaf}
                onToggle={() => navigate({ decaf: !filter.decaf })}
              />
              <RegionGroup selected={filter.regions} onToggle={toggleRegion} />
              <TagGroup selected={filter.tags} onToggle={toggleTag} />
              {isLoggedIn && (
                <RatedGroup
                  checked={filter.rated}
                  onToggle={() => navigate({ rated: !filter.rated })}
                />
              )}
              {isFiltered && (
                <button
                  onClick={reset}
                  className="self-start inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent/10 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  필터 초기화
                </button>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <SortSelector sort={sort} />
      </div>

      {/* 데스크탑 — pill 필터 toolbar */}
      <div className="hidden lg:flex items-center gap-2 flex-wrap">
        <input
          type="search"
          placeholder="로스터리 이름 검색..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate({ q: inputValue.trim() })
          }}
          className="w-56 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="로스터리 이름 검색"
        />

        <FilterPill
          id="price"
          label="가격대"
          count={filter.price.length}
          open={openPill === 'price'}
          onToggle={() => setOpenPill(openPill === 'price' ? null : 'price')}
          onClose={() => setOpenPill(null)}
        >
          <PriceGroup selected={filter.price} onToggle={togglePrice} />
        </FilterPill>

        <button
          onClick={() => navigate({ decaf: !filter.decaf })}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
            filter.decaf
              ? 'border-foreground bg-foreground text-background'
              : 'border-border hover:border-foreground/40'
          }`}
        >
          디카페인
        </button>

        <FilterPill
          id="region"
          label="지역"
          count={filter.regions.length}
          open={openPill === 'region'}
          onToggle={() => setOpenPill(openPill === 'region' ? null : 'region')}
          onClose={() => setOpenPill(null)}
        >
          <RegionGroup selected={filter.regions} onToggle={toggleRegion} />
        </FilterPill>

        <FilterPill
          id="tag"
          label="태그"
          count={filter.tags.length}
          open={openPill === 'tag'}
          onToggle={() => setOpenPill(openPill === 'tag' ? null : 'tag')}
          onClose={() => setOpenPill(null)}
        >
          <TagGroup selected={filter.tags} onToggle={toggleTag} />
        </FilterPill>

        {isLoggedIn && (
          <button
            onClick={() => navigate({ rated: !filter.rated })}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              filter.rated
                ? 'border-foreground bg-foreground text-background'
                : 'border-border hover:border-foreground/40'
            }`}
          >
            내가 평가한
          </button>
        )}

        {isFiltered && (
          <button
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화
          </button>
        )}

        <div className="ml-auto">
          <SortSelector sort={sort} />
        </div>
      </div>
    </div>
  )
}

// ── Pill + Dropdown ───────────────────────────────────────────

function FilterPill({
  label,
  count,
  open,
  onToggle,
  onClose,
  children,
}: {
  id?: PillId
  label: string
  count: number
  open: boolean
  onToggle: () => void
  onClose: () => void
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
          count > 0
            ? 'border-foreground bg-foreground text-background'
            : 'border-border hover:border-foreground/40'
        }`}
      >
        {label}
        {count > 0 && <span className="font-medium">{count}</span>}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 min-w-48 rounded-xl border border-border bg-background p-3 shadow-lg">
          {children}
        </div>
      )}
    </div>
  )
}

// ── 필터 그룹 ─────────────────────────────────────────────────

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
      <div className="flex flex-col gap-2.5">
        {PRICE_OPTIONS.map((p) => (
          <div key={p} className="flex items-center gap-2">
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
      <div className="flex items-center gap-2">
        <Checkbox id="decaf" checked={checked} onCheckedChange={onToggle} />
        <Label htmlFor="decaf" className="text-sm cursor-pointer">
          디카페인 가능
        </Label>
      </div>
    </fieldset>
  )
}

function RatedGroup({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">내 평가</legend>
      <div className="flex items-center gap-2">
        <Checkbox id="rated" checked={checked} onCheckedChange={onToggle} />
        <Label htmlFor="rated" className="text-sm cursor-pointer">
          내가 평가한 로스터리만
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
      <div className="grid grid-cols-3 gap-x-4 gap-y-2.5">
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

function TagGroup({ selected, onToggle }: { selected: string[]; onToggle: (t: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">태그</legend>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {CHARACTERISTIC_TAGS.map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <Checkbox
              id={`tag-${t}`}
              checked={selected.includes(t)}
              onCheckedChange={() => onToggle(t)}
            />
            <Label htmlFor={`tag-${t}`} className="text-sm cursor-pointer">
              {t}
            </Label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}
