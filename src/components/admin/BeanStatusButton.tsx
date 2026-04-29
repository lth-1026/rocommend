'use client'

import { useTransition } from 'react'
import { softDeleteBean, restoreBean, toggleHideBean } from '@/actions/admin'

interface Props {
  beanId: string
  deletedAt: Date | null
  hidden: boolean
}

export function BeanStatusButton({ beanId, deletedAt, hidden }: Props) {
  const [isPending, startTransition] = useTransition()

  const run = (action: () => Promise<unknown>) => {
    startTransition(async () => {
      await action()
    })
  }

  if (deletedAt) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => run(() => restoreBean(beanId))}
        className="text-xs text-blue-600 hover:underline disabled:opacity-50 cursor-pointer"
      >
        복원
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => run(() => toggleHideBean(beanId))}
        className="text-xs text-text-sub hover:text-text disabled:opacity-50 cursor-pointer transition-colors"
      >
        {hidden ? '숨기기 해제' : '숨기기'}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm('이 원두를 삭제하시겠습니까?')) return
          run(() => softDeleteBean(beanId))
        }}
        className="text-xs text-destructive hover:underline disabled:opacity-50 cursor-pointer"
      >
        삭제
      </button>
    </div>
  )
}
