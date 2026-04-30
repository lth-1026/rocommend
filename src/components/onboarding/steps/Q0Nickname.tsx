'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { checkNicknameAvailable, updateNickname } from '@/actions/user'

interface Q0NicknameProps {
  initialNickname: string
  onNext: () => void
}

export function Q0Nickname({ initialNickname, onNext }: Q0NicknameProps) {
  const [nickname, setNickname] = useState(initialNickname)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(val: string) {
    setNickname(val)
    setError(null)

    const trimmed = val.trim()
    if (trimmed === initialNickname || trimmed.length < 2) {
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

  async function handleNext() {
    const trimmed = nickname.trim()
    if (!trimmed || !available) return

    setError(null)
    setIsSaving(true)

    if (trimmed !== initialNickname) {
      const result = await updateNickname({ nickname: trimmed })
      if (!result.success) {
        setError(result.error)
        setIsSaving(false)
        return
      }
    }

    onNext()
  }

  const isDisabled = isSaving || checking || !available || nickname.trim().length < 2

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">닉네임을 정해볼까요?</h2>
        <p className="mt-1 text-sm text-text-secondary">
          커피 향미에서 영감을 받은 닉네임이에요. 원하시면 바꿀 수 있어요.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          value={nickname}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="닉네임을 입력하세요"
          maxLength={20}
          className="text-base"
        />
        <p className="text-xs h-4">
          {checking && <span className="text-text-secondary">확인 중...</span>}
          {!checking && nickname.trim().length >= 2 && nickname.trim() !== initialNickname && (
            <span className={available ? 'text-success' : 'text-error'}>
              {available ? '사용할 수 있는 닉네임이에요' : '이미 사용 중인 닉네임이에요'}
            </span>
          )}
          {error && <span className="text-error">{error}</span>}
        </p>
      </div>

      <Button className="w-full" size="lg" onClick={handleNext} disabled={isDisabled}>
        {isSaving ? '저장 중...' : '다음'}
      </Button>
    </div>
  )
}
