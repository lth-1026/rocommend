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
import { deleteRating } from '@/actions/rating'

interface DeleteRatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roasteryId: string
  onSuccess: () => void
}

export function DeleteRatingDialog({
  open,
  onOpenChange,
  roasteryId,
  onSuccess,
}: DeleteRatingDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRating({ roasteryId })
      if (result.success) {
        toast.success('평가가 삭제됐어요.')
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
          <DialogTitle>평가 삭제</DialogTitle>
          <DialogDescription>
            이 로스터리에 남긴 평가를 삭제할까요? 되돌릴 수 없어요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
