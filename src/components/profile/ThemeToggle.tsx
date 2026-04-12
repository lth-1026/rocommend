'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '@/components/layout/ThemeProvider'
import { cn } from '@/lib/utils'

const options: { value: Theme; label: string; Icon: React.ElementType }[] = [
  { value: 'light', label: '라이트', Icon: Sun },
  { value: 'dark', label: '다크', Icon: Moon },
  { value: 'system', label: '시스템', Icon: Monitor },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex w-full overflow-hidden rounded-lg border border-border bg-surface">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors',
            theme === value
              ? 'bg-bg text-text-primary'
              : 'text-text-disabled hover:text-text-secondary'
          )}
        >
          <Icon className="size-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
