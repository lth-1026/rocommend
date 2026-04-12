'use client'

import { useRouter } from 'next/navigation'

export function BackLink() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors w-fit cursor-pointer"
    >
      ← 뒤로 가기
    </button>
  )
}
