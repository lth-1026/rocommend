'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RatingModal } from './RatingModal'

interface RatingButtonProps {
  roasteryId: string
  roasteryName: string
  isLoggedIn: boolean
  existingScore?: number
  existingComment?: string
}

export function RatingButton({
  roasteryId,
  roasteryName,
  isLoggedIn,
  existingScore,
  existingComment,
}: RatingButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleClick() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    setOpen(true)
  }

  return (
    <>
      <Button variant={existingScore ? 'secondary' : 'default'} onClick={handleClick}>
        {existingScore ? `내 평가: ${existingScore}점 ★` : '평가하기'}
      </Button>

      {isLoggedIn && (
        <RatingModal
          open={open}
          onOpenChange={setOpen}
          roasteryId={roasteryId}
          roasteryName={roasteryName}
          existingScore={existingScore}
          existingComment={existingComment}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
