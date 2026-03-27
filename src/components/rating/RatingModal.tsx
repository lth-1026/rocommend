'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RatingForm } from './RatingForm'
import { DeleteRatingDialog } from './DeleteRatingDialog'
import { Button } from '@/components/ui/button'

interface RatingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roasteryId: string
  roasteryName: string
  existingScore?: number
  existingComment?: string
  onSuccess: () => void
}

export function RatingModal({
  open,
  onOpenChange,
  roasteryId,
  roasteryName,
  existingScore,
  existingComment,
  onSuccess,
}: RatingModalProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleSuccess() {
    onOpenChange(false)
    onSuccess()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{existingScore ? '평가 수정' : '평가하기'}</DialogTitle>
            <p className="text-sm text-muted-foreground">{roasteryName}</p>
          </DialogHeader>

          <RatingForm
            roasteryId={roasteryId}
            initialScore={existingScore ?? 0}
            initialComment={existingComment ?? ''}
            onSuccess={handleSuccess}
          />

          {existingScore && (
            <div className="border-t pt-3 mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive w-full"
                onClick={() => setDeleteOpen(true)}
              >
                평가 삭제
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteRatingDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        roasteryId={roasteryId}
        onSuccess={handleSuccess}
      />
    </>
  )
}
