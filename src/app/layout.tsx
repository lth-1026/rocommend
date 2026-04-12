import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { auth } from '@/lib/auth'
import { SessionProvider } from '@/components/layout/SessionProvider'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rocommend',
  description: '취향에 맞는 스페셜티 커피 로스터리 추천',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* FOUC 방지 — hydration 전에 저장된 테마 적용 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'system';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.setAttribute('data-theme',r);})();`,
          }}
        />
      </head>
      <body>
        <SessionProvider session={session}>
          <ThemeProvider>
            {children}
            <Toaster position="top-center" richColors />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
