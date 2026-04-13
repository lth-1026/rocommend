import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'

// Defense-in-depth: 미들웨어 외 서버 컴포넌트에서 role 재검증
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/home')

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-semibold text-text">
              관리자
            </Link>
            <Link href="/admin/roasteries" className="text-sm text-text-sub hover:text-text">
              로스터리
            </Link>
            <Link href="/admin/sections" className="text-sm text-text-sub hover:text-text">
              추천 섹션
            </Link>
            <Link href="/admin/settings" className="text-sm text-text-sub hover:text-text">
              설정
            </Link>
          </nav>
          <Link href="/home" className="text-xs text-text-sub hover:text-text">
            ← 서비스로 돌아가기
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
