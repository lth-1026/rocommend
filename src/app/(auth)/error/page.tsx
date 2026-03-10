import Link from 'next/link'
import { ErrorAlert } from '@/components/auth/ErrorAlert'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function ErrorPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold text-text-primary">로그인 오류</h1>
      </div>

      {error && <ErrorAlert error={error} />}

      <Link
        href="/login"
        className="block text-center text-sm text-text-secondary underline underline-offset-4 hover:text-text-primary"
      >
        로그인 페이지로 돌아가기
      </Link>
    </div>
  )
}
