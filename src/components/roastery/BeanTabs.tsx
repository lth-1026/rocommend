'use client'

interface BeanTabItem {
  id: string
  name: string
}

interface BeanTabsProps {
  beans: BeanTabItem[]
  selectedBeanId: string | null
  onSelect: (beanId: string) => void
}

export function BeanTabs({ beans, selectedBeanId, onSelect }: BeanTabsProps) {
  if (beans.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {beans.map((bean) => {
        const isSelected = bean.id === selectedBeanId
        return (
          <button
            key={bean.id}
            type="button"
            onClick={() => onSelect(bean.id)}
            className={[
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-surface text-foreground hover:bg-muted',
            ].join(' ')}
          >
            {bean.name}
          </button>
        )
      })}
    </div>
  )
}
