'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { checkNicknameAvailable, updateNickname } from '@/actions/user'

interface NicknameEditFormProps {
  currentNickname: string | null
}

export function NicknameEditForm({ currentNickname }: NicknameEditFormProps) {
  const [nickname, setNickname] = useState(currentNickname ?? '')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const isDirty = nickname.trim() !== (currentNickname ?? '')

  function handleChange(val: string) {
    setNickname(val)
    setSaved(false)
    setError(null)

    const trimmed = val.trim()
    if (trimmed === (currentNickname ?? '') || trimmed.length < 2) {
      setAvailable(true)
      setChecking(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }

    setChecking(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const ok = await checkNicknameAvailable(trimmed)
      setAvailable(ok)
      setChecking(false)
    }, 400)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateNickname({ nickname })
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
      <label className="text-sm font-medium text-text-primary">닉네임</label>
      <div className="flex gap-2">
        <Input
          value={nickname}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="닉네임을 입력하세요"
          maxLength={20}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isPending || !isDirty || checking || !available || nickname.trim().length < 2}
          className="shrink-0"
        >
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
      <p className="text-xs h-4">
        {checking && <span className="text-text-secondary">확인 중...</span>}
        {!checking && isDirty && nickname.trim().length >= 2 && (
          <span className={available ? 'text-success' : 'text-error'}>
            {available ? '사용할 수 있는 닉네임이에요' : '이미 사용 중인 닉네임이에요'}
          </span>
        )}
        {error && <span className="text-error">{error}</span>}
        {saved && <span className="text-success">저장됐습니다.</span>}
      </p>
    </form>
  )
}
