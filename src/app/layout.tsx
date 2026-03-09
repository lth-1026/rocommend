import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rocommend',
  description: '취향에 맞는 스페셜티 커피 로스터리 추천',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
