'use client'

import { useEffect } from 'react'
import { setRoasteriesView } from '@/lib/roasteriesState'

export function RoasteriesViewTracker({ view }: { view: 'list' | 'map' }) {
  useEffect(() => {
    setRoasteriesView(view)
  }, [view])
  return null
}
