'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'

interface Props {
  mapUrl: string
}

// iOS Safari에서 position:fixed 요소가 overflow-y-auto 컨테이너 안에 있으면
// 첫 탭이 스크롤 컨테이너를 활성화하는 데 소비돼 클릭이 지연된다.
// document.body 레벨로 portal 렌더링해 scroll 컨테이너 밖에 배치한다.
export function MapViewFAB({ mapUrl }: Props) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const router = useRouter()

  if (!isClient) return null

  return createPortal(
    <button
      onClick={() => router.push(mapUrl)}
      className="lg:hidden fixed bottom-[calc(var(--bottom-tab-height)+env(safe-area-inset-bottom,0px)+20px)] right-page-edge z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
      style={{ touchAction: 'manipulation' }}
      aria-label="지도로 보기"
    >
      <MapPin className="size-6" />
    </button>,
    document.body
  )
}
