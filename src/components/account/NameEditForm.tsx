'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateName } from '@/actions/user'

interface NameEditFormProps {
  currentName: string | null
}

export function NameEditForm({ currentName }: NameEditFormProps) {
  const [name, setName] = useState(currentName ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isDirty = name.trim() !== (currentName ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateName({ name })
      if (result.success) {
        setSaved(true)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-text-primary">이름</label>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false) }}
          placeholder="이름을 입력하세요"
          maxLength={20}
          className="h-10 flex-1"
        />
        <Button type="submit" disabled={isPending || !isDirty} className="shrink-0">
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      {saved && <p className="text-sm text-success">저장됐습니다.</p>}
    </form>
  )
}
