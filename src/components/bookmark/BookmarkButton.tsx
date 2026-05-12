'use client'

import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { Bookmark } from 'lucide-react'
import { toggleBookmark } from '@/actions/bookmark'
import { cn } from '@/lib/utils'

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
    <button
      type="button"
      aria-label={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      aria-pressed={isBookmarked}
      disabled={isPending}
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center rounded-full p-1.5',
        'hover:bg-muted disabled:pointer-events-none active:scale-[0.88] transition-transform duration-100',
        className
      )}
    >
      <Bookmark
        className={cn(
          'size-5',
          isBookmarked ? 'fill-primary stroke-primary' : 'stroke-muted-foreground'
        )}
      />
    </button>
  )
}
