import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PRICE_RANGES, PRICE_RANGE_LABELS, type OnboardingPriceRange } from '@/types/onboarding'

interface Q3PriceRangeProps {
  selected: OnboardingPriceRange[]
  onChange: (value: OnboardingPriceRange[]) => void
  onNext: () => void
}

export function Q3PriceRange({ selected, onChange, onNext }: Q3PriceRangeProps) {
  function toggle(range: OnboardingPriceRange) {
    if (range === 'NO_PREFERENCE') {
      // NO_PREFERENCE 선택 시 나머지 해제
      onChange(selected.includes('NO_PREFERENCE') ? [] : ['NO_PREFERENCE'])
      return
    }
    // LOW/MID/HIGH 선택 시 NO_PREFERENCE 해제
    const withoutNoPreference = selected.filter((p) => p !== 'NO_PREFERENCE')
    if (withoutNoPreference.includes(range)) {
      onChange(withoutNoPreference.filter((p) => p !== range))
    } else {
      onChange([...withoutNoPreference, range])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">선호하는 가격대가 있나요?</h2>
        <p className="mt-1 text-sm text-text-secondary">
          200g 기준. 해당하는 것을 모두 선택해주세요
        </p>
      </div>

      <div className="space-y-3">
        {PRICE_RANGES.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => toggle(range)}
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
              selected.includes(range)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-text-primary hover:border-primary/50'
            )}
          >
            {PRICE_RANGE_LABELS[range]}
          </button>
        ))}
      </div>

      <Button className="w-full" size="lg" onClick={onNext} disabled={selected.length === 0}>
        다음
      </Button>
    </div>
  )
}
