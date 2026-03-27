import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAdminBean } from '@/actions/admin'
import { BeanForm } from '@/components/admin/BeanForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBeanPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/home')

  const { id } = await params
  const [bean, roasteries] = await Promise.all([
    getAdminBean(id),
    prisma.roastery.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!bean) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/beans" className="text-sm text-text-sub hover:text-text">
          ← 목록
        </Link>
        <h1 className="text-2xl font-bold text-text">원두 수정</h1>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <BeanForm
          roasteries={roasteries}
          beanId={bean.id}
          initialData={{
            roasteryId: bean.roasteryId,
            name: bean.name,
            origins: bean.origins,
            roastingLevel: bean.roastingLevel,
            decaf: bean.decaf,
            cupNotes: bean.cupNotes,
            imageUrl: bean.imageUrl ?? '',
          }}
        />
      </div>
    </div>
  )
}
