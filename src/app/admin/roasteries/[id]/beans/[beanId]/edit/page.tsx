import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getAdminBean, getAdminRoastery } from '@/actions/admin'
import { BeanForm } from '@/components/admin/BeanForm'

interface Props {
  params: Promise<{ id: string; beanId: string }>
}

export default async function EditBeanPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/')

  const { id, beanId } = await params
  const [roastery, bean] = await Promise.all([getAdminRoastery(id), getAdminBean(beanId)])

  if (!roastery || !bean || bean.roasteryId !== id) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/admin/roasteries/${id}`} className="text-sm text-text-sub hover:text-text">
          ← {roastery.name}
        </Link>
        <h1 className="text-2xl font-bold text-text">원두 수정</h1>
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <BeanForm
          roasteries={[]}
          beanId={bean.id}
          fixedRoasteryId={id}
          redirectTo={`/admin/roasteries/${id}`}
          channels={roastery.channels.map((c) => ({ id: c.id, channelKey: c.channelKey }))}
          initialData={{
            roasteryId: bean.roasteryId,
            name: bean.name,
            origins: bean.origins,
            roastingLevel: bean.roastingLevel,
            decaf: bean.decaf,
            cupNotes: bean.cupNotes,
            imageUrl: bean.imageUrl ?? '',
            prices: bean.channelPrices,
          }}
        />
      </div>
    </div>
  )
}
