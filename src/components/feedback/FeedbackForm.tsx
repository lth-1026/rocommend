'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { submitFeedback } from '@/actions/feedback'

interface FeedbackFormProps {
  onSuccess: () => void
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('내용을 입력해 주세요.')
      return
    }

    startTransition(async () => {
      const result = await submitFeedback({
        content: content.trim(),
        category: category.trim() || undefined,
      })
      if (result.success) {
        toast.success('의견을 남겼어요. 감사합니다!')
        onSuccess()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback-category" className="text-sm font-medium">
          카테고리 <span className="font-normal text-text-secondary">(선택, 최대 50자)</span>
        </label>
        <input
          id="feedback-category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          maxLength={50}
          placeholder="예: 버그 제보, 기능 제안, 기타"
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm placeholder:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback-content" className="text-sm font-medium">
          내용 <span className="font-normal text-text-secondary">(최대 1000자)</span>
        </label>
        <textarea
          id="feedback-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={6}
          placeholder="불편한 점, 개선 아이디어, 오류 등 자유롭게 남겨 주세요."
          className="w-full resize-none rounded-md border border-border bg-bg px-3 py-2 text-sm placeholder:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-right text-xs text-text-secondary">{content.length} / 1000</p>
      </div>

      <Button
        type="submit"
        disabled={isPending || !content.trim()}
        className="w-full bg-action text-action-text hover:opacity-80"
      >
        {isPending ? '전송 중...' : '의견 보내기'}
      </Button>
    </form>
  )
}
