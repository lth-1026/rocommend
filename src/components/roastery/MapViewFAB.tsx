'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

interface Props {
  mapUrl: string
}

const FAB_CLASS =
  'lg:hidden fixed bottom-[calc(var(--bottom-tab-height)+env(safe-area-inset-bottom,0px)+20px)] right-page-edge z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors'

// iOS Safari: position:fixed 요소가 overflow-y-auto 컨테이너 위에 시각적으로 올라가 있으면
// <button onClick>은 first-tap을 scroll layer 인식에 소비한다.
// <Link>(→ <a>)는 iOS가 네이티브 인터랙티브 요소로 처리해 이 문제가 없다.
// SSR은 hydration mismatch 방지를 위해 portal 없이 <Link>로 렌더링하고,
// 클라이언트 전환 후 document.body portal로 이동해 main scroll context에서 완전히 분리한다.
export function MapViewFAB({ mapUrl }: Props) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const fab = (
    <Link
      href={mapUrl}
      className={FAB_CLASS}
      style={{ touchAction: 'manipulation' }}
      aria-label="지도로 보기"
    >
      <MapPin className="size-6" />
    </Link>
  )

  if (!isClient) return fab

  return createPortal(fab, document.body)
}
