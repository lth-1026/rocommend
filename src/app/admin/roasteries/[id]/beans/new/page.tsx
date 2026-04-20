import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getAdminRoastery } from '@/actions/admin'
import { BeanForm } from '@/components/admin/BeanForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function NewBeanPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/')

  const { id } = await params
  const roastery = await getAdminRoastery(id)
  if (!roastery) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/admin/roasteries/${id}`} className="text-sm text-text-sub hover:text-text">
          ← {roastery.name}
        </Link>
        <h1 className="text-2xl font-bold text-text">새 원두 등록</h1>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <BeanForm
          roasteries={[]}
          fixedRoasteryId={id}
          redirectTo={`/admin/roasteries/${id}`}
          channels={roastery.channels.map((c) => ({ id: c.id, channelKey: c.channelKey }))}
        />
      </div>
    </div>
  )
}
