'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 항상 'light'로 초기화 — FOUC는 layout.tsx 인라인 스크립트가 처리
  // hydration mismatch 방지 (서버/클라이언트 초기값 통일)
  const [theme, setTheme] = useState<Theme>('light')

  // 마운트 후 localStorage와 DOM 동기화 (toggle 없이 페이지 이동 시에도 테마 유지)
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored && stored !== theme) {
      setTheme(stored)
    }
  // theme을 의존성에 포함하면 무한루프 — 마운트 시 1회만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
