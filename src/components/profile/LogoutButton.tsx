'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: '/login' })}
      className="w-full cursor-pointer rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-error transition-colors hover:bg-bg"
    >
      로그아웃
    </button>
  )
}
