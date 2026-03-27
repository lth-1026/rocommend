import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BeanForm } from '@/components/admin/BeanForm'

export default async function NewBeanPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/home')

  const roasteries = await prisma.roastery.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/beans" className="text-sm text-text-sub hover:text-text">
          ← 목록
        </Link>
        <h1 className="text-2xl font-bold text-text">새 원두 등록</h1>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <BeanForm roasteries={roasteries} />
      </div>
    </div>
  )
}
