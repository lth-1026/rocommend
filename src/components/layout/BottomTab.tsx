'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Coffee, Bookmark, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/home', label: '홈', Icon: Home },
  { href: '/roasteries', label: '로스터리', Icon: Coffee },
  { href: '/bookmarks', label: '즐겨찾기', Icon: Bookmark },
  { href: '/profile', label: '프로필', Icon: User },
]

export function BottomTab({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface',
        className
      )}
    >
      <ul className="flex h-16 items-center">
        {tabs.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                  isActive ? 'text-text-primary' : 'text-text-disabled hover:text-text-secondary'
                )}
              >
                <Icon
                  className={cn('size-5', isActive ? 'stroke-[2.5]' : 'stroke-[1.5]')}
                />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
