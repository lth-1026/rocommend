import { Navigation } from '@/components/layout/Navigation'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navigation />
      {/* 모바일: BottomTab 높이(64px)만큼 하단 패딩 */}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
    </div>
  )
}
