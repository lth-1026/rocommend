import type { Metadata } from 'next'
import { LoginButton } from '@/components/auth/LoginButton'
import { ErrorAlert } from '@/components/auth/ErrorAlert'
import { BackLink } from '@/components/auth/BackLink'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ error?: string; provider?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, provider } = await searchParams

  return (
    <div className="w-full max-w-sm space-y-8">
      <BackLink />
      {/* 로고 + 슬로건 */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-text-primary">roco</h1>
        <p className="text-sm text-text-secondary">
          취향에 맞는 스페셜티 커피 로스터리를 찾아보세요
        </p>
      </div>

      {error && <ErrorAlert error={error} provider={provider} />}

      {/* 소셜 로그인 버튼 */}
      <div className="space-y-3">
        <LoginButton provider="google" />
        <LoginButton provider="kakao" />
        <LoginButton provider="naver" />
      </div>
    </div>
  )
}
