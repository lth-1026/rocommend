import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BREWING_METHODS, BREWING_METHOD_LABELS, type BrewingMethod } from '@/types/onboarding'

const EQUIPMENT_METHODS = BREWING_METHODS.filter((m) => m !== 'NONE')

interface Q1BrewingMethodProps {
  selected: BrewingMethod[]
  onChange: (value: BrewingMethod[]) => void
  onNext: () => void
}

export function Q1BrewingMethod({ selected, onChange, onNext }: Q1BrewingMethodProps) {
  function toggle(method: BrewingMethod) {
    if (method === 'NONE') {
      onChange(selected.includes('NONE') ? [] : ['NONE'])
      return
    }
    const withoutNone = selected.filter((m) => m !== 'NONE')
    if (withoutNone.includes(method)) {
      onChange(withoutNone.filter((m) => m !== method))
    } else {
      onChange([...withoutNone, method])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          어떤 방법으로 커피를 즐기시나요?
        </h2>
        <p className="mt-1 text-sm text-text-secondary">해당하는 것을 모두 선택해주세요</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {EQUIPMENT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => toggle(method)}
              className={cn(
                'rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                selected.includes(method)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-text-primary hover:border-primary/50'
              )}
            >
              {BREWING_METHOD_LABELS[method]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => toggle('NONE')}
          className={cn(
            'w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
            selected.includes('NONE')
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-text-primary hover:border-primary/50'
          )}
        >
          {BREWING_METHOD_LABELS['NONE']}
        </button>
      </div>

      <Button className="w-full" size="lg" onClick={onNext} disabled={selected.length === 0}>
        다음
      </Button>
    </div>
  )
}
