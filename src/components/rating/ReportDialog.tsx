'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { reportRating } from '@/actions/rating'

const REASONS = [
  { value: 'SPAM', label: '스팸' },
  { value: 'INAPPROPRIATE', label: '부적절한 내용' },
  { value: 'OTHER', label: '기타' },
] as const

type ReasonValue = (typeof REASONS)[number]['value']

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ratingId: string
}

export function ReportDialog({ open, onOpenChange, ratingId }: ReportDialogProps) {
  const [selected, setSelected] = useState<ReasonValue | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit() {
    if (!selected) return
    setPending(true)
    const result = await reportRating({ ratingId, reason: selected })
    setPending(false)
    if (result.success) {
      toast.success('신고가 접수되었습니다')
      onOpenChange(false)
      setSelected(null)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setSelected(null)
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>한줄평 신고</DialogTitle>
          <DialogDescription>신고 사유를 선택해주세요</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {REASONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelected(value)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-left transition-colors border ${
                selected === value
                  ? 'border-[var(--color-action)] bg-[var(--color-action)]/5 font-medium'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)]'
              }`}
            >
              <span
                className={`size-4 rounded-full border-2 flex-shrink-0 ${
                  selected === value
                    ? 'border-[var(--color-action)] bg-[var(--color-action)]'
                    : 'border-[var(--color-border)]'
                }`}
              />
              {label}
            </button>
          ))}
        </div>

        <Button onClick={handleSubmit} disabled={!selected || pending} className="mt-2">
          {pending ? '제출 중...' : '신고하기'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
