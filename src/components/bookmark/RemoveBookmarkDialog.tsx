'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { removeBookmark } from '@/actions/bookmark'

interface RemoveBookmarkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roasteryId: string
  roasteryName: string
  onSuccess: () => void
}

export function RemoveBookmarkDialog({
  open,
  onOpenChange,
  roasteryId,
  roasteryName,
  onSuccess,
}: RemoveBookmarkDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      const result = await removeBookmark({ roasteryId })
      if (result.success) {
        toast.success('즐겨찾기에서 제거했어요.')
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>즐겨찾기 해제</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{roasteryName}</span>을(를) 즐겨찾기에서 제거할까요?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleRemove} disabled={isPending}>
            {isPending ? '제거 중...' : '제거'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
