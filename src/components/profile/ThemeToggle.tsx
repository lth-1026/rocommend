'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg"
    >
      <span>{isDark ? '다크 모드' : '라이트 모드'}</span>
      {isDark ? (
        <Moon className="size-4 text-text-secondary" />
      ) : (
        <Sun className="size-4 text-text-secondary" />
      )}
    </button>
  )
}
