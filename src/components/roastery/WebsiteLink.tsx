'use client'

import { logClientEvent } from '@/actions/events'

interface WebsiteLinkProps {
  href: string
  roasteryId: string
}

export function WebsiteLink({ href, roasteryId }: WebsiteLinkProps) {
  const handleClick = () => {
    logClientEvent({ event: 'purchase_link_clicked', payload: { roasteryId } })
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="text-sm text-info underline-offset-4 hover:underline"
    >
      웹사이트 방문
    </a>
  )
}
