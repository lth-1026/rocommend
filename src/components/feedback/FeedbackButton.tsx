'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { MessageSquare } from 'lucide-react'

interface FeedbackButtonProps {
  onOpenModal?: () => void
}

export function FeedbackButton({ onOpenModal }: FeedbackButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()

  function handleClick() {
    if (!session?.user) {
      toast.error('로그인 후 이용할 수 있어요.')
      return
    }
    if (!onOpenModal || window.innerWidth < 768) {
      router.push('/feedback')
      return
    }
    onOpenModal()
  }

  return (
    <button
      onClick={handleClick}
      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-primary transition-colors hover:bg-border"
    >
      <MessageSquare className="size-4 text-text-secondary" />
      의견 남기기
    </button>
  )
}
