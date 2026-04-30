import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface LoginCTASectionProps {
  title: string
}

export function LoginCTASection({ title }: LoginCTASectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="page-wrapper text-base font-semibold">{title}</h2>
      <div className="relative overflow-hidden">
        {/* 블러 배경 — 스켈레톤 카드 3개 */}
        <div className="flex gap-3 px-4 md:px-6 select-none pointer-events-none blur-sm">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-44 shrink-0 rounded-xl border border-border bg-surface p-3">
              <Skeleton className="mb-3 h-24 w-full rounded-lg" />
              <Skeleton className="mb-1.5 h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>

        {/* 로그인 유도 오버레이 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/70 backdrop-blur-[2px]">
          <p className="text-sm font-medium text-text">
            로그인하면 내 취향 맞춤 추천을 받을 수 있어요
          </p>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </section>
  )
}
