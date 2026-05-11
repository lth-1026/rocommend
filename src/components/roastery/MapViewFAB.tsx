'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'

interface Props {
  mapUrl: string
}

const FAB_CLASS =
  'lg:hidden fixed bottom-[calc(var(--bottom-tab-height)+env(safe-area-inset-bottom,0px)+20px)] right-page-edge z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors'

// iOS Safari에서 position:fixed 요소가 overflow-y-auto 컨테이너 안에 있으면
// 첫 탭이 스크롤 컨테이너를 활성화하는 데 소비돼 클릭이 지연된다.
// 클라이언트 전환 후 document.body portal로 이동해 컨테이너 밖에 배치한다.
// SSR/hydration 단계는 <Link>로 서버 렌더링해 hydration mismatch와 접근성 손실을 방지한다.
export function MapViewFAB({ mapUrl }: Props) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const router = useRouter()

  if (!isClient) {
    return (
      <Link
        href={mapUrl}
        className={FAB_CLASS}
        style={{ touchAction: 'manipulation' }}
        aria-label="지도로 보기"
      >
        <MapPin className="size-6" />
      </Link>
    )
  }

  return createPortal(
    <button
      onClick={() => router.push(mapUrl)}
      className={FAB_CLASS}
      style={{ touchAction: 'manipulation' }}
      aria-label="지도로 보기"
    >
      <MapPin className="size-6" />
    </button>,
    document.body
  )
}
