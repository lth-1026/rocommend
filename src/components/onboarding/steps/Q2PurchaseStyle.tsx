import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PURCHASE_STYLES, PURCHASE_STYLE_LABELS, type PurchaseStyle } from '@/types/onboarding'

interface Q2PurchaseStyleProps {
  selected: PurchaseStyle | null
  onChange: (value: PurchaseStyle) => void
  onNext: () => void
}

export function Q2PurchaseStyle({ selected, onChange, onNext }: Q2PurchaseStyleProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">원두를 어디서 구매하시나요?</h2>
        <p className="mt-1 text-sm text-text-secondary">하나를 선택해주세요</p>
      </div>

      <div className="space-y-3">
        {PURCHASE_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => onChange(style)}
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
              selected === style
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-text-primary hover:border-primary/50'
            )}
          >
            {PURCHASE_STYLE_LABELS[style]}
          </button>
        ))}
      </div>

      <Button className="w-full" size="lg" onClick={onNext} disabled={selected === null}>
        다음
      </Button>
    </div>
  )
}
