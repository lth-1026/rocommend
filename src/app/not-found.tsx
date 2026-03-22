import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg text-text-primary">
      <p className="text-text-secondary text-sm">404</p>
      <h1 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <Link
        href="/home"
        className="text-sm text-text-secondary underline underline-offset-4 hover:text-text-primary"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
