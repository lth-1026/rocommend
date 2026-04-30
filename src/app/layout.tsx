import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { auth } from '@/lib/auth'
import { SessionProvider } from '@/components/layout/SessionProvider'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://rocommend.com'),
  title: {
    default: 'roco',
    template: '%s | roco',
  },
  description: '취향에 맞는 스페셜티 커피 로스터리 추천 서비스',
  openGraph: {
    siteName: 'roco',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image'],
  },
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
            {process.env.NEXT_PUBLIC_GA_ID && (
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            )}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
