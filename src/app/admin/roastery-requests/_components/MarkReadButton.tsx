'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { updateRoasteryRequestStatus } from '@/actions/roastery-request'

interface MarkReadButtonProps {
  id: string
  status: 'PENDING' | 'READ'
}

export function MarkReadButton({ id, status }: MarkReadButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle() {
    const next = status === 'PENDING' ? 'READ' : 'PENDING'
    startTransition(async () => {
      const result = await updateRoasteryRequestStatus(id, next)
      if (result.success) {
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
        status === 'PENDING'
          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          : 'bg-green-100 text-green-800 hover:bg-green-200'
      }`}
    >
      {status === 'PENDING' ? '미확인' : '확인됨'}
    </button>
  )
}
