'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, Coffee, LayoutList, User, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SPRING_SNAPPY, TAP_SCALE } from '@/lib/motion'

const authTabs = [
  { href: '/', label: '홈', Icon: Home },
  { href: '/roasteries', label: '로스터리', Icon: Coffee },
  { href: '/activity', label: '내 활동', Icon: LayoutList },
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
            <li key={href} className="relative flex flex-1 items-center justify-center">
              {/* layoutId로 활성 탭 이동 시 인디케이터가 spring으로 슬라이드 */}
              {isActive && (
                <motion.div
                  layoutId="bottom-tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary"
                  transition={SPRING_SNAPPY}
                />
              )}
              <motion.div whileTap={TAP_SCALE} transition={SPRING_SNAPPY}>
                <Link
                  href={href}
                  className={cn(
                    'flex flex-col items-center gap-1 text-xs font-medium transition-colors',
                    isActive ? 'text-text-primary' : 'text-text-disabled hover:text-text-secondary'
                  )}
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                    transition={SPRING_SNAPPY}
                  >
                    <Icon className={cn('size-5', isActive ? 'stroke-[2.5]' : 'stroke-[1.5]')} />
                  </motion.div>
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              </motion.div>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
