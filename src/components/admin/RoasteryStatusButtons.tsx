'use client'

import { useTransition } from 'react'
import {
  softDeleteRoastery,
  restoreRoastery,
  toggleHideRoastery,
  closeRoastery,
  reopenRoastery,
} from '@/actions/admin'

interface Props {
  roasteryId: string
  deletedAt: Date | null
  hidden: boolean
  closedAt: Date | null
}

export function RoasteryStatusButtons({ roasteryId, deletedAt, hidden, closedAt }: Props) {
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
        onClick={() => run(() => restoreRoastery(roasteryId))}
        className="text-xs text-blue-600 hover:underline disabled:opacity-50 cursor-pointer"
      >
        복원
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => run(() => toggleHideRoastery(roasteryId))}
        className="text-xs text-text-sub hover:text-text disabled:opacity-50 cursor-pointer transition-colors"
      >
        {hidden ? '숨기기 해제' : '숨기기'}
      </button>
      {closedAt ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => reopenRoastery(roasteryId))}
          className="text-xs text-text-sub hover:text-text disabled:opacity-50 cursor-pointer transition-colors"
        >
          재개업
        </button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => closeRoastery(roasteryId))}
          className="text-xs text-amber-600 hover:underline disabled:opacity-50 cursor-pointer"
        >
          폐업
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm('소프트 삭제하면 일반 사용자에게 완전히 숨겨집니다. 계속하시겠습니까?'))
            return
          run(() => softDeleteRoastery(roasteryId))
        }}
        className="text-xs text-destructive hover:underline disabled:opacity-50 cursor-pointer"
      >
        삭제
      </button>
    </div>
  )
}
