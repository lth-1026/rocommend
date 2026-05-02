'use client'

import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { Bookmark } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleBookmark } from '@/actions/bookmark'
import { cn } from '@/lib/utils'
import { SPRING_SNAPPY, SPRING_POP, TAP_SCALE } from '@/lib/motion'

interface BookmarkButtonProps {
  roasteryId: string
  initialIsBookmarked: boolean
  className?: string
}

export function BookmarkButton({
  roasteryId,
  initialIsBookmarked,
  className,
}: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isBookmarked, addOptimistic] = useOptimistic(
    initialIsBookmarked,
    (_: boolean, next: boolean) => next
  )

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      addOptimistic(!isBookmarked)
      const result = await toggleBookmark({ roasteryId })
      if (!result.success) {
        toast.error(result.error)
      }
    })
  }

  return (
    <motion.button
      type="button"
      aria-label={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      disabled={isPending}
      onClick={handleClick}
      whileTap={TAP_SCALE}
      transition={SPRING_SNAPPY}
      className={cn(
        'flex items-center justify-center rounded-full p-1.5',
        'hover:bg-muted disabled:pointer-events-none',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isBookmarked ? 'bookmarked' : 'unbookmarked'}
          initial={{ scale: 0.4, rotate: isBookmarked ? -25 : 25, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={SPRING_POP}
          className="flex"
        >
          <Bookmark
            className={cn(
              'size-5',
              isBookmarked ? 'fill-primary stroke-primary' : 'stroke-muted-foreground'
            )}
          />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
