'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ThemeToggle } from '@/components/profile/ThemeToggle'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { cn } from '@/lib/utils'

const authNavLinks = [
  { href: '/home', label: '홈' },
  { href: '/roasteries', label: '로스터리' },
  { href: '/bookmarks', label: '즐겨찾기' },
]

const guestNavLinks = [
  { href: '/home', label: '홈' },
  { href: '/roasteries', label: '로스터리' },
]

export function Header({ className }: { className?: string }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const navLinks = session?.user ? authNavLinks : guestNavLinks
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <>
      <header
        className={cn('sticky top-0 z-40 w-full border-b border-border bg-surface', className)}
      >
        <div className="page-wrapper flex h-14 items-center justify-between">
          {/* 로고 */}
          <Link href="/home" className="flex items-center gap-2">
            <Image
              src="/brand/logo.svg"
              alt="roco"
              width={24}
              height={24}
              className="dark:hidden"
            />
            <Image
              src="/brand/logo-reversed.svg"
              alt="roco"
              width={24}
              height={24}
              className="hidden dark:block"
            />
            <span className="text-lg font-bold text-text-primary">roco</span>
          </Link>

          {/* 네비게이션 링크 */}
          <nav className="flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-text-primary',
                  pathname.startsWith(href) ? 'text-text-primary' : 'text-text-secondary'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* 우측 영역 */}
          {session?.user ? (
            /* 로그인: 아바타 드롭다운 */
            <DropdownMenu>
              <DropdownMenuTrigger className="flex size-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="프로필"
                    width={32}
                    height={32}
                    className="size-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-medium text-text-secondary">
                    {session.user.name?.[0] ?? '?'}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">
                    프로필
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <ThemeToggle />
                </div>
                <div className="px-2 py-0.5">
                  <FeedbackButton onOpenModal={() => setFeedbackOpen(true)} />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => signOut({ redirectTo: '/login' })}
                >
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* 비로그인: ⋮ 드롭다운 + 로그인 버튼 */
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex size-8 cursor-pointer items-center justify-center rounded-md text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <MoreVertical className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <ThemeToggle />
                  </div>
                  <div className="px-2 py-0.5">
                    <FeedbackButton onOpenModal={() => setFeedbackOpen(true)} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                href="/login"
                className="rounded-md bg-action px-3 py-1.5 text-sm font-medium text-action-text transition-opacity hover:opacity-80"
              >
                로그인
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Feedback Dialog — DropdownMenu 바깥에 위치시켜 포커스 트랩 충돌 방지 */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>의견 남기기</DialogTitle>
          </DialogHeader>
          <FeedbackForm onSuccess={() => setFeedbackOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
