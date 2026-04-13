'use client'

import { useRouter } from 'next/navigation'
import { FeedbackForm } from './FeedbackForm'

export function FeedbackPageClient() {
  const router = useRouter()

  return <FeedbackForm onSuccess={() => router.back()} />
}
