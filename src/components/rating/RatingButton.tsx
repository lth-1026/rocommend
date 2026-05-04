'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { RatingModal } from './RatingModal'

interface RatingButtonProps {
  roasteryId: string
  roasteryName: string
  existingScore?: number
  existingComment?: string
}

export function RatingButton({
  roasteryId,
  roasteryName,
  existingScore,
  existingComment,
}: RatingButtonProps) {
  const [open, setOpen] = useState(false)
  const [currentScore, setCurrentScore] = useState(existingScore)
  const [currentComment, setCurrentComment] = useState(existingComment)
  const { status } = useSession()
  const router = useRouter()

  const isLoggedIn = status === 'authenticated'

  function handleClick() {
    if (status === 'loading') return
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    setOpen(true)
  }

  function handleSuccess(score?: number, comment?: string) {
    setCurrentScore(score)
    setCurrentComment(comment)
    window.dispatchEvent(new CustomEvent('roco:rating-changed', { detail: { roasteryId } }))
  }

  return (
    <>
      <Button variant={currentScore ? 'secondary' : 'default'} onClick={handleClick}>
        {currentScore ? `내 평가: ${currentScore}점 ★` : '평가하기'}
      </Button>

      {isLoggedIn && (
        <RatingModal
          open={open}
          onOpenChange={setOpen}
          roasteryId={roasteryId}
          roasteryName={roasteryName}
          existingScore={currentScore}
          existingComment={currentComment}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
