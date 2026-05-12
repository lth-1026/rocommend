'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, Coffee, LayoutList, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRoasteriesView } from '@/lib/roasteriesState'

export function BottomTab({ className }: { className?: string }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const roasteriesHref = getRoasteriesView() === 'map' ? '/roasteries?view=map' : '/roasteries'

  const authTabs = [
    { key: '/', href: '/', label: '홈', Icon: Home },
    { key: '/roasteries', href: roasteriesHref, label: '로스터리', Icon: Coffee },
    { key: '/activity', href: '/activity', label: '내 활동', Icon: LayoutList },
    { key: '/profile', href: '/profile', label: '프로필', Icon: User },
  ]

  const guestTabs = [
    { key: '/', href: '/', label: '홈', Icon: Home },
    { key: '/roasteries', href: roasteriesHref, label: '로스터리', Icon: Coffee },
    { key: '/settings', href: '/settings', label: '설정', Icon: Settings },
  ]

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
        {tabs.map(({ key, href, label, Icon }) => {
          const isActive = key === '/' ? pathname === '/' : pathname.startsWith(key)
          return (
            <li key={key} className="relative flex flex-1 items-center justify-center">
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
              )}
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
