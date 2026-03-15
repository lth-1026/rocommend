'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteAccount } from '@/actions/user'

export function DeleteAccountDialog() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleConfirm = () => {
    setError(null)
    startTransition(async () => {
      const result = await deleteAccount()
      if (!result.success) setError(result.error)
    })
  }

  return (
    <Dialog>
      <DialogTrigger
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg"
      >
        회원 탈퇴
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>정말 탈퇴하시겠어요?</DialogTitle>
          <DialogDescription>
            탈퇴하면 평가, 즐겨찾기 등 모든 데이터가 삭제되며 복구할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-error">{error}</p>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />} disabled={isPending}>
            취소
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? '처리 중...' : '탈퇴하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
