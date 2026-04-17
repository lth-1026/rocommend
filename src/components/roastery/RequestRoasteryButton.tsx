'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { PlusCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { submitRoasteryRequest } from '@/actions/roastery-request'

export function RequestRoasteryButton() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleOpen() {
    if (!session?.user) {
      toast.error('로그인 후 요청할 수 있어요.')
      return
    }
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    startTransition(async () => {
      const result = await submitRoasteryRequest({ name: name.trim() })
      if (result.success) {
        toast.success('요청을 보냈어요. 검토 후 추가할게요!')
        setName('')
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <PlusCircle className="size-4" />
        찾는 로스터리가 없나요?
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>로스터리 추가 요청</DialogTitle>
            <DialogDescription>
              등록을 원하는 로스터리 이름을 알려주세요. 검토 후 추가할게요.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="roastery-name" className="text-sm font-medium">
                로스터리 이름
              </label>
              <input
                id="roastery-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                placeholder="예: 블루보틀 성수점"
                autoFocus
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm placeholder:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="w-full bg-action text-action-text hover:opacity-80"
            >
              {isPending ? '전송 중...' : '요청 보내기'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
