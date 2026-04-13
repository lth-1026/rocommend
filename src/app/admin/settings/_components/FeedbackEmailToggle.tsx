'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { toggleFeedbackEmail } from '@/actions/admin'

interface FeedbackEmailToggleProps {
  userId: string
  enabled: boolean
}

export function FeedbackEmailToggle({ userId, enabled }: FeedbackEmailToggleProps) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleFeedbackEmail(userId)
      if (!result.success) toast.error(result.error)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={enabled ? '수신 끄기' : '수신 켜기'}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
        enabled ? 'bg-action' : 'bg-border'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
