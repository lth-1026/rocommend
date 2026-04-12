'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { MessageSquare } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FeedbackForm } from './FeedbackForm'

export function FeedbackButton() {
  const { data: session } = useSession()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)

  function handleClick() {
    if (!session?.user) {
      toast.error('로그인 후 이용할 수 있어요.')
      return
    }
    if (window.innerWidth < 768) {
      router.push('/feedback')
      return
    }
    setModalOpen(true)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-text-primary transition-colors hover:bg-border rounded-md"
      >
        <MessageSquare className="size-4 text-text-secondary" />
        의견 남기기
      </button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>의견 남기기</DialogTitle>
          </DialogHeader>
          <FeedbackForm onSuccess={() => setModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
