import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Roastery {
  id: string
  name: string
  tags: { id: string; name: string; category: string }[]
}

interface Q5RoasteriesProps {
  roasteries: Roastery[]
  selected: string[]
  onChange: (value: string[]) => void
  onSubmit: () => void
  onBack: () => void
  isLoading: boolean
}

const MIN_SELECTIONS = 3

export function Q5Roasteries({
  roasteries,
  selected,
  onChange,
  onSubmit,
  onBack,
  isLoading,
}: Q5RoasteriesProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const isReady = selected.length >= MIN_SELECTIONS

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">좋아하는 로스터리를 골라주세요</h2>
        <p className="mt-1 text-sm text-text-secondary">
          최소 3개 이상 선택해주세요 ({selected.length}개 선택됨)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {roasteries.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => toggle(r.id)}
            disabled={isLoading}
            className={cn(
              'rounded-xl border px-3 py-3 text-left transition-colors',
              selected.includes(r.id)
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <p
              className={cn(
                'text-sm font-medium',
                selected.includes(r.id) ? 'text-primary' : 'text-text-primary'
              )}
            >
              {r.name}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {r.tags.find((t) => t.category === 'REGION')?.name ?? ''}
            </p>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isLoading}
          className="shrink-0"
        >
          이전
        </Button>
        <Button className="flex-1" size="lg" onClick={onSubmit} disabled={!isReady || isLoading}>
          {isLoading ? '저장 중...' : '완료 및 제출'}
        </Button>
      </div>
    </div>
  )
}
