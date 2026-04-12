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
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) {
    return <div className="h-10 w-full rounded-lg bg-border" />
  }

  return (
    <div className="flex w-full overflow-hidden rounded-lg border border-border bg-surface">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          className={cn(
            'flex flex-1 cursor-pointer items-center justify-center py-2.5 transition-colors',
            theme === value
              ? 'bg-action text-action-text'
              : 'text-text-disabled hover:bg-border hover:text-text-primary'
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}
