'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { StarSelector } from './StarSelector'
import { upsertRating } from '@/actions/rating'

interface RatingFormProps {
  roasteryId: string
  initialScore?: number
  initialComment?: string
  onSuccess: () => void
}

export function RatingForm({ roasteryId, initialScore = 0, initialComment = '', onSuccess }: RatingFormProps) {
  const [score, setScore] = useState(initialScore)
  const [comment, setComment] = useState(initialComment)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (score === 0) {
      toast.error('별점을 선택해주세요.')
      return
    }

    startTransition(async () => {
      const result = await upsertRating({ roasteryId, score, comment: comment.trim() || undefined })
      if (result.success) {
        toast.success('평가가 저장됐어요.')
        onSuccess()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <StarSelector value={score} onChange={setScore} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="comment" className="text-sm font-medium">
          한줄평 <span className="text-muted-foreground font-normal">(선택, 최대 100자)</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={100}
          rows={3}
          placeholder="이 로스터리에 대한 한 줄 평가를 남겨보세요."
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground text-right">{comment.length} / 100</p>
      </div>

      <Button type="submit" disabled={isPending || score === 0} className="w-full">
        {isPending ? '저장 중...' : '평가 저장'}
      </Button>
    </form>
  )
}
