'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'

export type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  mounted: boolean
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') return getSystemTheme()
  return theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [{ theme, mounted }, setState] = useState<{ theme: Theme; mounted: boolean }>({
    theme: 'light',
    mounted: false,
  })

  // 마운트 후 localStorage와 동기화 (FOUC는 layout.tsx 인라인 스크립트가 처리)
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ theme: stored ?? 'light', mounted: true })
  }, [])

  // system 모드일 때 미디어 쿼리 변화 감지
  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (next: Theme) => {
    setState((prev) => ({ ...prev, theme: next }))
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', resolveTheme(next))
  }

  const resolvedTheme: ResolvedTheme = typeof window !== 'undefined' ? resolveTheme(theme) : 'light'

  return (
    <MotionConfig reducedMotion="user">
      <ThemeContext.Provider value={{ theme, resolvedTheme, mounted, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </MotionConfig>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
