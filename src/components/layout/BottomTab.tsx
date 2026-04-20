'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, Coffee, Bookmark, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const authTabs = [
  { href: '/', label: '홈', Icon: Home },
  { href: '/roasteries', label: '로스터리', Icon: Coffee },
  { href: '/bookmarks', label: '즐겨찾기', Icon: Bookmark },
  { href: '/profile', label: '프로필', Icon: User },
]

const guestTabs = [
  { href: '/', label: '홈', Icon: Home },
  { href: '/roasteries', label: '로스터리', Icon: Coffee },
  { href: '/settings', label: '설정', Icon: Settings },
]

export function BottomTab({ className }: { className?: string }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const tabs = session?.user ? authTabs : guestTabs

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface',
        'pb-[env(safe-area-inset-bottom,0px)]',
        className
      )}
    >
      <ul className="flex h-16 w-full">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <li key={href} className="flex flex-1 items-center justify-center">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 text-xs font-medium transition-colors',
                  isActive ? 'text-text-primary' : 'text-text-disabled hover:text-text-secondary'
                )}
              >
                <Icon className={cn('size-5', isActive ? 'stroke-[2.5]' : 'stroke-[1.5]')} />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
