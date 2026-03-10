import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FREQUENCIES, FREQUENCY_LABELS, type Frequency } from '@/types/onboarding'

interface Q4FrequencyProps {
  selected: Frequency | null
  onChange: (value: Frequency) => void
  onNext: () => void          // FIRST_TIME 외: Q5로 이동
  onSubmitEarly: () => void   // FIRST_TIME: 제출
}

export function Q4Frequency({ selected, onChange, onNext, onSubmitEarly }: Q4FrequencyProps) {
  const isFirstTime = selected === 'FIRST_TIME'

  function handleAction() {
    if (isFirstTime) {
      onSubmitEarly()
    } else {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">얼마나 자주 원두를 구매하시나요?</h2>
        <p className="mt-1 text-sm text-text-secondary">하나를 선택해주세요</p>
      </div>

      <div className="space-y-3">
        {FREQUENCIES.map((freq) => (
          <button
            key={freq}
            type="button"
            onClick={() => onChange(freq)}
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
              selected === freq
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-text-primary hover:border-primary/50',
            )}
          >
            {FREQUENCY_LABELS[freq]}
          </button>
        ))}
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleAction}
        disabled={selected === null}
      >
        {isFirstTime ? '완료 및 제출' : '다음'}
      </Button>
    </div>
  )
}
